# Portfolio V2

Minimal Next.js App Router scaffold with TypeScript and Tailwind CSS.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm`.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```

Run `npm run start` after building to serve the production app.

Unbuilt sections remain placeholders. The homepage currently contains the Hero and
Selected Work, followed by Tech Stack, Education, and Certifications. Known project routes have minimal summary/live-link destinations;
unknown project slugs return 404. Full case studies are deferred.
# John Mark Clarence Mendoza — Hero

This stage implements only the personal homepage Hero and its prerequisites. The supplied checkout's previous content, shell, and design-system files were empty. Navigation and other sections remain outside this stage.

The Hero is a Server Component in `components/sections/Hero.tsx`, with scoped CSS and verified content in `data/profile.ts`, `data/hero.ts`, and `data/socials.ts`. See `CONTENT_AUDIT.md` for provenance. The contact CTA currently points to the existing portfolio's contact section; update `profile.contactHref` when the new Contact section exists.

Geist is self-hosted through `next/font`. Light mode with a white background is the default, regardless of the OS theme. The desktop section index includes a dark-mode switch; its selection is saved in local storage and updates the root `data-theme` attribute.

Run locally with `npm run dev`. Validate with `npm run lint`, `npm run typecheck`, and `npm run build`.

For browser validation, start the production server on port 3100 (`npm run start -- -p 3100`) and run `node scripts/hero-smoke.mjs`. The script uses the existing temporary Playwright installation at `%TEMP%/portfolio-v2-browser-tools/node_modules/playwright` and Edge. Set `PLAYWRIGHT_MODULE` to an installed Playwright package path, `BROWSER_PATH` to a Chromium executable, and `BASE_URL` to override these defaults. Screenshots are saved to the temporary `portfolio-v2-hero-review` folder. Checks include 320–1920px layouts, both themes, reduced motion, WCAG A/AA axe checks, keyboard focus, touch and keyboard CTA activation, and visibility without JavaScript. External navigation is intercepted during activation checks.

## Selected Work

`SelectedWork` and `ProjectCard` are Server Components, driven by the featured flag
and order in `data/projects.ts`. The section follows the Ashutosh Projects reference:
two consistent image-first columns at 896px and above, one column below, and a
compact stack/action row. It shares the Hero's content width and global colors.
Images use `next/image`, explicit dimensions, responsive sizes, lazy loading, and
real optimized screenshots. Hover zoom/arrow movement respect reduced motion.

Run `npm run start -- -p 3104`, then `node scripts/selected-work-smoke.mjs` for the
current section checks. The script uses the same temporary Playwright setup as
above and an existing `axe-core` installation resolvable from the workspace.
It covers 320–1920px, both themes, the column breakpoint, keyboard/touch, hover,
reduced motion, image loading, no-JavaScript visibility, internal routes/404,
automated accessibility, and overflow. Screenshots go to
`%TEMP%/portfolio-selected-work-review`. The earlier Hero-only smoke script retains
its original stage-specific copy/link expectations and is not the current homepage
regression suite. See `CONTENT_AUDIT.md` for source and verification details.

## Tech Stack

`components/sections/TechStack.tsx` provides the server-rendered heading and
`TechStackFilter.tsx` handles All / Front-End / Design / Tools filtering using
`data/skills.ts`. Compact icon-and-label chips wrap naturally at every width,
matching the supplied reference. The section retains the 46rem content width,
Geist, and semantic color/spacing tokens. Filter buttons support keyboard focus,
pressed state, and result announcements. All skills render before hydration;
filtering uses a small client component with no new dependencies. Reduced motion
disables all section motion. Category changes use a 280ms group fade with a 4px
settle; chips and filters have eased hover feedback and filters have a subtle
press response. Artwork is mapped in `data/skill-icons.ts`.

With the production server on port 3104, run `node scripts/tech-stack-smoke.mjs`
using the browser tools described above. Screenshots are written to
`%TEMP%/portfolio-tech-stack-review`.

## Education

`components/sections/Education.tsx` is a Server Component with typed content in
`data/education.ts` and scoped styles in `Education.module.css`. The entries show
the current BS Information Technology degree at National College of Science
and Technology, Cavite, Philippines (2023 — Present), and High School / Senior
High School at Tagaytay City Science National High School – Integrated Senior
High School, Tagaytay, Cavite (2016 — 2022). Both school logos are stored locally
and displayed at 36px using `next/image`; see `CONTENT_AUDIT.md` for their sources.
The period sits to the right from 640px and stacks beneath the school/location on
smaller screens. It shares the existing section width, headings, and theme tokens.
No client component, package, or animation is added; the current sections
have no shared entrance reveal to reuse. Content stays visible without JavaScript
and under reduced motion.

Run `node scripts/education-smoke.mjs` against the production server on port 3104
(or set `BASE_URL`). It uses the same browser tools as the other section scripts;
screenshots go to `%TEMP%/portfolio-education-review`.

## Certifications

`data/certifications.ts` contains nine credentials migrated from the original
portfolio, all recorded as completed. `Certification` also supports `in-progress`,
optional dates, IDs, skills, issuer artwork, and a real certificate image with
dimensions and alt text. No certificate scans or IDs were invented. An empty
collection makes the section return `null`.

`components/sections/Certifications.tsx` and `CertificationCard.tsx` render the
content on the server. `CertificationCarousel.tsx` provides the stacked carousel
requested in the screenshot clarification: previous/next buttons, wrapping,
arrow keys, Home/End, mouse drag, and touch swipe. Inactive slides are inert and
hidden from assistive technology; the current title/count is announced politely.
There is no autoplay. Without JavaScript, all credentials remain available in a
responsive grid. Scoped styles use the existing tokens, support both themes, and
disable transitions under reduced motion. No package was added.

Eight source-backed credential links open new tabs with `noopener noreferrer`.
Databricks' obsolete link was omitted because it redirects to the Academy portal.
HackerRank blocks automated access; its original official URL is retained but
could not be independently verified live. Seven other credential records were
confirmed in the browser; see `CONTENT_AUDIT.md` for details and date provenance.

Run `npm run start -- -p 3193`, then `node scripts/certifications-smoke.mjs` with
the existing browser tooling described above. `BASE_URL` overrides the server.
Screenshots go to `%TEMP%/portfolio-certifications-review`.

## GitHub activity

The homepage includes a contribution calendar after Certifications, linked from
the section index. It reuses the GitHub account in `data/socials.ts` and the public
contributions endpoint used by the original portfolio. No token or dependency is
needed. The client fetches the last year on mount, checks every five minutes while
visible, and checks on focus/connection recovery (at most once per minute).
Upstream caching and GitHub recording delays can delay updates.

`lib/github.ts` validates dates, counts, intensity levels, and consecutive days.
Loading and error states never fabricate activity; failed refreshes retain the
last successful calendar. Retry is available after errors. Without JavaScript,
the profile link and explanatory fallback remain available.

The calendar scrolls horizontally on narrow screens, initially showing recent
activity. Arrow keys, Home/End, hover, and touch expose daily counts; the calendar
uses one tab stop. Both themes and reduced motion are supported.

Run `node --use-system-ca scripts/github-smoke.mjs` with a production server on
port 3196 (or set `BASE_URL`). It checks live data, responsive layouts, accessible
controls, navigation, refresh failures, invalid data, retry, and no-JavaScript
fallbacks. Screenshots go to `%TEMP%/portfolio-github-review`.
