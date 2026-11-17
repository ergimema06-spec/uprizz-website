/**
 * Uprizz editor helper — a Cloudflare Worker.
 *
 * It keeps the secrets the public website can't hold, and does the work:
 *   POST /api/login     password -> session token (12 hours)
 *   GET  /api/comments  list page comments          (stored in _admin/comments.json in the repo)
 *   POST /api/comments  add / update / delete a comment
 *   POST /api/ask       Ask Claude: Claude reads the page's files and proposes edits (nothing is saved yet)
 *   POST /api/publish   save the proposed edits to GitHub -> the site rebuilds and goes live
 *   POST /api/undo      restore the files changed by a published edit
 *   GET  /api/status    latest change + whether the site is still deploying
 *
 * Secrets (set in Cloudflare → Worker → Settings → Variables and Secrets):
 *   ADMIN_PASSWORD     the editor password
 *   SESSION_SECRET     any long random text (signs login sessions)
 *   ANTHROPIC_API_KEY  key from console.anthropic.com
 *   GITHUB_TOKEN       fine-grained token: Contents read/write + Actions read on the site repo
 * Plain variables (optional): GITHUB_REPO (default ergimema06-spec/uprizz-website),
 *   ALLOWED_ORIGIN (default https://uprizz.com), CLAUDE_MODEL (default claude-sonnet-5-5)
 */

const BRANCH = 'main';
const PROTECTED = [/^CNAME$/, /^\.github\//, /^admin\//, /^admin-worker\//, /^_admin\//, /^\.nojekyll$/];
const PAGE_FILES = {
  home: ['index.html', 'js/main.js', 'css/style.css'],
  work: ['_build/build.py', 'css/pages.css', 'js/work.js'],
  project: ['_build/projects.json', '_build/build.py', 'css/pages.css'],
};
const MAX_TURNS = 10;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = [env.ALLOWED_ORIGIN || 'https://uprizz.com', 'https://www.uprizz.com', 'http://127.0.0.1:8765', 'http://localhost:8765'];
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Vary': 'Origin',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    try {
      const url = new URL(req.url);
      const route = url.pathname.replace(/\/+$/, '');
      if (route === '/api/login' && req.method === 'POST') return json(await login(await req.json(), env));

      if (!(await checkToken(req.headers.get('Authorization'), env))) return json({ error: 'Please log in again.' }, 401);
      const gh = github(env);

      if (route === '/api/comments' && req.method === 'GET') return json(await loadComments(gh));
      if (route === '/api/comments' && req.method === 'POST') return json(await saveComment(gh, await req.json()));
      if (route === '/api/ask' && req.method === 'POST') return json(await ask(gh, env, await req.json()));
      if (route === '/api/publish' && req.method === 'POST') return json(await publish(gh, await req.json()));
      if (route === '/api/undo' && req.method === 'POST') return json(await undo(gh, await req.json()));
      if (route === '/api/status' && req.method === 'GET') return json(await status(gh));
      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: e.message || String(e) }, e.status || 500);
    }
  },
};

/* ---------------- login ---------------- */
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function login({ password }, env) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) throw err(500, 'The editor password has not been set up yet.');
  const a = await hmac(env.SESSION_SECRET, 'pw:' + (password || '')), b = await hmac(env.SESSION_SECRET, 'pw:' + env.ADMIN_PASSWORD);
  if (!safeEqual(a, b)) { await new Promise(r => setTimeout(r, 1200)); throw err(401, 'Wrong password.'); }
  const exp = Date.now() + 12 * 3600 * 1000;
  return { token: exp + '.' + (await hmac(env.SESSION_SECRET, 'session:' + exp)) };
}
async function checkToken(header, env) {
  const t = (header || '').replace(/^Bearer /, '');
  const [exp, sig] = t.split('.');
  if (!exp || !sig || Number(exp) < Date.now() || !env.SESSION_SECRET) return false;
  return safeEqual(sig, await hmac(env.SESSION_SECRET, 'session:' + exp));
}
const err = (status, message) => Object.assign(new Error(message), { status });

/* ---------------- GitHub ---------------- */
function b64encode(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); }
function b64decode(b64) { const s = atob(b64.replace(/\n/g, '')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
const utf8 = { enc: s => new TextEncoder().encode(s), dec: u => new TextDecoder().decode(u) };

function github(env) {
  const repo = env.GITHUB_REPO || 'ergimema06-spec/uprizz-website';
  const api = async (path, opts = {}) => {
    const r = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'uprizz-editor', 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    if (r.status === 404 && opts.allow404) return null;
    if (!r.ok) throw err(r.status === 401 || r.status === 403 ? 502 : r.status, `GitHub said ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return r.status === 204 ? null : r.json();
  };
  return {
    api,
    async read(path, ref = BRANCH) {
      const f = await api(`/contents/${encodePath(path)}?ref=${ref}`, { allow404: true });
      if (!f) return null;
      return { sha: f.sha, text: utf8.dec(b64decode(f.content)) };
    },
    async tree() {
      const t = await api(`/git/trees/${BRANCH}?recursive=1`);
      return t.tree.filter(x => x.type === 'blob').map(x => x.path);
    },
    /** files: [{path, text} | {path, base64} | {path, delete:true}] */
    async commit(files, message) {
      const ref = await api(`/git/ref/heads/${BRANCH}`);
      const head = ref.object.sha;
      const base = await api(`/git/commits/${head}`);
      const tree = [];
      for (const f of files) {
        if (f.delete) { tree.push({ path: f.path, mode: '100644', type: 'blob', sha: null }); continue; }
        const blob = await api('/git/blobs', { method: 'POST', body: JSON.stringify(f.base64 != null ? { content: f.base64, encoding: 'base64' } : { content: f.text, encoding: 'utf-8' }) });
        tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
      }
      const newTree = await api('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: base.tree.sha, tree }) });
      const c = await api('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [head] }) });
      await api(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) });
      return c.sha;
    },
  };
}
const encodePath = p => p.split('/').map(encodeURIComponent).join('/');
const isProtected = p => PROTECTED.some(r => r.test(p)) || p.includes('..') || p.startsWith('/');

/* ---------------- comments ---------------- */
async function loadComments(gh) {
  const f = await gh.read('_admin/comments.json');
  return { comments: f ? JSON.parse(f.text || '[]') : [] };
}
async function saveComment(gh, body) {
  const { comments } = await loadComments(gh);
  let list = comments;
  if (body.action === 'add') {
    const c = body.comment || {};
    list.push({ id: crypto.randomUUID().slice(0, 8), page: String(c.page || '/'), note: String(c.note || '').slice(0, 2000), selector: String(c.selector || '').slice(0, 400),
      snippet: String(c.snippet || '').slice(0, 500), x: Number(c.x) || 0, y: Number(c.y) || 0, status: 'open', created: new Date().toISOString() });
  } else if (body.action === 'update') {
    list = list.map(c => c.id === body.id ? { ...c, ...pick(body.patch || {}, ['note', 'status']) } : c);
  } else if (body.action === 'delete') {
    list = list.filter(c => c.id !== body.id);
  } else throw err(400, 'Unknown comment action.');
  await gh.commit([{ path: '_admin/comments.json', text: JSON.stringify(list, null, 2) + '\n' }], 'Editor: update comments');
  return { comments: list };
}
const pick = (o, keys) => Object.fromEntries(keys.filter(k => k in o).map(k => [k, o[k]]));

/* ---------------- Ask Claude ---------------- */
function pageKind(page) {
  if (page === '/' || page === '/index.html') return 'home';
  if (page.startsWith('/work')) return 'work';
  if (page.startsWith('/projects/')) return 'project';
  return 'home';
}

const TOOLS = [
  { name: 'read_file', description: 'Read a text file from the website repository.', input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
  { name: 'edit_file', description: 'Replace one exact, unique piece of text in a file. old_string must appear exactly once; include enough surrounding text to make it unique. Prefer this over write_file.',
    input_schema: { type: 'object', properties: { path: { type: 'string' }, old_string: { type: 'string' }, new_string: { type: 'string' } }, required: ['path', 'old_string', 'new_string'] } },
  { name: 'write_file', description: 'Create a new text file, or fully replace a small one.', input_schema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
  { name: 'save_attachment', description: 'Save one of the images the owner attached (already converted to JPEG) into the repository, e.g. images/projects/kano/cover.jpg or images/projects/kano/09.jpg.',
    input_schema: { type: 'object', properties: { index: { type: 'integer', description: '0-based attachment index' }, path: { type: 'string' } }, required: ['index', 'path'] } },
];

async function ask(gh, env, body) {
  if (!env.ANTHROPIC_API_KEY) throw err(500, 'The Claude API key has not been set up yet.');
  const page = String(body.page || '/');
  const kind = pageKind(page);
  const attachments = (body.attachments || []).slice(0, 6); // [{name, base64}] jpeg
  const [guide, files, comments] = await Promise.all([
    gh.read('CLAUDE.md'), gh.tree(), body.commentIds?.length ? loadComments(gh) : { comments: [] },
  ]);
  const chosen = comments.comments.filter(c => body.commentIds?.includes(c.id));

  // working copy of files Claude reads or changes
  const original = {}, work = {};
  const load = async p => {
    if (!(p in original)) { const f = await gh.read(p); original[p] = f; work[p] = f ? f.text : null; }
    return work[p];
  };
  const starter = PAGE_FILES[kind];
  for (const p of starter) await load(p);
  const binaries = {}; // path -> base64

  const system = `You are the built-in website editor for uprizz.com, working for the site owner, who does not write code.
They are looking at the page ${page} and ask you to change it. Make the change by editing the repository files with your tools, keeping the existing design and code style intact. Make focused, minimal edits.

Rules:
- Never touch CNAME, .github/, admin/, admin-worker/ or _admin/.
- Generated pages: work/index.html, projects/*/index.html, sitemap.xml and the homepage block between <!-- WORK:START --> and <!-- WORK:END --> are rebuilt automatically from _build/projects.json and _build/build.py when the change is published. Edit those sources, never the generated files.
- Project text, scope, year and gallery live in _build/projects.json. Work page hero text lives in _build/build.py.
- Images the owner attaches are already JPEGs: put them in place with save_attachment, and update projects.json gallery entries ("file" and "shape") when adding gallery photos.
- If the request is unclear or would need something you can't do (for example a new paid service), don't edit; explain briefly and ask.
- Finish with a short plain-language summary (1–4 sentences) of what you changed, written for a non-technical owner. No code in the summary.

Repository guide (CLAUDE.md):
${guide ? guide.text : '(missing)'}

All files in the repository:
${files.filter(p => !p.startsWith('images/') || p.split('/').length < 4).join('\n')}
(plus image files under images/projects/<slug>/)`;

  let intro = `Page being edited: ${page}\n\nThe page's main source files are below.\n`;
  for (const p of starter) intro += `\n=== ${p} ===\n${work[p] ?? '(file does not exist)'}\n`;
  if (chosen.length) {
    intro += `\nThe owner left these comments on the page (address them):\n` + chosen.map((c, i) =>
      `${i + 1}. "${c.note}"\n   pinned on element: ${c.selector}\n   element content: ${c.snippet}`).join('\n');
  }
  const userContent = [];
  attachments.forEach((a, i) => {
    userContent.push({ type: 'text', text: `Attachment ${i} (${a.name}):` });
    userContent.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: a.base64 } });
  });
  userContent.push({ type: 'text', text: intro + `\n\nOwner's request:\n${body.message || '(apply the comments above)'}` });

  const history = (body.history || []).slice(-8).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.text || '') })).filter(m => m.content);
  const messages = [...history, { role: 'user', content: userContent }];
  if (messages[0].role !== 'user') messages.shift();

  let summary = '';
  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: env.CLAUDE_MODEL || 'claude-sonnet-5-5', max_tokens: 16000, system, tools: TOOLS, messages }),
    });
    if (!r.ok) throw err(502, `Claude API error ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const res = await r.json();
    messages.push({ role: 'assistant', content: res.content });
    summary = res.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim() || summary;
    const uses = res.content.filter(b => b.type === 'tool_use');
    if (res.stop_reason !== 'tool_use' || !uses.length) break;

    const results = [];
    for (const u of uses) {
      let out;
      try {
        const p = String(u.input.path || '').replace(/^\/+/, '');
        if (u.name !== 'read_file' && isProtected(p)) throw new Error(`${p} is protected and can't be changed here.`);
        if (u.name === 'read_file') {
          const t = await load(p); out = t == null ? `No file at ${p}.` : t;
        } else if (u.name === 'edit_file') {
          const t = await load(p);
          if (t == null) throw new Error(`No file at ${p}.`);
          const n = t.split(u.input.old_string).length - 1;
          if (n !== 1) throw new Error(n === 0 ? 'old_string was not found. Read the file again and copy the text exactly.' : `old_string appears ${n} times; include more surrounding text.`);
          work[p] = t.replace(u.input.old_string, () => u.input.new_string);
          out = 'Edited.';
        } else if (u.name === 'write_file') {
          await load(p); work[p] = String(u.input.content); out = 'Written.';
        } else if (u.name === 'save_attachment') {
          const a = attachments[u.input.index];
          if (!a) throw new Error('No attachment with that index.');
          if (!/\.jpe?g$/i.test(p)) throw new Error('Save attachments as .jpg files.');
          binaries[p] = a.base64; out = `Saved to ${p}.`;
        } else out = 'Unknown tool.';
        results.push({ type: 'tool_result', tool_use_id: u.id, content: out });
      } catch (e) {
        results.push({ type: 'tool_result', tool_use_id: u.id, content: 'Error: ' + e.message, is_error: true });
      }
    }
    messages.push({ role: 'user', content: results });
  }

  const changes = Object.keys(work).filter(p => work[p] != null && work[p] !== (original[p] ? original[p].text : null))
    .map(p => ({ path: p, before: original[p] ? original[p].text : '', after: work[p], baseSha: original[p] ? original[p].sha : null }));
  const images = Object.entries(binaries).map(([path, base64]) => ({ path, base64 }));
  return { reply: summary || 'Done.', changes, images };
}

/* ---------------- publish / undo / status ---------------- */
async function publish(gh, { changes = [], images = [], summary = '', resolveComments = [] }) {
  if (!changes.length && !images.length) throw err(400, 'Nothing to publish.');
  const files = [];
  for (const c of changes) {
    if (isProtected(c.path)) throw err(400, `${c.path} is protected.`);
    const cur = await gh.read(c.path);
    if ((cur ? cur.sha : null) !== (c.baseSha || null)) throw err(409, `${c.path} changed since Claude looked at it. Ask again to get a fresh edit.`);
    files.push({ path: c.path, text: c.after });
  }
  for (const im of images) {
    if (isProtected(im.path)) throw err(400, `${im.path} is protected.`);
    files.push({ path: im.path, base64: im.base64 });
  }
  if (resolveComments.length) {
    const { comments } = await loadComments(gh);
    files.push({ path: '_admin/comments.json', text: JSON.stringify(comments.map(c => resolveComments.includes(c.id) ? { ...c, status: 'resolved' } : c), null, 2) + '\n' });
  }
  const title = (summary || 'Edit from the Uprizz editor').split('\n')[0].slice(0, 70);
  const sha = await gh.commit(files, `Editor: ${title}\n\n${summary}`);
  return { commit: sha };
}

async function undo(gh, { commit }) {
  if (!/^[0-9a-f]{7,40}$/.test(commit || '')) throw err(400, 'Missing change id.');
  const c = await gh.api(`/commits/${commit}`);
  const parent = c.parents[0].sha;
  const files = [];
  for (const f of c.files) {
    if (f.filename.startsWith('_admin/')) continue;
    const prev = await gh.api(`/contents/${encodePath(f.filename)}?ref=${parent}`, { allow404: true });
    files.push(prev ? { path: f.filename, base64: prev.content.replace(/\n/g, '') } : { path: f.filename, delete: true });
  }
  if (!files.length) throw err(400, 'Nothing to undo.');
  return { commit: await gh.commit(files, `Editor: undo ${commit.slice(0, 7)}`) };
}

async function status(gh) {
  const [commits, runs] = await Promise.all([
    gh.api(`/commits?sha=${BRANCH}&per_page=1`),
    gh.api(`/actions/runs?branch=${BRANCH}&per_page=1`).catch(() => null),
  ]);
  const run = runs && runs.workflow_runs && runs.workflow_runs[0];
  return {
    commit: commits[0] && { sha: commits[0].sha, message: commits[0].commit.message.split('\n')[0], date: commits[0].commit.author.date },
    deploy: run ? { status: run.status, conclusion: run.conclusion, sha: run.head_sha } : null,
  };
}
