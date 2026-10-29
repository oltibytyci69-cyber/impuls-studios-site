# Impuls Studios website

A lightweight bilingual website for Impuls Studios. The public site is static HTML, CSS and JavaScript: it has no build step, framework runtime, tracking scripts or committed secrets. Website copy and project entries live in `content/site.json`.

## What is included

- Albanian-first and English versions of the complete public site.
- Responsive navigation, a language switch, accessible forms and reduced-motion support.
- Six editable services and a portfolio that stays empty until a real project is published.
- Project detail and image/video gallery dialogs, including keyboard-accessible close controls.
- WhatsApp links with a language-specific prefilled message.
- A Netlify Forms contact form with required-field validation, multiple service selection and a honeypot.
- A Decap CMS at `/admin/` for editing content and managing project media.
- A privacy notice, a custom 404 page and basic crawler/security headers.
- A bilingual thank-you page used as the contact form's successful POST destination.

## Important launch items

The shared brief arrived without the official logo file, portfolio photographs or video. The site therefore uses the plain-text agency name in its header and footer; it does not draw a substitute logo or show fictional client work. Before launch, replace the text labels with the supplied official logo, add a favicon made from its supplied mark, and upload authorized, optimized project assets.

The live Netlify form has been tested: form detection is enabled, the email notification is configured for `iimpulsstudios@gmail.com`, a test submission appears in the Netlify dashboard, and the notification email was confirmed received. The `formDeliveryConfigured` setting is enabled in the published site content. If the form notification, deployment or delivery setup changes, set that flag to `false` until a new test submission and notification have both been verified. Local submission never sends email.

The CMS editor is included, but editing and publishing require a connected Git repository and a supported, securely configured Git Gateway/authentication provider. The example `git-gateway` backend needs to be enabled and verified for the selected hosting account before inviting editors. No credentials or admin accounts are included. Check the current hosting plan and provider documentation for CMS authentication, form notification and submission limits before launch.

There is no production domain yet. A canonical URL and sitemap with absolute production URLs should be added after a domain is selected.

## Run locally

Install Python 3 if it is not already available. From the project root, run:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). Use a local web server rather than opening `index.html` directly, because the site loads its JSON content with `fetch`. The local form shows a setup notice and does not send inquiries. The CMS requires a deployed site and configured authentication.

Check that the content JSON is valid:

```powershell
python -m json.tool content\site.json
```

There are no npm dependencies or production compilation step. To preview the not-found page locally, open [http://127.0.0.1:8000/404.html](http://127.0.0.1:8000/404.html).

## Deploy to Netlify

1. Put the project files in a Git repository and push them to a private or public GitHub repository.
2. Create a Netlify site connected to that repository. Use the repository root as the publish directory; no build command is needed. `netlify.toml` sets `publish = "."`.
3. Use the site's temporary Netlify subdomain initially. Enable form detection for the deploy and trigger a new deploy so Netlify can scan the form markup.
4. Configure a form email notification with `iimpulsstudios@gmail.com` as the recipient. Submit a test inquiry from the deployed site and verify both the Netlify submission record and email delivery. This site has completed that test.
5. After the test succeeds, set **Form delivery and email notification tested** to true under the CMS **Brand and contact** settings; leave it false until delivery is confirmed. This prevents a false success state. It is already true in the current production content.
6. To use the CMS, connect a Git-backed site and enable the supported Git Gateway and authentication workflow for the account. Configure and test editor sign-in and publishing, then invite only authorized editors. The CMS requires write access to the repository.
7. Configure HTTPS and verify the host's current plan, form spam protections, submission limits, Git Gateway availability and authentication requirements before public launch.
8. After choosing a custom domain, connect it in the hosting dashboard, wait for its HTTPS certificate, then add a production canonical URL, social preview image, favicon and absolute-URL sitemap.

The site does not contain API keys. Do not place OAuth secrets, email credentials or admin passwords in `content/site.json`, `admin/config.yml` or browser JavaScript.

## Edit content and projects

On a deployed site with the CMS backend and sign-in configured, open `/admin/`.

- Edit the Albanian and English versions separately under **Website content**. This includes navigation, section copy, service text, buttons, form messages, metadata, footer and privacy content.
- Update the agency email, Instagram URL or WhatsApp number under **Brand and contact**. Store the WhatsApp number as international digits only, without `+` or spaces.
- Add a project under **Projects**, enter both language versions of its title, category, description and image alt text, then add its cover image and optional gallery media.
- Upload images and compressed video clips through the media picker, or provide a direct HTTPS URL for a video. Use MP4/H.264 for broad browser compatibility.
- Keep **Publish this project** off while editing. Enable it only once the work and publication permissions are approved. Projects without an uploaded cover image are not shown on the public page.
- Save a draft for review or publish to the connected branch. Verify the deployed project in both languages and on a mobile screen.

Do not add a client name without permission or include invented outcomes, testimonials or project metrics.

If CMS login is unavailable, update `content/site.json` through the CMS workflow's repository editor instead, preserving valid JSON and the `sq` and `en` entries. The permanent IDs in service entries are used as form values; do not change them after inquiries have begun.

## Media guidance

Add approved project media to `media/` through the CMS uploader. The CMS stores images in the repository and inserts their `/media/...` paths into the content file. Prefer compressed WebP, AVIF or JPEG images around 1600 px on their longest edge; provide useful, concise alt text in both languages. Avoid enormous animated or background videos. Use a short, optimized MP4/H.264 clip and lazy gallery loading for optional video work.

## Maintenance and release checklist

- Keep `content/site.json` valid JSON and review all content in Albanian and English.
- Test the homepage, `/privacy.html`, `/404.html`, all WhatsApp links and the deployed form after changes.
- Confirm portfolio publication permission, image alt text, image loading and mobile gallery interactions.
- Keep the Netlify authentication configuration, editor access and notification recipient current; do not commit secrets.
- Recheck hosting limits and the privacy notice if form providers, fonts, analytics or other third-party tools change.
- Configure and verify the final domain, favicon, social sharing image and sitemap once the production URL and official logo are available.
