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
