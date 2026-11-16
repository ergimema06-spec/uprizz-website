# Uprizz website: editing guide for Claude

This is the uprizz.com website. It's a static site with no build step and no framework. It's hosted on GitHub Pages from the `main` branch, so every commit to `main` goes live at https://uprizz.com within a few minutes.

The owner does not write code. They describe changes in plain language, such as "change the hero headline", "swap the second project photo for this one" or "add a fifth service". Make the change, keep the design intact, commit with a clear message, push to `main`, and confirm in one or two sentences what changed.

## Files

| File | What it holds |
|---|---|
| `index.html` | All page text and the section layout, top to bottom: preloader → nav menu → hero → clients → selected work → what we bring (stats) → services → who we are + process + "How we work" → testimonials → pricing → FAQ → blog + newsletter → footer/contact |
| `js/main.js` | The lists that are generated in code: `logos`, `tools`, `services`, `testimonials`, `faqs`, plus all animations. Edit the text in those arrays to change those sections. |
| `css/style.css` | Colors, fonts, spacing and animation styles. Colors are variables at the top (`--bg`, `--ink`, `--dark`). |
| `images/` | Every image, named after where it's used, such as `work-1-mira-eyewear.jpg` or `service-2-art-direction-b.jpg`. |
| `CNAME` | Must contain exactly `uprizz.com`. Never delete it, or the custom domain disconnects. |
| `.nojekyll` | Keep it. It tells GitHub Pages to serve files as they are. |

## How to make common changes

- **Text:** find the words in `index.html`, or in the arrays in `js/main.js` for services, testimonials and FAQ, and replace them. Headings with the `reveal` class use ` <br> ` (with spaces around it) for line breaks. Keep those spaces.
- **Replace an image:** save the new image under the same file name in `images/`, and the page picks it up. Convert it to JPEG, at most 1800px on the long side and under about 400 KB. Crop it to roughly the same shape as the old one: project cards about 1.1:1, the founder portrait about 0.7:1, the video cover about 2.2:1, blog cards about 0.85:1 and 1.6:1.
- **Add or remove a project:** copy or delete an `<a class="proj ...">` block in the `#work` section and add or remove the matching image file.
- **Add a service, testimonial or FAQ:** add an entry to the matching array in `js/main.js`. Service images follow the `service-N-name-a/b/c.jpg` pattern, referenced through the `IMGS` map at the top of `main.js`. Add new keys there.
- **Contact details:** the email, phone and address appear in the nav menu, the FAQ, the footer, and the `mailto:` links. Update every place.
- **Forms:** the newsletter and contact forms only show a "thanks" message and send nothing. If the owner wants real submissions, connect a form service such as Formspree, and tell them which free account they need to create.

## Rules

- Keep the visual style: grain hero, rounded light/dark sections, Switzer and Inter fonts, the animations. Don't redesign unless asked.
- Keep everything static: no frameworks, no build tools, no npm.
- Before pushing, open the page in a headless browser and look at the sections you changed.
- After pushing, tell the owner the change goes live in a few minutes, and that a hard refresh (Ctrl/Cmd+Shift+R) may be needed.
