#!/usr/bin/env python3
"""
Builds the Uprizz Work page, project pages, Pricing and Comparison pages.

  python3 _build/build.py

Source of truth (both edited from the CMS at uprizz.com/admin/):
  _build/content.json   -> all homepage text, images and lists (hero, logos, comparison, steps,
                           pricing, testimonials, FAQ, contact/footer, SEO). Rendered into the
                           <!-- CMS:name --> blocks of index.html; never edit those blocks by hand.
  _build/projects.json  -> every project's text, scope, year and images
                           ("featured": true marks the 3 projects shown on the homepage)
  index.html            -> page layout and everything outside the CMS blocks

Writes:
  work/index.html                 (All Works page)
  projects/<slug>/index.html      (one page per project)
  pricing/index.html              (Pricing page: pricing + comparison + FAQ from the homepage)
  comparison/index.html           (Comparison page: comparison + pricing + FAQ from the homepage)
  index.html                      (refreshes the homepage "Selected Work" grid)
  sitemap.xml
Run it again after editing projects.json or the shared homepage parts.
"""
import json, re, html, os, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
P = json.load(open('_build/projects.json'))
H = open('index.html').read()
esc = lambda s: html.escape(str(s), quote=True)

# Version stamps for CSS/JS so browsers fetch the new file after every change (cache busting)
import hashlib
def _ver(f):
    try: return hashlib.md5(open(f, 'rb').read()).hexdigest()[:8]
    except OSError: return 'preview'   # in-browser preview builds don't have the CSS/JS files
V = {f: _ver(f) for f in ('css/style.css', 'css/pages.css', 'js/main.js', 'js/work.js')}
H = re.sub(r'(href|src)="(css/style\.css|js/main\.js)(?:\?v=[0-9a-f]+)?"', lambda m: f'{m.group(1)}="{m.group(2)}?v={V[m.group(2)]}"', H)
SITE = 'https://uprizz.com'

# ---------- 0. Homepage content from the CMS (_build/content.json) ----------
C = json.load(open('_build/content.json'))
def tx(v):
    """Escaped text; line breaks in the CMS become <br>."""
    return esc(v).replace('\n', '<br>')
def heading(v):
    """Headings that animate word by word: line breaks become ' <br> '."""
    return ' <br> '.join(esc(x.strip()) for x in str(v).split('\n'))
def src(path):
    path = str(path or '').strip()
    return path if re.match(r'^(https?:)?//', path) else path.lstrip('/')
STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>'
DARKS = ('#1b1b1b', '#000000', '#000', '#171717', '#191919', '#0b0b0b')

def r_navmeta(c):
    k = c['contact']
    socials = '<br>'.join(f'<a href="{esc(x["url"])}">{esc(x["name"])}</a>' for x in k['socials'])
    return (f'<div class="nav-meta">\n'
            f'      <div><h6>Socials</h6>{socials}</div>\n'
            f'      <div><h6>Contacts</h6>{esc(k["phone"])}<br><u><a href="mailto:{esc(k["email"])}">{esc(k["email"])}</a></u></div>\n'
            f'    </div>\n'
            f'    <a href="#contact" class="btn btn--outline">{esc(k["quote_button"])}</a>')

def r_hero(c):
    h = c['hero']; lines = str(h['title']).split('\n')
    title = ' '.join(f'<span class="l l{i+1}"><span>{esc(l.strip())}</span></span>' for i, l in enumerate(lines))
    n = max(0, min(5, int(h.get('stars') or 0)))
    stars = f'\n    <div class="stars" role="img" aria-label="Rated {n} out of 5">{STAR * n}</div>' if n else ''
    sep = ' <span>|</span> ' if h.get('trust') and h.get('tagline') else ''
    tag = f'<em>{esc(h["tagline"])}</em>' if h.get('tagline') else ''
    news = ''
    if h.get('news'):
        link = f' <a href="{esc(h.get("news_link") or "#")}">{esc(h["news_link_text"])}</a>' if h.get('news_link_text') else ''
        news = f'\n  <div class="news" aria-label="News"><div class="news-track" id="newsTrack"><span class="news-item">{esc(h["news"])}{link}{esc(h.get("news_end", ""))}</span></div></div>'
    btn = f'\n    <div class="hero-cta"><a href="{esc(h["button_link"])}" class="btn">{esc(h["button_text"])}</a></div>' if h.get('button_text') else ''
    return (f'<div class="hero-in">\n'
            f'    <p class="eyebrow">{esc(h["eyebrow"])}</p>\n'
            f'    <h1>{title}</h1>{btn}\n'
            f'    <p class="trust">{esc(h["trust"])}{sep}{tag}</p>{stars}\n'
            f'  </div>{news}')

def r_logos(c):
    cards = ''.join(f'<div class="logo-card"><img src="{esc(src(l["image"]))}" alt="{esc(l.get("name", ""))}"></div>' for l in c['logos'] if l.get('image'))
    n = max(1, len([l for l in c['logos'] if l.get('image')]))
    rep = 2 * max(2, -(-10 // n))   # an even number of copies, enough to loop seamlessly
    return (f'<section class="sec clients" id="clients" aria-label="Clients">\n'
            f'  <div class="marquee"><div class="track" id="logoTrack">{cards * rep}</div></div>\n'
            f'</section>')

def r_workhead(c):
    w = c['work']
    return (f'  <div class="shead">\n'
            f'    <span class="kicker">{esc(w["kicker"])}</span>\n'
            f'    <h2 class="h2 reveal">{heading(w["title"])}</h2>\n'
            f'  </div>')

def r_workcta(c):
    w = c['work']
    return f'<div class="center-cta fade"><a href="{esc(w["button_link"])}" class="btn btn--outline">{esc(w["button_text"])}</a></div>' if w.get('button_text') else ''

def r_compare(c):
    m = c['comparison']; cols = m['columns']; hi = m.get('highlight')
    u = lambda i: ' class="u"' if i < len(cols) and cols[i] == hi else ''
    head = ''.join(f'<th scope="col"{u(i)}>{esc(col)}</th>' for i, col in enumerate(cols))
    rows = '\n'.join(f'          <tr><th scope="row">{esc(r["label"])}</th>' + ''.join(f'<td{u(i)}>{esc(v)}</td>' for i, v in enumerate(r['values'])) + '</tr>' for r in m['rows'])
    others = ' and '.join(esc(x) for x in cols if x != hi)
    return (f'<section class="sec compare" id="compare">\n'
            f'  <div class="cmp-card fade">\n'
            f'    <div class="cmp-bg" aria-hidden="true"><canvas class="wave" data-wave="compare"></canvas></div>\n'
            f'    <h2 class="h2 reveal">{heading(m["title"])}</h2>\n'
            f'    <div class="cmp-wrap">\n'
            f'      <table class="cmp">\n'
            f'        <caption class="sr">How {esc(hi or "Uprizz")} compares with {others}</caption>\n'
            f'        <thead><tr><td></td>{head}</tr></thead>\n'
            f'        <tbody>\n{rows}\n        </tbody>\n'
            f'      </table>\n'
            f'    </div>\n'
            f'  </div>\n'
            f'</section>')

def r_process(c):
    pr = c['process']; st = pr['steps']
    nav = '\n'.join(f'      <button type="button" data-step="{i}"' + (' class="on"' if i == 0 else '') + f'><i></i>{esc(s["menu"])}</button>' for i, s in enumerate(st))
    def art(i, s):
        if s.get('image'):
            return f'<div class="pr-art has-img" style="background-image:url({esc(src(s["image"]))})"></div>'
        col = s.get('color') or '#ed6c47'
        dark = ' dark' if col.lower() in DARKS else ''
        return f'<div class="pr-art{dark}" style="background-color:{esc(col)}"><span>{i+1:02d}</span></div>'
    cards = '\n'.join(
        f'      <article class="pr-card"><div class="pr-in">\n'
        f'        <div class="pr-txt"><span class="chip-s">Step {i+1}</span><h3>{esc(s["title"])}</h3><p>{tx(s["text"])}</p></div>\n'
        f'        <div class="pr-media">{art(i, s)}</div>\n'
        f'      </div></article>' for i, s in enumerate(st))
    btn = f'\n    <a href="{esc(pr["button_link"])}" class="btn btn--outline fade">{esc(pr["button_text"])}</a>' if pr.get('button_text') else ''
    return (f'<section class="sec process" id="process">\n'
            f'  <div class="pr-head">\n'
            f'    <h2 class="h2 reveal">{heading(pr["title"])}</h2>{btn}\n'
            f'  </div>\n'
            f'  <div class="pr-body">\n'
            f'    <div class="pr-nav" id="prNav" aria-label="Steps">\n{nav}\n    </div>\n'
            f'    <div class="pr-cards" id="prCards">\n{cards}\n    </div>\n'
            f'  </div>\n'
            f'</section>')

def r_pricing(c):
    pc = c['pricing']
    def plan(p):
        feats = ''.join(f'<li>{esc(f)}</li>' for f in p['features'] if str(f).strip()) + (f'<li class="k">{esc(p["bonus"])}</li>' if p.get('bonus') else '')
        tag = ' blk' if p.get('highlight') else ''
        return (f'    <div class="plan fade">\n'
                f'      <span class="tag{tag}">{esc(p["name"])}</span>\n'
                f'      <div class="price"><b>{esc(p["price"])}</b></div>\n'
                f'      <h6>{esc(p["features_title"])}</h6>\n'
                f'      <ul>{feats}</ul>\n'
                f'      <a href="{esc(p["button_link"])}" class="btn btn--outline cta">{esc(p["button_text"])}</a>\n'
                f'    </div>')
    sub = esc(pc.get('subtitle', '')) + (f' <em>{esc(pc["subtitle_italic"])}</em>' if pc.get('subtitle_italic') else '')
    plans = '\n'.join(plan(p) for p in pc['plans'])
    return (f'<section class="sec pricing" id="pricing">\n'
            f'  <div class="shead">\n'
            f'    <h2 class="h2 reveal">{heading(pc["title"])}</h2>\n'
            f'    <p class="sub fade">{sub}</p>\n'
            f'  </div>\n'
            f'  <div class="plans">\n{plans}\n  </div>\n'
            f'</section>')

def r_testimonials(c):
    t = c['testimonials']; items = t['items']
    avs = ''.join(f'<img src="{esc(src(x["avatar"]))}" alt="">' for x in items[:4] if x.get('avatar'))
    def slide(i, x):
        company = x['role'].split(',')[-1].strip() if x.get('role') else ''
        chip = f'<span class="chip-s">{esc(company)}</span>' if company else ''
        if x.get('photo'):
            media = (f'<div class="t-media"><div class="t-art photo"><img src="{esc(src(x["photo"]))}" alt="{esc(x["name"])}" draggable="false" loading="lazy"></div>'
                     f'<span class="t-name">{esc(x["name"])}</span></div>')
        else:
            img = f'<img src="{esc(src(x["avatar"]))}" alt="{esc(x["name"])}" draggable="false" loading="lazy">' if x.get('avatar') else ''
            media = (f'<div class="t-media" style="background:{esc(x.get("color") or "#ed6c47")}"><div class="t-art">{img}</div>'
                     f'<span class="t-name">{esc(x["name"])}</span></div>')
        return (f'    <div class="t-slide" role="group" aria-roledescription="slide" aria-label="{i+1} of {len(items)}">\n'
                f'      <figure class="t-card">\n'
                f'        <div class="t-txt">{chip}<blockquote>“{esc(x["quote"])}”</blockquote><figcaption class="t-by"><b>{esc(x["name"])}</b><span>{esc(x["role"])}</span></figcaption></div>\n'
                f'        {media}\n'
                f'      </figure></div>')
    slides = '\n'.join(slide(i, x) for i, x in enumerate(items))
    label = esc(str(t['title']).replace('\n', ' '))
    return (f'<section class="sec testi" id="testimonials" aria-roledescription="carousel" aria-label="{label}">\n'
            f'  <div class="shead">\n'
            f'    <div class="avs4 fade" id="tAvatars">{avs}</div>\n'
            f'    <h2 class="h2 reveal">{heading(t["title"])}</h2>\n'
            f'    <div class="t-ctrl fade">\n'
            f'      <button type="button" class="ic" id="tPrev" aria-label="Previous testimonial"><svg viewBox="0 0 14 14"><path d="M12 7H2M6 3L2 7l4 4"/></svg></button>\n'
            f'      <button type="button" class="ic" id="tNext" aria-label="Next testimonial"><svg viewBox="0 0 14 14"><path d="M2 7h10M8 3l4 4-4 4"/></svg></button>\n'
            f'    </div>\n'
            f'  </div>\n'
            f'  <div class="t-view fade" id="tView"><div class="t-track" id="tTrack">\n{slides}\n  </div></div>\n'
            f'</section>')

PLUS = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10.6211 9.5H14.6289V10.5H10.6211V14.6289H9.62109V10.5H5.37109V9.5H9.62109V5.37109H10.6211V9.5Z"/></svg>'
def r_faq(c):
    f = c['faq']
    title = esc(f['title']) + (f' <em>{esc(f["title_italic"])}</em>' if f.get('title_italic') else '')
    qs = '\n'.join(
        f'    <div class="q fade"><button type="button" class="q-top" aria-expanded="false" aria-controls="faq-a{i}" id="faq-q{i}">'
        f'<span class="q-title">{esc(q["question"])}</span><span class="q-icon">{PLUS}</span></button>'
        f'<div class="q-bottom" id="faq-a{i}" role="region" aria-labelledby="faq-q{i}"><div class="q-wrap"><div class="q-content"><p>{tx(q["answer"])}</p></div></div></div></div>'
        for i, q in enumerate(f['items']))
    return (f'<section class="sec faq" id="faq">\n'
            f'  <div class="shead"><h2 class="h2 reveal">{title}</h2></div>\n'
            f'  <div class="qs" id="faqList">\n{qs}\n  </div>\n'
            f'</section>')

def r_footer(c):
    k = c['contact']
    li = lambda href, name: f'      <li><a href="{esc(href)}"><span class="roll"><span data-t="{esc(name)}">{esc(name)}</span></span></a></li>'
    navl = '\n'.join(li(h, n) for h, n in (('#top', 'Home'), ('/work/', 'Work'), ('#process', 'Studio'), ('/pricing/', 'Pricing'), ('#contact', 'Contact')))
    soc = '\n'.join(li(x['url'], x['name']) for x in k['socials'])
    return (f'<footer class="sec footer" id="contact">\n'
            f'  <div class="f-top fade">\n'
            f'    <div class="f-addr">\n'
            f'      <h6>{esc(k["city"])}</h6>\n'
            f'      <p>{tx(k["address"])}</p>\n'
            f'      <b>{esc(k["phone"])}</b>\n'
            f'    </div>\n'
            f'    <div><div class="t">Navigation</div><ul>\n{navl}\n    </ul></div>\n'
            f'    <div><div class="t">Socials</div><ul>\n{soc}\n    </ul></div>\n'
            f'    <form class="f-form" id="contactForm">\n'
            f'      <h3>{esc(k["form_title"])}</h3>\n'
            f'      <label class="field"><span class="sr">Email address</span><input type="email" placeholder="Email Address" required></label>\n'
            f'      <label class="field"><span class="sr">Message</span><input placeholder="Message" required><button class="dot" type="submit" aria-label="Send message"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg></button></label>\n'
            f'      <span class="toast" id="contactToast">Thanks — we\'ll be in touch.</span>\n'
            f'    </form>\n'
            f'  </div>\n'
            f'  <div class="wordmark" id="wordmark"><span><span class="brandmark big" role="img" aria-label="Uprizz"></span></span></div>\n'
            f'  <div class="legal"><div><a href="{esc(k["terms_url"])}">Terms of service</a><a href="{esc(k["privacy_url"])}">Privacy Policy</a></div><span>{esc(k["copyright"])}</span></div>\n'
            f'</footer>')

for name, fn in (('navmeta', r_navmeta), ('hero', r_hero), ('logos', r_logos), ('workhead', r_workhead), ('workcta', r_workcta),
                 ('compare', r_compare), ('process', r_process), ('pricing', r_pricing), ('testimonials', r_testimonials),
                 ('faq', r_faq), ('footer', r_footer)):
    a, b = H.index(f'<!-- CMS:{name} -->'), H.index(f'<!-- /CMS:{name} -->')
    H = H[:a] + f'<!-- CMS:{name} -->\n' + fn(C) + '\n' + H[b:]

# SEO title + description for the homepage
seo = C.get('seo', {})
if seo.get('title'):
    t = esc(seo['title'])
    H = re.sub(r'<title>.*?</title>', lambda m: f'<title>{t}</title>', H, count=1)
    H = re.sub(r'(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*', lambda m: m.group(1) + t, H)
if seo.get('description'):
    d = esc(seo['description'])
    H = re.sub(r'(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*', lambda m: m.group(1) + d, H)

# ---------- 1. Homepage: menu links + Selected Work grid ----------
H = H.replace('<a href="#top">Home</a><a href="#work">Work</a>', '<a href="#top">Home</a><a href="/work/">Work</a>')
def cover(p):
    """Project cover image (CMS uploads set "cover"; default images/projects/<slug>/cover.jpg)."""
    return src(p.get('cover') or f'images/projects/{p["slug"]}/cover.jpg')
def gfile(p, g):
    f = g['file']
    return src(f) if '/' in f else f'images/projects/{p["slug"]}/{f}'
def home_card(p):
    return (f'      <a class="proj fade" href="/projects/{p["slug"]}/"><div class="img par" '
            f'style="background-image:url({cover(p)})"></div><div class="meta"><div>{esc(p["name"])}'
            f'<small>{esc(p["category"])} · {p["year"]}</small></div></div></a>')
FEATURED = [p for p in P if p.get('featured')][:3] or P[:3]
grid = '\n'.join(home_card(p) for p in FEATURED) + f'\n      <div class="see fade"><a href="/work/">{esc(C["work"].get("view_all_text") or "View all")} <span class="arrow">→</span></a></div>'
a, b = H.index('<!-- WORK:START'), H.index('<!-- WORK:END -->')
H = H[:a] + '<!-- WORK:START (generated by _build/build.py) -->\n' + grid + '\n' + H[b:]
open('index.html', 'w').write(H)

# ---------- 2. Shared pieces pulled from the homepage ----------
def between(a, b, s=H, incl=True):
    i = s.index(a); j = s.index(b, i) + (len(b) if incl else 0)
    return s[i:j]
fonts = '\n'.join(re.findall(r'<link (?:rel="preconnect"[^>]*|href="https://[^"]*(?:googleapis|fontshare)[^"]*" rel="stylesheet")>', H))
inline_styles = ''.join(re.findall(r'<style>.*?</style>\n', H.split('</head>')[0], re.S))
svg_filter = between('<svg width="0" height="0"', '</svg>')
nav = between('<nav class="nav" id="nav">', '</nav>')
faq = between('<!-- FAQ:START', '<!-- FAQ:END -->')
compare = between('<!-- COMPARE:START', '<!-- COMPARE:END -->')
pricing = between('<!-- PRICING:START', '<!-- PRICING:END -->')
footer = between('<footer class="sec footer" id="contact">', '</footer>')

def absolutize(s):
    s = re.sub(r'(url\(|src=")images/', r'\1/images/', s)
    return s
def relink(s):
    for a, b in (('href="#top"', 'href="/"'), ('href="#process"', 'href="/#process"'), ('href="#work"', 'href="/#work"'),
                 ('href="#studio"', 'href="/#process"'), ('href="#blog"', 'href="/"')):
        s = s.replace(a, b)
    return s
nav, footer = relink(nav), relink(absolutize(footer))
compare, pricing = absolutize(compare), absolutize(pricing)

def page(title, desc, path, og_img, body, extra_js=''):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Uprizz">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{SITE}{path}"><meta property="og:image" content="{SITE}{og_img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
{fonts}
<link rel="stylesheet" href="/css/style.css?v={V['css/style.css']}">
<link rel="stylesheet" href="/css/pages.css?v={V['css/pages.css']}">
{inline_styles}</head>
<body class="page">
{svg_filter}
{nav}
{body}
{footer}
<script src="/js/main.js?v={V['js/main.js']}"></script>
{extra_js}</body>
</html>
'''

def card(p, extra=''):
    tags = ' '.join(t.lower() for t in p['scope'])
    return (f'<a class="wk-card fade" href="/projects/{p["slug"]}/" data-tags="{esc(tags)}" data-name="{esc(p["name"].lower())}"{extra}>'
            f'<div class="img par" style="background-image:url(/{cover(p)})"></div>'
            f'<div class="meta"><div><b>{esc(p["name"])}</b><small><span>{esc(p["category"])}</span><span>·</span><span>{p["year"]}</span></small></div>'
            f'<span class="plus">+</span></div></a>')

# ---------- 3. Work page ----------
cats = []
for p in P:
    for t in p['scope']:
        if t not in cats: cats.append(t)
options = '\n'.join(f'        <option value="{esc(c.lower())}">{esc(c)}</option>' for c in cats)
work_body = f'''<main>
<header class="wk-hero" id="top">
  <span class="wk-blob b1"></span><span class="wk-blob b2"></span>
  <h1><span class="l"><span>Fewer projects</span></span> <span class="l"><span>deeper work</span></span></h1>
  <div class="wk-side">
    <div><span class="yr">2024-2026©</span><p>Every project here asked for something we hadn't done yet. That's why we took it.</p></div>
    <a href="#all" class="down ink" aria-label="Scroll to projects"></a>
  </div>
</header>
<section class="sec" id="all">
  <div class="wk-bar"><h2>All Projects</h2></div>
  <div class="wk-tools">
    <label class="wk-select"><span class="sr-only" style="position:absolute;left:-9999px">Category</span>
      <select id="wkCat" aria-label="Filter by category">
        <option value="">Category</option>
{options}
      </select>
    </label>
    <label class="wk-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="wkSearch" type="search" placeholder="Search..." aria-label="Search projects"></label>
  </div>
  <div class="wk-list" id="wkList">
{chr(10).join('    ' + card(p) for p in P)}
    <p class="wk-empty" id="wkEmpty">No projects match that filter.</p>
  </div>
</section>
</main>'''
work_js = f'<script src="/js/work.js?v={V["js/work.js"]}"></script>\n'
os.makedirs('work', exist_ok=True)
open('work/index.html', 'w').write(page(
    'Work — Uprizz', 'Selected brand identity, art direction, photography, motion and content-system projects by Uprizz.',
    '/work/', '/og-image.png', work_body, work_js))

# ---------- 4. Project pages ----------
def paras(lst): return ''.join(f'<p>{esc(x)}</p>' for x in lst)
LAYOUT = ['full', 'half', 'half', 'full', 'half', 'half', 'full', 'full']
for i, p in enumerate(P):
    nxt = P[(i + 1) % len(P)]
    gal = [g if isinstance(g, dict) else {'file': g, 'shape': 'landscape'} for g in (p.get('gallery') or [])]
    tiles, i, want_full = [], 0, True
    def tile(g, cls):
        return (f'<div class="g {cls} fade"><div class="img par" style="background-image:'
                f'url(/{gfile(p, g)})"></div></div>')
    while i < len(gal):
        g = gal[i]
        if want_full and g['shape'] == 'landscape':
            tiles.append(tile(g, 'full')); i += 1; want_full = False
        elif i + 1 < len(gal):
            tall = 'portrait' in (g['shape'], gal[i + 1]['shape'])
            cls = 'half tall' if tall else 'half'
            tiles += [tile(g, cls), tile(gal[i + 1], cls)]; i += 2; want_full = True
        else:
            tiles.append(tile(g, 'full')); i += 1
    if not gal:  # no photos yet: neutral placeholders
        tiles = [f'<div class="g {c} fade"><span class="ph">Project image</span></div>' for c in ('full', 'half', 'half', 'full')]
    scope = '<br>'.join(esc(s) for s in p['scope'])
    body = f'''<main>
<section class="pj-top">
  <div class="pj-head">
    <h1>{esc(p["name"])}</h1>
    <div class="pj-meta"><span>(01)</span><span>{esc(p["category"])}</span><span>{p["year"]}</span></div>
  </div>
  <div class="pj-intro fade">
    <div class="label">Introduction</div>
    <p>{esc(p["intro"])}</p>
    <div class="pj-facts">
      <div><div class="label">Scope</div>{scope}</div>
      <div><div class="label">Timeline</div>{esc(p["timeline"])}</div>
    </div>
  </div>
  <div class="pj-cover"><div class="img par" style="background-image:url(/{cover(p)})"></div></div>
</section>

<section class="pj-sec">
  <div class="pj-sech"><span>(02)</span><span>Overview</span></div>
  <div class="pj-row fade"><h3>Challenge</h3><div>{paras(p["challenge"])}</div></div>
  <div class="pj-row fade"><h3>Solution</h3><div>{paras(p["solution"])}</div></div>
  <div class="pj-row fade"><h3>Process</h3><div>{paras(p["process"])}</div></div>
</section>

<section class="pj-gal">
  {chr(10).join('  ' + t for t in tiles).strip()}
</section>

<section class="pj-sec">
  <div class="pj-sech"><span>(03)</span><span>Final Thoughts</span></div>
  <div class="pj-row fade"><h3>Conclusion</h3><div>{paras(p["conclusion"])}</div></div>
</section>

<section class="pj-next">
  <div class="top">
    <div><span class="brandmark" role="img" aria-label="Uprizz"></span><h2>Next Project</h2></div>
    <a href="/work/" class="btn btn--outline">View all</a>
  </div>
  {card(nxt)}
</section>
{faq}
</main>'''
    d = f'projects/{p["slug"]}'
    os.makedirs(d, exist_ok=True)
    desc = p['intro'] if len(p['intro']) <= 158 else p['intro'][:155].rsplit(' ', 1)[0] + '…'
    open(f'{d}/index.html', 'w').write(page(f'{p["name"]} — Uprizz', desc, f'/projects/{p["slug"]}/',
                                            '/' + cover(p), body))

# ---------- 5. Pricing + Comparison pages ----------
def lead(section, cls):
    """Turn a homepage section into the top of a page: extra top space and an <h1>."""
    section = section.replace(f'<section class="sec {cls}"', f'<section class="sec {cls} lead"', 1)
    return re.sub(r'<h2 class="h2([^"]*)">(.*?)</h2>', r'<h1 class="h2\1">\2</h1>', section, count=1, flags=re.S)
no_more = lambda s: re.sub(r'\s*<a class="cmp-more".*?</a>', '', s, flags=re.S)
pages = {
    'pricing': ('Pricing — Uprizz', 'Pick your launch and pay once: Uprizz packages for first-time founders. No subscription, no hidden fees.',
                lead(pricing, 'pricing') + '\n' + no_more(compare).replace('id="compare"', 'id="compare" style="padding-top:120px"')),
    'comparison': ('Uprizz vs DIY tools vs agencies — Uprizz', 'Three ways to launch: DIY and AI tools, a traditional agency, or Uprizz. Compare price, time to launch and risk.',
                   lead(no_more(compare), 'compare') + '\n' + pricing),
}
for slug, (title, desc, body) in pages.items():
    os.makedirs(slug, exist_ok=True)
    open(f'{slug}/index.html', 'w').write(page(title, desc, f'/{slug}/', '/og-image.png', f'<main>\n{body}\n{faq}\n</main>'))

# ---------- 6. Sitemap ----------
today = datetime.date.today().isoformat()
urls = ['/', '/work/', '/pricing/', '/comparison/'] + [f'/projects/{p["slug"]}/' for p in P]
open('sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod></url>\n' for u in urls) + '</urlset>\n')
print('Built work, pricing and comparison pages,', len(P), 'project pages, sitemap with', len(urls), 'URLs')
