# Walking figure asset

Asset: `public/images/hero/walking-figure.webp` (1536 × 1024, six frames in a 3 × 2 grid, lossless WebP with alpha).

Created with the built-in imagegen tool from the figure supplied in the conversation. The frames are generated variations of that figure. The motion reference was https://www.sparshpaliwal.com/; no assets or animation code were copied from that site.

The hero component loops continuously: walk left to right, stand for 1.8 seconds, turn and walk right to left, then stand for 1.8 seconds before repeating. The figure faces its direction of travel and holds a still frame during each rest. Click or keyboard-activate the figure to pause/resume, including during rests. Animation pauses outside the viewport and in hidden tabs. Reduced motion shows a static decorative figure with no animation control.

Final generation prompt (refinement of the first generated sheet):

> Correct only the WALKING POSES and alignment of this transparent sprite sheet. Keep identical young man, head, torso, black clothing, earphones, sneakers, facing right, photorealistic look, 1536x1024 canvas, 3x2 equal 512px cells, true transparent alpha background. Six consecutive walk-cycle poses need a convincing foot passing phase: Frame 1 top left right leg stretched forward and left leg behind (contact). Frame 2 top middle the legs are CLOSE TOGETHER, left knee bends and left foot lifts forward past the planted right shin (passing). Frame 3 top right left foot ahead, right heel lifts behind. Frame 4 bottom left left leg fully stretched forward and right leg behind (opposite contact). Frame 5 bottom middle the legs are CLOSE TOGETHER, right knee bends and right foot lifts past the planted left shin (opposite passing). Frame 6 bottom right right foot ahead and left heel lifts behind. Critical: top-middle and bottom-middle frames must have legs nearly together, not spread wide apart. Every character shares exact same height and position within their cell, hair at y=24 relative to cell, planted sole exactly y=480 relative to cell; bottoms in second row at y=992 overall. No shadows, glow, scenery or text. Remove any semitransparent backdrop or halo, clean cutouts.

Validation: `node scripts/walking-figure-smoke.mjs` uses the local development server on port 3000 by default (`BASE_URL` overrides it).
