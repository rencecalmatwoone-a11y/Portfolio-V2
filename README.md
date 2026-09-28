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
Selected Work. Known project routes have minimal summary/live-link destinations;
unknown project slugs return 404. Full case studies are deferred.
# John Mark Clarence Mendoza — Hero

This stage implements only the personal homepage Hero and its prerequisites. The supplied checkout's previous content, shell, and design-system files were empty. Navigation and other sections remain outside this stage.

The Hero is a Server Component in `components/sections/Hero.tsx`, with scoped CSS and verified content in `data/profile.ts`, `data/hero.ts`, and `data/socials.ts`. See `CONTENT_AUDIT.md` for provenance. The contact CTA currently points to the existing portfolio's contact section; update `profile.contactHref` when the new Contact section exists.

Geist is self-hosted through `next/font`. Light mode with a white background is the default, regardless of the OS theme. Explicit `data-theme="dark"` selection enables dark mode with a black background; `data-theme="light"` restores light mode. No theme control or additional navigation is introduced here.

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
