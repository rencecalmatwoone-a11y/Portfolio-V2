# Hero content provenance

The current checkout had empty Stage 2 content files. Only the data needed by the Hero was reconstructed, using the original portfolio at https://johnmark-clarence-mendoza.vercel.app/ and its local source in `../johnmark-clarence-mendoza/src/App.jsx`.

- Name and portrait: original profile card and `portraitImageLight` import.
- Roles: original Hero introduction and three service descriptions.
- Description: condensed from UI/UX wireframes/prototypes, responsive web development, and project planning/delivery services. No new experience or outcomes added.
- Tools: Figma, React, Next.js, TypeScript, and Tailwind CSS all appear in the original skills and project content.
- Location: original profile specifies Tagaytay, Cavite; the Hero uses Cavite, Philippines as requested.
- GitHub, LinkedIn, X, and email: original contact cards. Email uses the verified address with `mailto:` rather than the original profile card's generic Gmail inbox link.
- Contact CTA: original portfolio's existing `#contact` section, since this checkout has no contact section yet.
- Availability: omitted because no verified availability statement was found.
- Portrait: original PNG resized to a 192px WebP, 3,576 bytes; no generated imagery.

Vinit Patil's live homepage was inspected in a browser on 2026-09-28 for hierarchy, compact portrait/name presentation, paragraphs, stack sentence, and contact/social order. Its wording, assets, icons, animation, and dimensions were not reused.

## Selected Work provenance

The supplied `data/projects.ts`, `types/project.ts`, project components, and three WebP files were empty in this checkout. Project records were recovered from the original portfolio's local `../johnmark-clarence-mendoza/src/App.jsx` project section (lines 850–965) and its imported assets. The original public URL could not be read through the web tool; the local source provides the exact project text, stacks, and live links.

- **RatioFlow:** description condensed from the privacy-first, browser-only aspect-ratio converter description. Next.js, TypeScript, Tailwind CSS, and Canvas API are listed in the source. Screenshot: `RatioFlowimg.png`.
- **Collecthieves (TuToy Hub):** original project name retained. UI/UX contribution and development management come from the original description; auctions, showroom, toy stores, and collectors are visible in the original landing-page screenshot. Figma and Wireframing are the source's two tool/method labels. Screenshot: `Screenshot 2026-08-31 181008.png`.
- **MUSYNC:** capitalization matches its screenshot. Song guessing, Spotify playback, and Supabase Realtime multiplayer are in the source description. The complete verified stack is preserved in data; the card shows its first three entries. Screenshot: `musync.png`.
- Dates, performance metrics, outcomes, repository URLs, and unverified roles remain omitted. Order is explicit in data: RatioFlow, Collecthieves (TuToy Hub), MUSYNC.
- Screenshots were resized without enlargement to at most 1440px and encoded as quality-85 WebP. Dimensions/bytes: RatioFlow 1440×810 / 36,682; TuToy Hub 1347×614 / 65,506; MUSYNC 1440×810 / 47,438. No interface was altered, generated, or composited. Following the user's screenshot correction, CSS now crops from the top within inset screenshot panels, with soft neutral frames and rounded upper corners.

Ashutosh's https://www.ashutoshx7.me/projects was inspected live in Edge on 2026-09-28. Its two-column rhythm, image-above-information hierarchy, concise descriptions, and secondary stack/action row informed this section. This implementation uses the existing Hero's 46rem content width, Geist, semantic colors, and its own proportions, framing, 450ms zoom, and breakpoint. No reference assets, statuses, decorative grid, video previews, branding, or content were copied.

The stage adds only Selected Work and minimal internal route destinations with verified summary/live link. Full case studies remain deferred. The empty `ProjectReveal.tsx` was removed; the cards and section are Server Components with CSS interaction and no entrance visibility gate. No prior alternating card implementation remains in the current source.

Screenshot refinement: titles now sit directly below the image beside a small Live badge; technology labels use existing muted tool icons (with accessible names), and desktop columns have a subtle dotted divider. Node.js and Supabase SVGs were copied from the original portfolio assets; the other artwork already exists in this checkout. The lead project has a small featured pin. All three live URLs loaded with HTTP 200 and the expected project title in Edge on 2026-09-28 before the Live badges were added. These indicate published projects, not a continuous uptime guarantee.

Verification: lint, TypeScript, production build, and `scripts/selected-work-smoke.mjs` passed. Production Edge covered 320/375/768/895/896/1024/1440/1920px in light and explicit dark themes, keyboard focus/activation, touch navigation, normal/reduced motion, lazy optimized images, no-JavaScript visibility, three internal routes and unknown-slug 404, section-scoped axe WCAG A/AA checks, and horizontal overflow. Desktop light and mobile dark screenshots were visually reviewed alongside the reference. Automated accessibility checks do not replace a manual screen-reader audit; live external destinations were preserved from source, not end-to-end tested.

## Tech Stack provenance

The supplied `data/skills.ts` was empty. The curated data was restored from
`../johnmark-clarence-mendoza/src/App.jsx`, inspected on 2026-09-28. The public
reference URL was inaccessible through the web reader during this stage.

- **Front-End:** Next.js, React, TypeScript, JavaScript, HTML, CSS, and Tailwind CSS
  all appear in the original `skills` array (lines 109-139). ReactJS is displayed
  as React; Tailwind is displayed as Tailwind CSS, matching the RatioFlow project.
- **Design:** Figma, Google Stitch, and WordPress appear in the original skills
  array and current Hero data. At the user's request, Google Stitch and WordPress
  replace UI/UX Design, Wireframing, and Prototyping in this section. Their existing
  local artwork is reused. The section now displays 13 items in total.
- **Tools:** Git, GitHub, and Vercel appear in the original skills array
  (lines 152-158); Vercel is also in the MUSYNC project content.

This is a focused selection of verified skills, with no proficiency claims,
unsupported additions, or forced workflow category. No obsolete Tech Stack UI
was found in the current components or routes. Hero tool mentions remain intact.
Only Tech Stack is added to the homepage; later stages remain deferred.

Initial column-layout verification: lint, TypeScript, and production build passed. The production Edge
smoke (`scripts/tech-stack-smoke.mjs`, served on port 3110) passed at
320/375/639/640/768/1023/1024/1440/1920px in light and explicit dark themes.
Checks covered group layout and breakpoints, overflow, typography/alignment with
Selected Work, hover, reduced motion, touch, visibility without JavaScript, and
section-scoped axe WCAG A/AA checks. Desktop light, tablet light, and mobile dark
screenshots were visually reviewed.

## Certifications provenance

The user chose the supplied stacked-carousel screenshot over the initial grid
brief. Only Certifications was added, immediately after Education. Existing
section layouts and navigation were not changed.

All nine entries come from the original portfolio's
`../johnmark-clarence-mendoza/src/App.jsx` certifications array (lines 191-270).
They are presented there as earned credentials; none is listed as in progress.
The new typed data supports an explicit `in-progress` state without a completed
credential action. No additional credentials, scores, IDs, or expiry dates were
added. Packt is identified as a Coursera specialization issued by Packt, not a
claim of having passed the CompTIA certification exam.

Public credential pages were checked in a fresh, unauthenticated Edge browser
on 2026-09-28 after the web reader could not retrieve them:

| Credential | Source and verification | Display date |
| --- | --- | --- |
| IBM Front-End Developer | [Coursera](https://www.coursera.org/account/accomplishments/professional-cert/VVJ5N064B6XN), completed by JohnMark Clarence Calma Mendoza on July 18, 2026; full official title restored | Jul 2026 |
| Project Management Fundamentals, Microsoft | [Coursera](https://www.coursera.org/account/accomplishments/verify/ETX6PQB96PKE), completed by JohnMark Clarence Calma Mendoza on July 18, 2026 | Jul 2026 |
| CompTIA Security+ (SY0-701) Specialization, Packt | [Coursera](https://www.coursera.org/account/accomplishments/specialization/PT0AFOSJ1HLK), completion and owner confirmed. The original `/specialization/certificate/` link opened an embedded PDF; the confirmed overview is used instead. The overview displays January 1, 1970, an apparent missing-date value | Omitted |
| IoT Seminar, NCST | [Credsverse](https://credsverse.com/credentials/ca9e8a9a-519d-4b0c-8bdb-4e72bb8f8ca5?preview=1), issued to MENDOZA, JOHN MARK by National College of Science and Technology on November 19, 2023; official title restored | Nov 2023 |
| AI Fundamentals: Foundations for Understanding AI, IBM SkillsBuild | [Credly](https://www.credly.com/badges/996e6d25-1f0c-4114-8bd4-28d3938bac6d), issued to JohnMark Clarence Calma Mendoza on August 23, 2026; full official title restored | Aug 2026 |
| Generative AI Fundamentals, Databricks | Completion retained from the owner's original portfolio. Its original Academy download URL redirects to `/learn` without a public certificate; the action is omitted pending a working public credential URL | Omitted |
| IT Customer Support Basics, Cisco | [Credly](https://www.credly.com/badges/87c9454f-697e-4e19-a5d0-7d0fb5b3c401/public_url), issued to Rence Calma on July 27, 2026; linked from the owner's portfolio | Jul 2026 |
| SQL (Advanced), HackerRank | [HackerRank](https://www.hackerrank.com/certificates/c1aff7f5b805), original official link retained. HTTP 403 Access Denied in automated Edge prevents independent live verification; completion remains sourced from the owner's portfolio | Omitted |
| Technical Support Fundamentals, Google | [Coursera](https://www.coursera.org/account/accomplishments/verify/38CLSQF1TA7H), completed by JohnMark Clarence Calma Mendoza on July 13, 2026 | Jul 2026 |

Tracking parameters were removed from the Microsoft/Google credential URLs.
Databricks' original source URL, retained here only for provenance, was
`https://customer-academy.databricks.com/lms/index.php?r=myActivities/downloadCertificate&course_id=1765&id_user=1659338`.

Artwork is copied from the same original portfolio's imported assets. IBM,
Microsoft, and Packt logos and the IBM/Cisco credential badges were resized
without enlargement to fit 192px and encoded as quality-90 WebP (882-9,118 bytes
each). Google, Databricks, and HackerRank SVGs are copied unchanged. NCST reuses
the existing local school logo. These are logos/badges, never represented as
certificate scans. No real certificate scan exists in the local source; the
Credsverse background image also failed to load in its public page. Future real
scans are supported with explicit dimensions, useful alt text, `next/image`,
responsive sizes, lazy loading, and `object-fit: contain`, without inversion.

The heading/cards are Server Components. A small client wrapper handles the
carousel; all cards are server-rendered, with an accessible grid fallback when
JavaScript is disabled. Existing sections have no shared entrance reveal;
transitions apply only when navigating the carousel and are disabled for reduced
motion. The education smoke's former end-of-page assertion was updated to expect
Certifications as its next sibling. Automated checks do not replace a manual
screen-reader audit.

Logo/secondary-entry revision: build, lint, TypeScript, and the updated Education
smoke passed against production Edge on port 3192. Both rows were checked at
320–1920px in both themes, including logo loading, long institution wrapping,
reduced motion, no-JavaScript visibility, and section-scoped axe checks. Desktop
light and 320px dark screenshots were visually reviewed.

## Certifications provenance

The user chose a stacked carousel over the initial grid brief, then requested
cards that match the site's visual design. Cards now reuse Geist, the project
image radius, subtle neutral surfaces, compact issuer rows, and simple text links.
Only Certifications was added, immediately after Education.

Nine entries were migrated from the original portfolio's
`../johnmark-clarence-mendoza/src/App.jsx` certifications array (lines 191-270).
All are presented there as earned credentials; none is listed as in progress.
The new type supports `in-progress` without a completed credential action.
Packt remains a Coursera specialization, not a claim of passing CompTIA's exam.
No additional credentials, scores, IDs, or expiry dates were added.

Public pages were inspected in unauthenticated Edge on 2026-09-28 after the web
reader could not retrieve them:

| Credential | Source and verification | Display date |
| --- | --- | --- |
| IBM Front-End Developer | [Coursera](https://www.coursera.org/account/accomplishments/professional-cert/VVJ5N064B6XN), completed by JohnMark Clarence Calma Mendoza on July 18, 2026; full official title restored | Jul 2026 |
| Project Management Fundamentals, Microsoft | [Coursera](https://www.coursera.org/account/accomplishments/verify/ETX6PQB96PKE), completed by JohnMark Clarence Calma Mendoza on July 18, 2026 | Jul 2026 |
| CompTIA Security+ (SY0-701) Specialization, Packt | [Coursera](https://www.coursera.org/account/accomplishments/specialization/PT0AFOSJ1HLK), owner/completion confirmed. Original `/specialization/certificate/` URL opens an embedded PDF; the confirmed overview is used. Overview shows January 1, 1970, an apparent missing-date value | Omitted |
| IoT Seminar, NCST | [Credsverse](https://credsverse.com/credentials/ca9e8a9a-519d-4b0c-8bdb-4e72bb8f8ca5?preview=1), issued to MENDOZA, JOHN MARK by National College of Science and Technology on November 19, 2023; official title restored | Nov 2023 |
| AI Fundamentals: Foundations for Understanding AI, IBM SkillsBuild | [Credly](https://www.credly.com/badges/996e6d25-1f0c-4114-8bd4-28d3938bac6d), issued to JohnMark Clarence Calma Mendoza on August 23, 2026; full official title restored | Aug 2026 |
| Generative AI Fundamentals, Databricks | Completion retained from the owner's original portfolio. Its Academy download URL redirects to `/learn` without a public certificate. Action omitted pending a working public URL | Omitted |
| IT Customer Support Basics, Cisco | [Credly](https://www.credly.com/badges/87c9454f-697e-4e19-a5d0-7d0fb5b3c401/public_url), issued to Rence Calma on July 27, 2026; linked from the owner's portfolio | Jul 2026 |
| SQL (Advanced), HackerRank | [HackerRank](https://www.hackerrank.com/certificates/c1aff7f5b805), original official URL retained. Automated Edge returns HTTP 403; completion is sourced from the owner's portfolio, not independently confirmed live | Omitted |
| Technical Support Fundamentals, Google | [Coursera](https://www.coursera.org/account/accomplishments/verify/38CLSQF1TA7H), completed by JohnMark Clarence Calma Mendoza on July 13, 2026 | Jul 2026 |

Microsoft/Google tracking parameters were removed. Databricks' original URL was
`https://customer-academy.databricks.com/lms/index.php?r=myActivities/downloadCertificate&course_id=1765&id_user=1659338`.

Artwork comes from the original portfolio's imported assets. IBM, Microsoft,
Packt, and IBM/Cisco badge rasters were resized without enlargement to fit 192px
and encoded as quality-90 WebP (882-9,118 bytes each). Google, Databricks, and
HackerRank SVGs are unchanged copies. NCST reuses the existing local school logo.
These are logos/badges, not certificate scans. No scan exists in the local source;
the Credsverse background image failed to load on its public page. Future real
scans are supported using dimensions, useful alt text, `next/image`, responsive
sizes, lazy loading, and `object-fit: contain` without inversion.

Heading and cards are Server Components with a small client carousel wrapper.
All content is server-rendered; without JavaScript, the fallback grid exposes all
credentials. Existing sections have no shared entrance reveal; navigation
transitions are disabled for reduced motion. The Education smoke was updated
only to expect Certifications as the next section.

Final verification after the card redesign: lint, TypeScript, production build,
and both Certifications/Education browser smokes passed. Production Edge on port
3195 covered all nine cards at 320/375/639/640/768/1024/1440/1920px in light and
dark themes, overflow/clipping, wraparound controls, arrow keys and Home/End,
focus transfer from retiring slides, mouse drag, CDP touch swipe, external-link
activation (intercepted), image loading, lazy/contain attributes, reduced motion,
and all credentials accessible without JavaScript. Section-scoped axe WCAG A/AA
checks passed. Desktop light, mobile light, and mobile dark screenshots were
visually reviewed. Automated checks do not replace a manual screen-reader audit.

## GitHub activity — September 28, 2026

- Account: `rencecalmatwoone-a11y`, verified in the original portfolio's
  `src/GitHubActivity.jsx` and the current `data/socials.ts`.
- Data: the original portfolio's public endpoint,
  `https://github-contributions-api.jogruber.de/v4/rencecalmatwoone-a11y?y=last`.
  Counts are fetched and validated at runtime, never stored as profile facts.
- The supplied Echo reference (`https://echo-nextjs-template.vercel.app/`) was
  inspected in a browser. It currently exposes a GitHub star link, but no
  contribution section. The new calendar uses this portfolio's existing compact
  typography, dotted section rules, and theme colors, with the old portfolio's
  contribution data and accessible day navigation. Echo's star count is not used.
- The GitHub profile link stays available during loading, failure, and without
  JavaScript. Contribution updates depend on the upstream service's cache and
  GitHub's recording delay; the section does not claim real-time updates.

## GitHub activity — September 28, 2026

- Account: `rencecalmatwoone-a11y`, verified in the original portfolio's
  `src/GitHubActivity.jsx` and the current `data/socials.ts`.
- Data: the original portfolio's public endpoint,
  `https://github-contributions-api.jogruber.de/v4/rencecalmatwoone-a11y?y=last`.
  Counts are fetched and validated at runtime, never stored as profile facts.
- The supplied Echo reference (`https://echo-nextjs-template.vercel.app/`) was
  inspected in a browser. It currently exposes a GitHub star link, but no
  contribution section. The new calendar uses this portfolio's existing compact
  typography, dotted section rules, and theme colors, with the old portfolio's
  contribution data and accessible day navigation. Echo's star count is not used.
- The GitHub profile link stays available during loading, failure, and without
  JavaScript. Contribution updates depend on the upstream service's cache and
  GitHub's recording delay; the section does not claim real-time updates. The section imports only static data and scoped CSS and
adds no client JavaScript or packages.

Reference-led chip revision: replaced category columns with wrapping bordered
icon-and-label chips and All / Front-End / Design / Tools filters. The same 14
verified entries remain. Existing artwork is reused; HTML, CSS, JavaScript, and
Git assets were copied from the original portfolio. GitHub and Vercel SVG paths
come from that portfolio's inline icons. Design methods use the already installed
Lucide icons. Small brand colors follow the user's newer screenshot direction.
`TechStackFilter.tsx` now requires client state for filtering; no package was added.
All items remain server-rendered in the default All view.

Chip revision verification: lint, TypeScript, production build, and the updated
Tech Stack smoke passed. Production Edge on port 3111 covered 320-1920px in both
themes, every category filter, Enter/Space keyboard activation, visible focus,
touch filtering, loaded icons, wrapping/overflow, reduced motion, no-JavaScript
content, and section-scoped axe checks. Desktop light and 320px dark screenshots
were visually reviewed against the supplied chip reference.

## Education provenance

- Degree and full institution name: the supplied Education brief specifies
  Bachelor of Science in Information Technology at National College of Science
  and Technology (NCST), Cavite, Philippines, currently studying.
- Start year: the original local portfolio's `src/App.jsx` undergraduate entry
  (lines 825–841) lists BS Information Technology, NCST, and 2023–2027.
  Only its start year is used. The displayed period is **2023 — Present**;
  no graduation date is claimed.
- Supporting sentence: condensed from that entry's interface design, front-end
  development, and application of classroom concepts to projects, also supported
  by the current project's verified profile and work data.
- The secondary entry was restored at the user's request from the original local
  portfolio's `src/App.jsx` (lines 808–824): High School / Senior High School,
  Tagaytay City Science National High School – Integrated Senior High School,
  Tagaytay, Cavite, 2016–2022. No grades, honors, accomplishments, certifications,
  coursework, or academic organizations have been added.
- At the user's request, the NCST logo is copied without alteration from the
  original portfolio's `src/assets/ncst-logo.png` to `public/images/education/`.
  It is shown at 36px with `next/image`, a white backing for dark-mode readability,
  and empty alternative text because the adjacent school name identifies it.
  The secondary-school logo is the user's supplied `Downloads/images.jpg`, copied
  byte-for-byte to `public/images/education/tcsnhs-logo.jpg`. It replaces the
  previously sourced seal. The image identifies Tagaytay City Science National
  High School–ISHS and uses the same 36px presentation as NCST. CSS trims the
  excess side whitespace within the square frame without altering the image file.
- The supplied image informs the compact text/period alignment only. Its employer,
  internship, logo, dates, and disclosure control are not education content.

Education follows Tech Stack and adds only a Server Component, typed data, and
scoped CSS. Existing sections have no shared entrance reveal; this static section
matches their always-visible behavior and needs no animation or client JavaScript.

Verification: production build, TypeScript, lint, and the Education browser smoke
passed on 2026-09-28. Production Edge on port 3112 covered 320/375/639/640/768/
1024/1440/1920px in light and explicit dark themes, the mobile/desktop layout
boundary, overflow, heading/width consistency, exact displayed facts, static
reduced-motion behavior, and visibility with JavaScript disabled. Section-scoped
axe WCAG A/AA checks passed. Desktop light, tablet light, and 320px dark screenshots
were visually reviewed. Automated accessibility checks are not a manual
screen-reader audit.
