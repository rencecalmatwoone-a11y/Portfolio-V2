# Hero music player

The hero music button opens `components/hero/MusicPlayer.tsx`: a compact iPod-inspired shell with a monochrome LCD, a brief first-open boot screen, and a working click wheel. Light and graphite cases follow the portfolio theme. Playback starts only after an explicit action and continues while menus are browsed or the panel is closed. Leaving the homepage unmounts the player and stops audio.

`data/music.ts` owns the four-track playlist, and `useMusicPlayback.ts` owns audio transport. Supplied MP3s are served from `public/audio/`; no streaming account or API key is needed. A null `audioSrc` displays an unavailable state. Metadata loads after opening.

The menu hierarchy includes Music > All Songs / Artists, Settings, Shuffle Songs, Backlight, and Now Playing. Wheel dragging or scrolling moves the menu highlight without changing the playing song; the center button selects it. MENU steps back through the hierarchy. During playback the wheel seeks in five-second steps, and the center button toggles track details / album artwork. Settings expose shuffle, repeat Off / One / All, backlight, LCD filter, and volume. Backlight dims after 30 seconds without interaction; explicit Off stays off until enabled. Shuffle uses a randomized order without immediate duplicates.

The focused player supports arrow-key navigation and Enter selection. Space on the wheel plays or pauses. Escape goes back, then closes from the main menu. Outside click and the hero music button dismiss the panel; focus returns to the trigger when using the music button or Escape.

Cover artwork was retrieved from Spotify's official oEmbed metadata for the linked tracks on October 7, 2026. The two Frank Ocean tracks share the Blonde cover. Each cover links to its source track.

Reference inspected in the browser: https://ipod.framer.website/ . The Framer module was also inspected for wheel, boot, keyboard, backlight, menu, shuffle, and repeat behavior: https://framer.com/m/IPodPlayer-tolt.js@rEsCECGPY6wVvV8fUWfu . The implementation is local React/CSS with the supplied MP3s. The audio-only display switches between artwork and track details; the reference switches to YouTube video. Settings are limited to working audio and display controls; no unsupplied lyrics or placeholder Extras pages are shown.

Run `node scripts/music-player-smoke.mjs` with the portfolio running on port 3000 and Chrome CDP on port 9228. `BASE_URL`, `CDP_URL`, and `PLAYWRIGHT_MODULE` can override these defaults. The check plays the actual supplied MP3s in the browser and covers transport, seek, volume, errors, keyboard, touch, themes, and responsive bounds; it does not verify physical speaker output.
