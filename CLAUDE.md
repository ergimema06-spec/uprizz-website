# Uprizz website: editing guide for Claude

This is the uprizz.com website. It's a static site with no framework. It's hosted on GitHub Pages; a GitHub Actions workflow runs the page generator and deploys on every commit to `main`, so changes go live at https://uprizz.com within a few minutes.

The owner does not write code. They describe changes in plain language, such as "change the hero headline", "swap the second project photo for this one" or "add a fifth service". Make the change, keep the design intact, commit with a clear message, push to `main`, and confirm in one or two sentences what changed.

## Files

| File | What it holds |
|---|---|
| `index.html` | All page text and the section layout, top to bottom: nav menu → hero → client logos → selected work (3 projects + View all) → comparison table → "Order today, launch in 48 hours" 4-step section → pricing → testimonials carousel → FAQ → footer/contact. The comparison, pricing and FAQ blocks sit between `<!-- COMPARE:START -->`, `<!-- PRICING:START -->` and `<!-- FAQ:START -->` markers because the build reuses them on other pages. |
| `js/main.js` | The lists that are generated in code: `logos`, `testimonials` (+ `testiTones`, the colour behind each photo), `faqs`, plus all interactions: sticky step cards, testimonial carousel, FAQ accordion, scroll reveals. Edit the text in those arrays to change those sections. |
| `css/style.css` | Colors, fonts, spacing and animation styles. Colors are variables at the top (`--bg` cream, `--card`, `--ink`, `--accent` orange). Fonts: `--serif` (ABC Arizona Flare Light, headings) and `--sans` (Suisse BP Int'l, everything else); see the note at the top of the file about adding the licensed web-font files. |
| `images/` | Every image, named after where it's used, such as `work-1-mira-eyewear.jpg` or `service-2-art-direction-b.jpg`. |
| `CNAME` | Must contain exactly `uprizz.com`. Never delete it, or the custom domain disconnects. |
| `.nojekyll` | Keep it. It tells GitHub Pages to serve files as they are. |

## How to make common changes

- **Hero:** text and buttons are in the `<header class="hero">` block of `index.html`. The moving wave behind the hero and behind the comparison card is a WebGL effect; each one's colours, height, speed and softness are in the `WAVES` object in `js/main.js` (`images/hero-bg.jpg` and `images/compare-bg.jpg` show instead if WebGL is unavailable).
- **4-step section:** text is in the `#process` section of `index.html`; the step list on the left must have one button per card, in the same order.
- **Testimonials:** edit the `testimonials` array in `js/main.js`. To show a large photo on a slide instead of the round avatar, save the photo in `images/` (JPEG, about 900px wide, roughly 1.15:1) and put its path in the matching slot of `testiPhotos`.
- **Logo:** the Uprizz logo is built into `index.html` (the `.brandmark` style). Favicon files sit at the top level.

- **Text:** find the words in `index.html`, or in the arrays in `js/main.js` for services, testimonials and FAQ, and replace them. Headings with the `reveal` class use ` <br> ` (with spaces around it) for line breaks. Keep those spaces.
- **Replace an image:** save the new image under the same file name in `images/`, and the page picks it up. Convert it to JPEG, at most 1800px on the long side and under about 400 KB. Crop it to roughly the same shape as the old one: project cards about 1.1:1, the founder portrait about 0.7:1, the video cover about 2.2:1, blog cards about 0.85:1 and 1.6:1.
- **Homepage projects:** the three projects with `"featured": true` in `_build/projects.json` appear on the homepage (generated, don't edit the grid by hand).
- **Add a service, testimonial or FAQ:** add an entry to the matching array in `js/main.js`. Service images follow the `service-N-name-a/b/c.jpg` pattern, referenced through the `IMGS` map at the top of `main.js`. Add new keys there.
- **Contact details:** the email, phone and address appear in the nav menu, the FAQ, the footer, and the `mailto:` links. Update every place.
- **Forms:** the newsletter and contact forms only show a "thanks" message and send nothing. If the owner wants real submissions, connect a form service such as Formspree, and tell them which free account they need to create.


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

A password-protected editor where the owner picks a page, pins comments on it, and asks Claude for changes, then reviews and publishes them.
- `admin/index.html`: the editor page, plain HTML/JS. The `API` constant near the top of its script is the address of the helper.
- `admin-worker/worker.js`: a Cloudflare Worker (the "helper") that holds the secrets (ADMIN_PASSWORD, SESSION_SECRET, ANTHROPIC_API_KEY, GITHUB_TOKEN). It checks the password, stores comments in `_admin/comments.json` and a log of every request (asked, published, discarded, undone) in `_admin/history.json`, runs Claude with read/edit tools over the repo (with prompt caching on the instructions and page files, and the cost of each request shown in the editor), and commits published edits to `main`. To update it, paste the file into the Worker's code editor in the Cloudflare dashboard and deploy.
- `.github/workflows/deploy.yml`: every push to `main` runs `_build/build.py` and deploys the site with GitHub Actions (Pages source must be "GitHub Actions"). `_admin/`, `_build/`, `admin-worker/` and this guide are not published. Commits that only touch `_admin/` don't trigger a deploy.
- Preview before publishing: the editor applies proposed edits in the browser. Homepage edits are swapped in directly; changes to `_build/` run the real `build.py` in the browser with Pyodide (sources fetched from raw.githubusercontent.com), so keep `build.py` free of non-standard-library imports.
- Protected from the editor: CNAME, .github/, admin/, admin-worker/, _admin/.

## Rules

- Keep the visual style: cream background, blurred orange hero, Arizona Flare headings with Suisse text, rounded cards, the animations. Don't redesign unless asked.
- Keep everything static: no frameworks, no build tools, no npm.
- Before pushing, open the page in a headless browser and look at the sections you changed.
- After pushing, tell the owner the change goes live in a few minutes, and that a hard refresh (Ctrl/Cmd+Shift+R) may be needed.
