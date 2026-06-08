# Tasks: Cat Runner Game

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600 (index.html) + ~8 (.gitignore) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation + rendering + player physics + input | PR 1 | base=main; ~220 lines across tasks 1.1–2.2 |
| 2 | Obstacles + collision + dog + damage + intro | PR 2 | base=PR1 branch; ~180 lines across tasks 2.3–3.2 |
| 3 | UI/HUD + mobile + polish + verification | PR 3 | base=PR2 branch; ~150 lines across tasks 4.1–4.3 |

## Phase 1: Foundation

- [x] 1.1 Create `index.html` (HTML5, viewport meta, canvas 800×300, CSS reset, `touch-action:none`, `image-rendering:pixelated`) and `.gitignore` (`.config/`, `.claude/`, `.atl/`, `.gemini/`, `.copilot/`). Dep: none. Files: index.html, .gitignore. Verify: canvas visible at 800×300, no console errors. Est: ~40 lines.
- [x] 1.2 Game module IIFE: rAF loop, fixed timestep 16.667ms, dt cap 100ms, accumulator pattern, state machine (READY→PLAYING→GAME_OVER). Dep: 1.1. Files: index.html. Verify: R1+R2 (state transitions, loop timing). Est: ~60 lines.
- [x] 1.3 Background module IIFE: 4 layers — wall (#F5F0E8 + 40px dot pattern), window (620,60,100,130 frame #8B7355 + glass #C8E8F8), baseboard (#6B4226, 8px), floor (6 planks 135×60, #C4924A, parallax at speed×0.6, seamless wrap via 810px segments). Dep: 1.2. Files: index.html. Verify: R9 (4 layers render, floor scrolls). Est: ~50 lines.

## Phase 2: Core Gameplay

- [x] 2.1 Player module IIFE: cat vector draw — body ellipse #E8923F, head, ears (triangles), eyes, nose, whiskers (lines), tail (bezier), legs (rects) per design coords. Run cycle: 4 frames × 100ms, leg Y offsets `[0,-3,-2,-1]`. Jump pose (ears −20°, legs tucked). Duck pose (body ry=8, head lowered). Stumble (rotate 15°, X eyes, 3 stars). Dep: 1.2. Files: index.html. Verify: cat visible in READY state, run anim plays. Est: ~60 lines.
- [x] 2.2 Cat physics: jump (vy + gravity, parabolic arc, ground clamp Y=240), duck (hitbox 40×36 at Y=204, 60% height), standing hitbox (40×60 at Y=180). Input conflict: jump wins, duck suppressed till landing. Dep: 2.1. Files: index.html. Verify: R3 (arc+clamp), R4 (duck hitbox). Est: ~40 lines.
- [x] 2.3 Input module IIFE: keyboard (Space/↑/W=jump, ↓/S=duck), touch (top-half=jump, bottom-half=duck), `preventDefault()` on all touch events, conflict resolution (jump > duck). Dep: 1.2. Files: index.html. Verify: R10 (keys), R11 (touch zones). Est: ~40 lines.
- [x] 2.4 ObstacleManager IIFE: 6 types — tall (vase 22×50, lamp 18×55, chair 35×45) and short (toy ball 24×30, basket 28×30, plant 30×45) with per-type Canvas draw + hitbox per design. Spawn timer 1.2–3s random, min gap 300px, max 3 active. Speed ramp +0.08×/10s cap 3.0×. Object pool recycling off-screen. Dep: 2.2. Files: index.html. Verify: R6 (types + tall/short categories), R7 (ramp + cleanup). Est: ~60 lines.

## Phase 3: Damage & Dog

- [x] 3.1 Collision system: AABB intersection, cat hitbox vs obstacle hitbox, ducked cat bypasses tall obstacles (R8). 800ms invulnerability on hit with 100ms blink cycle (alpha 1.0↔0.4, R15). Dep: 2.4. Files: index.html. Verify: R8 (AABB collision + duck bypass), R15 (blink). Est: ~30 lines.
- [x] 3.2 Dog module IIFE: draw (ellipse body #8B5E3C, head, ears, snout, tongue), 3 states (idle→advancing→lunging). Position per hit count: X = −100 + hitCount×90 (0→−100, 1→60, 2→250). Damage flow: collision + not invuln → hitCount++ → cat 60px push left → stumble anim → if hitCount≥3 → GAME_OVER. Dep: 3.1. Files: index.html. Verify: R14 (dog positions, 3 hits=GAME_OVER). Est: ~60 lines.
- [x] 3.3 Intro animation: READY state → cat plays with yarn ball, dog peeks from left (x=−80), cat bolts to game position on key/tap, transition to PLAYING. Dep: 2.1, 3.2. Files: index.html. Verify: R1 intro plays before READY, tap starts game. Est: ~40 lines.

## Phase 4: UI & Finish

- [x] 4.1 UI module IIFE: score top-right (`baseSpeed × dt / 10`), high score in `localStorage['catRunnerHighScore']`, READY centered prompt, GAME_OVER overlay (rgba(0,0,0,0.4) + score + high + retry button). Touch hints (↑↓ zones at 50% opacity) when `'ontouchstart' in window`. Dep: 1.2. Files: index.html. Verify: R12 (score+persist), R13 (overlays+hints). Est: ~50 lines.
- [x] 4.2 Mobile + responsive: canvas CSS `100vw × 100vh`, `object-fit: contain`, font scale via `Math.min(canvas.width/800, canvas.height/300)`. Touch zone hints. Test at 320–1920px widths. Dep: 4.1. Files: index.html. Verify: responsive scaling, no scroll conflict. Est: ~30 lines.
- [x] 4.3 Polish + verification: speed curve tuning, animation timing pass, hit feedback (opacity flicker), cross-browser sanity. Verify all 35 spec scenarios. Dep: 4.1–4.2. Files: index.html. Verify: all spec scenarios pass, high score persists across reload. Est: ~30 lines.
