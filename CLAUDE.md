# Uprizz website: editing guide for Claude

This is the uprizz.com website. It's a static site with no framework. It's hosted on GitHub Pages; a GitHub Actions workflow runs the page generator and deploys on every commit to `main`, so changes go live at https://uprizz.com within a few minutes.

The owner does not write code. They describe changes in plain language, such as "change the hero headline", "swap the second project photo for this one" or "add a fifth service". Make the change, keep the design intact, commit with a clear message, push to `main`, and confirm in one or two sentences what changed.

## Content lives in two JSON files (edited from the CMS)

The owner edits the site in the **CMS at uprizz.com/admin/** (Framer-style: collections, item editor, image uploads, Preview, Publish, History/Undo). It writes only these files, plus new images in `images/cms/` and `images/projects/<slug>/`:

| File | What it holds |
|---|---|
| `_build/content.json` | Every piece of homepage text, image and list: `seo`, `hero` (incl. stars + news strip), `logos`, `work` (heading/buttons), `comparison` (title, columns, highlight, rows), `process` (heading + `steps`), `pricing` (heading + `plans`), `testimonials` (heading + `items`), `faq` (heading + `items`), `contact` (email, phone, address, socials, footer links). |
| `_build/projects.json` | Projects (name, slug, category, year, scope, timeline, intro, challenge/solution/process/conclusion paragraphs, optional `cover` path, `gallery` of `{file, shape}`, `featured`, `draft`). Projects with `"draft": true` ("Hide from site" in the CMS) are skipped by the build. New projects made with the CMS's “New project” button go to the top of the list, so they show first on the Work page. `file`/`cover` may be a bare file name (inside `images/projects/<slug>/`) or a full `images/...` path. |

`_build/build.py` renders `content.json` into the `<!-- CMS:name -->` … `<!-- /CMS:name -->` blocks of `index.html` (navmeta, hero, logos, workhead, workcta, compare, process, pricing, testimonials, faq, footer) and the homepage SEO tags. **Never edit inside those blocks by hand — edit `content.json` and run the build.** The GitHub Actions deploy runs the build too, so a CMS publish that only changes JSON still updates the site.

## Files

| File | What it holds |
|---|---|
| `index.html` | Page layout and head; the CMS blocks above are generated. The comparison, pricing and FAQ blocks also sit inside `<!-- COMPARE:START -->`, `<!-- PRICING:START -->`, `<!-- FAQ:START -->` markers because the build reuses them on other pages. |
| `js/main.js` | Interactions only (sticky step cards, testimonial carousel, FAQ accordion, news ticker, waves, scroll reveals). It no longer holds content. |
| `css/style.css` | Colors, fonts, spacing and animation styles. Colors are variables at the top (`--bg` cream, `--card`, `--ink`, `--accent` orange). Fonts: `--serif` (ABC Arizona Flare Light, headings) and `--sans` (Suisse BP Int'l, everything else); see the note at the top of the file about adding the licensed web-font files. |
| `admin/index.html` | The CMS. Schema for each collection/section is the `COLLECTIONS` / `SECTIONS` objects in its script; add a field there when you add one to `content.json`. |
| `admin/ai.html` | The older AI editor (comments + "ask Claude"), linked from the CMS sidebar. |
| `images/` | Every image. CMS uploads get unique names (`images/cms/…`, `images/projects/<slug>/…`). |
| `CNAME` | Must contain exactly `uprizz.com`. Never delete it, or the custom domain disconnects. |
| `.nojekyll` | Keep it. It tells GitHub Pages to serve files as they are. |

## How to make common changes

- **Any homepage text, image, logo, testimonial, FAQ, price, step or contact detail:** edit `_build/content.json` (or tell the owner they can do it in the CMS), then run `python3 _build/build.py`.
- **Hero wave:** the moving wave behind the hero and the comparison card is WebGL; colours, height, speed and softness are in the `WAVES` object in `js/main.js` (`images/hero-bg.jpg` / `images/compare-bg.jpg` show if WebGL is unavailable).
- **Buttons:** `class="btn"` (light pill, for colourful backgrounds) or `class="btn btn--outline"` (thin stroke, for light backgrounds). The hover arrow is automatic.
- **Logo:** the Uprizz logo is built into `index.html` (the `.brandmark` style). Favicon files sit at the top level.
- **Headings** use line breaks in the JSON (`\n`); the build turns them into ` <br> ` for the word-by-word reveal.
- **Replace an image:** upload in the CMS, or save under a new name and point the JSON at it. JPEG, at most 1800px on the long side, under about 400 KB. Project covers about 16:10, project cards 1.1:1.
- **Homepage projects:** the three projects with `"featured": true` in `_build/projects.json`.
- **Forms:** the contact form only shows a "thanks" message and sends nothing. If the owner wants real submissions, connect a form service such as Formspree, and tell them which free account they need to create.
- **Deleting a project in the CMS** leaves its old generated page folder `projects/<slug>/` in the repo (no longer linked or in the sitemap). Delete the folder by hand when tidying up.

## Pages and the project generator

| Page | File | Built how |
|---|---|---|
| Home | `index.html` | Edited by hand. The "Selected Work" grid between `<!-- WORK:START -->` and `<!-- WORK:END -->` is generated. |
| All Works | `work/index.html` | Generated |
| Each project | `projects/<slug>/index.html` | Generated |
| Pricing | `pricing/index.html` | Generated from the homepage pricing + comparison + FAQ blocks |
| Comparison | `comparison/index.html` | Generated from the homepage comparison + pricing + FAQ blocks |
| Sitemap | `sitemap.xml` | Generated |

- **Project content lives in `_build/projects.json`** (name, category, year, scope tags, timeline, intro, challenge, solution, process, conclusion, gallery list). Never edit the generated project pages directly.
- **Project images:** `images/projects/<slug>/cover.jpg` (16:10, about 1400px wide) plus gallery files `01.jpg`, `02.jpg`… Each gallery entry in the JSON has `"shape": "landscape"` or `"portrait"`. Landscape photos alternate between full-width and paired; portraits are always paired side by side.
- **After any change** to `projects.json`, project images, or the shared homepage parts (menu, comparison, pricing, FAQ, footer), run `python3 _build/build.py`, then commit everything it changed.
- **Add a project:** add an object to `projects.json` (the order there is the order on the Work page; mark it `"featured": true` to show it on the homepage, max 3), add the images, then run the build.
- **Remove a project:** delete it from the JSON, delete `projects/<slug>/` and `images/projects/<slug>/`, then run the build.
- **Styles:** `css/pages.css` styles the Work and project pages. `js/work.js` handles the Work page filter, search and cursor blobs. `js/main.js` runs on every page and skips parts a page doesn't have.
- **Cache busting:** `build.py` adds `?v=<hash>` to the CSS and JS links on every page, so browsers load new styles right after a deploy. Run the build after changing `css/` or `js/` files.
- **Paths:** subpages use root paths (`/css/...`, `/images/...`). Test with a local server from the site root, for example `python3 -m http.server`, not by opening files directly.


## Admin editor (uprizz.com/admin/)

The CMS (`admin/index.html`) and the older AI editor (`admin/ai.html`) both log in with the same password and publish through the same helper.
- CMS: loads the two JSON files from the GitHub API, keeps unpublished drafts (and new images) in the browser's IndexedDB, previews by running the real `build.py` in the browser with Pyodide, and publishes with `POST /api/publish` (`changes` with the file's current blob sha + `images` as base64). History lists recent commits to the JSON files; Undo calls `/api/undo`.
- AI editor (`admin/ai.html`): pick a page, pin comments, ask Claude for changes, review, publish. The `API` constant near the top of each page's script is the address of the helper.
- `admin-worker/worker.js`: a Cloudflare Worker (the "helper") that holds the secrets (ADMIN_PASSWORD, SESSION_SECRET, ANTHROPIC_API_KEY, GITHUB_TOKEN). It checks the password, stores comments in `_admin/comments.json` and a log of every request (asked, published, discarded, undone) in `_admin/history.json`, runs Claude with read/edit tools over the repo (with prompt caching on the instructions and page files, and the cost of each request shown in the editor), and commits published edits to `main`. To update it, paste the file into the Worker's code editor in the Cloudflare dashboard and deploy.
- `.github/workflows/deploy.yml`: every push to `main` runs `_build/build.py` and deploys the site with GitHub Actions (Pages source must be "GitHub Actions"). `_admin/`, `_build/`, `admin-worker/` and this guide are not published. Commits that only touch `_admin/` don't trigger a deploy.
- Preview before publishing (both editors) runs the real `build.py` in the browser with Pyodide, so keep `build.py` free of non-standard-library imports and tolerant of missing CSS/JS files.
- Protected from the editor: CNAME, .github/, admin/, admin-worker/, _admin/.

## Rules

- Keep the visual style: cream background, blurred orange hero, Arizona Flare headings with Suisse text, rounded cards, the animations. Don't redesign unless asked.
- Keep everything static: no frameworks, no build tools, no npm.
- Before pushing, open the page in a headless browser and look at the sections you changed.
- After pushing, tell the owner the change goes live in a few minutes, and that a hard refresh (Ctrl/Cmd+Shift+R) may be needed.
