# Proposal: Cat Runner Game

## Intent

Build a complete, single-file Google Dinosaur Game clone where an orange tabby cat runs through a house interior, dodging household obstacles while chased by a dog. The game uses Canvas 2D vector drawing with zero external dependencies, deploys directly to GitHub Pages, and works fully offline. Progressive difficulty, proximity-based damage feedback, and local high-score persistence deliver a polished, replayable endless runner.

## Scope

### In Scope
- Single `index.html` with embedded CSS + JS, Canvas 2D rendering at 800×300 internal resolution
- READY → PLAYING → GAME_OVER state machine with intro animation (cat plays with yarn, dog enters)
- Player controls: jump (Space/Up/W) and duck (Down/S), touch controls on mobile
- 3-hit proximity damage system (cat stumbles backward, dog advances from left edge each hit)
- Obstacles: 6+ household items (vase, lamp, chair, toy, basket, plant) — tall and short categories
- Background: wall, floor, baseboard, window with parallax scrolling
- Score = distance survived, high score persisted in localStorage
- Game-over screen with final score and retry button
- Speed ramps gradually over play time
- Responsive scaling via CSS, mobile touch zones with on-screen hints
- `.gitignore` at repo root

### Out of Scope
- Sound effects, music, or any audio
- Multiple levels, boss fights, power-ups, or collectibles
- Leaderboards, online score submission, social sharing
- Sprite-based or image-based art assets (all vector drawing)
- Build tooling, bundlers, package managers, test frameworks
- Service Worker, PWA manifest, offline caching beyond localStorage

## Capabilities

### New Capabilities
- `game-core`: State machine, game loop (requestAnimationFrame), orchestration of subsystems
- `player`: Cat entity — jump physics (velocity + gravity), duck state, 3-state stumble animation, hitbox management, vector drawing
- `obstacles`: Obstacle spawning, random selection from pool, speed ramp, collision detection (AABB), tall/short categories
- `background`: Parallax-scrolling house interior (wall, floor, baseboard, window), scroll speed proportional to game speed
- `input`: Keyboard bindings (Space, Up, W → jump; Down, S → duck), touch handlers (top-half tap → jump, bottom-half tap → duck), preventDefault on touch events
- `ui-hud`: Score counter, high-score display, READY prompt, GAME_OVER overlay with retry
- `damage-system`: 3-hit proximity model — cat stumble-back animation per hit, dog advances from left edge, game-over trigger on 3rd hit

### Modified Capabilities
None — greenfield project with no existing specs.

## Approach

**Single HTML file, Canvas 2D vector drawing** — recommended by exploration.

Architecture: module-pattern IIFEs for encapsulation (no ES modules to avoid CORS). Each module owns its Canvas draw calls — no global draw function. Game module orchestrates `update(dt)` → `render(ctx)` cycle. State machine: `READY` (intro animation) → `PLAYING` (obstacle course) → `GAME_OVER` (score + retry).

| Module | Responsibility |
|--------|---------------|
| `Game` | State machine, game loop, module orchestration |
| `Player` | Cat jump/duck/stumble physics, vector drawing, hitbox |
| `ObstacleManager` | Spawn timer, pool, recycling, speed ramp, collision |
| `Background` | Parallax layers (wall, floor, window), scroll on tick |
| `Input` | Keyboard + touch bindings, event normalization |
| `UI` | Score rendering, state overlays, mobile hints |

Collision: AABB intersection between cat hitbox (adjusted for duck) and obstacle hitboxes (adjusted per obstacle type). Damage: obstacle cleared from scene on hit, cat stumble animation plays, dog sprite advances rightward.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `index.html` (root) | New | Single-file game: HTML structure, embedded CSS, Canvas, JS modules |
| `.gitignore` (root) | New | Exclude AI tooling directories from version control |
| `openspec/changes/cat-runner-game/` | New | SDD artifacts (exploration, proposal, specs, design, tasks) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cat vector art looks unrecognizable | Medium | Design with distinct silhouette (pointy ears + tail); validate with reference sketch before coding draw functions |
| Touch events conflict with page scroll on mobile | Medium | `e.preventDefault()` on all touch handlers; set `touch-action: none` on canvas via CSS |
| GitHub Pages not enabled by user post-deploy | Low | Document deployment step in task instructions; verify in sdd-verify |
| Performance degrades with many obstacles | Low | Max 3 active obstacles; recycle off-screen objects; no GC pressure from allocations |
| Canvas 2D imageSmoothing on scaled canvas looks blurry | Low | Set `imageSmoothingEnabled = false`; use crisp pixel rendering for vector art |

## Rollback Plan

Delete `index.html` from repo root. Revert `.gitignore` if it was the only change. No database migrations, no API changes, no infrastructure to tear down. Deployment rollback: push a commit removing the file, GitHub Pages serves 404 until re-deployed.

## Dependencies

- GitHub Pages must be enabled on the repo (Settings → Pages → Source: `main` branch, root)
- No runtime dependencies (zero CDN, zero npm, zero external fonts)

## Success Criteria

- [ ] Game loads and runs fully offline — no network requests in DevTools Network tab
- [ ] All states work: intro animation plays → tap starts game → obstacles spawn → 3 hits trigger game over → retry resets cleanly
- [ ] Jump and duck controls work on desktop (Space, Up, Down) and mobile (touch zones)
- [ ] 6+ distinct obstacle types render recognizably with clear tall/short distinction
- [ ] Score increments during gameplay, high score persists across page reloads (localStorage)
- [ ] Speed increases perceptibly over play time (ramp curve)
- [ ] Responsive: canvas scales to fill viewport on 320px–1920px widths, touch hints visible on mobile
- [ ] Stumble animation plays on hit, dog advances, game over triggers on 3rd hit
- [ ] `.gitignore` excludes `.config/`, `.claude/`, `.atl/`, `.gemini/`, `.copilot/` tooling dirs
- [ ] Deployed to GitHub Pages and playable via public URL
