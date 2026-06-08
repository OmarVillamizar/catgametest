# Design: Cat Runner Game

## Technical Approach

Single `index.html` with embedded CSS/JS. Canvas 2D vector drawing at 800×300 internal resolution. IIFE module pattern (no ES modules, no CORS). Six modules: `Game`, `Player`, `ObstacleManager`, `Background`, `Input`, `UI`. Game orchestrates `update(dt)` → `render(ctx)` cycle via `requestAnimationFrame`.

## Architecture

```
┌─────────────────────────────────────────┐
│                  Game                    │
│  state machine | loop | orchestration   │
├──────┬──────┬─────────┬────────┬────────┤
│Player│ObstMgr│Background│ Input  │  UI   │
│ jump │ spawn │  wall    │  keys  │ score │
│ duck │ pool  │  floor   │ touch  │ HUD   │
│ hitbx│ speed │ basebrd  │        │overlay│
│ draw │  AABB │  window  │        │       │
└──────┴──────┴─────────┴────────┴───────┘
```

Game calls `update(dt)` on all modules, then `render(ctx)` on all. Each module owns its Canvas draw calls.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Module pattern | IIFE closures, no ES modules | Avoids CORS restrictions; single-file deployment |
| Vector drawing | All art via Canvas 2D primitives | Zero asset dependencies; crisp at any scale with `imageSmoothingEnabled=false` |
| Obstacle mechanics | Tall=ground(50px), Short=floating head-height | Creates distinct jump/duck situations; collision math is clean |
| Duck hitbox | 36px (60% of 60px), Y=204–240 | Top at Y=204 clears under short obstacles (bottom Y=200) |

## Game Loop

```
FIXED_DT = 16.667ms  (60 updates/sec)
accumulator = 0

function loop(timestamp):
  dt = min(timestamp - lastTime, 100)  // cap prevents spiral
  lastTime = timestamp
  accumulator += dt
  while accumulator >= FIXED_DT:
    update(FIXED_DT)
    accumulator -= FIXED_DT
  render(ctx)
  requestAnimationFrame(loop)
```

`update(FIXED_DT)` runs physics/collision/spawn at fixed intervals. `render()` draws every frame with interpolated positions for smoothness.

## State Machine

```
READY ──[key/tap]──▶ PLAYING ──[3rd hit]──▶ GAME_OVER
  ▲                                              │
  └────────────[key/tap]─────────────────────────┘
```

| State | Entry | Exit | Renders |
|-------|-------|------|---------|
| READY | Draw intro: cat plays with yarn ball, dog peeks from left | Clear yarn, reposition dog | Background, idle cat, dog at x=-80, "Press Space or Tap" |
| PLAYING | Enable obstacle spawn timer, start score | Stop spawn timer | Full game: scrolling bg, cat, obstacles, dog, HUD |
| GAME_OVER | Record score, persist high, show overlay | Reset damage/frame/speed | Dimmed bg (rgba black 0.4), score, high score, "Tap to Retry" |

## Canvas Layout

```
(0,0)                                    (800,0)
  ┌────────────────────────────────────────┐
  │              WALL (static)              │  Y=0–232
  │    ┌──────┐                             │
  │    │Window│   score: "0420"  hi:"1337"  │  Y=30
  │    └──────┘                             │
  ├────────────────────────────────────────┤  Y=232 baseboard
  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  Y=232–240
  ├────────────────────────────────────────┤  Y=240 floor start
  │  wooden planks scroll ←                │  Y=240–300
  └────────────────────────────────────────┘
(0,300)                                  (800,300)
```

**Key coordinates**: Ground Y=240, Cat fixed X=150, Obstacle spawn X=800, Dog starts X=-100 (off-screen), advances by [−100, 60, 150, 250] per hit.

## Player (Cat) Drawing Spec

All coordinates relative to cat anchor (150,240=feet). Canvas 2D calls:

| Part | Shape | Fill | Coords / Params |
|------|-------|------|-----------------|
| Body | ellipse | #E8923F | cx=150, cy=215, rx=16, ry=18 |
| Belly | ellipse | #F5C595 | cx=150, cy=220, rx=10, ry=10 |
| Head | circle | #E8923F | cx=154, cy=188, r=12 |
| Ears (2) | triangle×2 | #E8923F / #F0B0B0 inner | L:(142,178)-(146,163)-(152,176) R:(158,176)-(164,163)-(166,178) |
| Eyes | circle×2 | #2D2D2D / white hl | (148,186)r=2.5, (160,186)r=2.5; hl at (147,185),(159,185)r=1 |
| Nose | triangle | #E87080 | (152,191)-(156,191)-(154,194) |
| Whiskers | lines×4 | #2D2D2D, w=1 | L:(140,190)→(128,188), (140,192)→(128,192); R:(168,190)→(180,188), (168,192)→(180,192) |
| Tail | arc | #E8923F, w=4 | bezier: (134,218)→(110,200)→(120,185) |
| Legs | rect×4 | #D48030 | L-front:(142,228,5,10), R-front:(150,228,5,10), L-back:(157,228,5,10), R-back:(165,228,5,10) |

**Run animation**: 4 frames, 100ms each. Leg Y offsets cycle: `[0,-3,-2,-1]` for front legs, inverted phase for back legs.

**Jump pose**: Ears rotate −20° (flatten), legs tuck (ry=4), tail extends straight up.

**Duck pose**: Body ry=8 (compressed), head cy=215 (lowered, overlaps body), ears flattened, legs spread (x±6).

**Stumble pose**: ctx.rotate(15°×π/180) around anchor, eyes→X marks (crossed lines), 3 yellow 4-point stars around head (r=3).

## Obstacle Catalog

### Tall (on ground, jump required)

| Type | Draw sequence | Hitbox (w×h, bottom Y=240) |
|------|--------------|---------------------------|
| **Vase** | rect(19×40) at x=7,y=200 + ellipse top(22×6) + rect base(25×8) | 22×50 |
| **Lamp** | rect pole(4×48) at x=0,y=188 + circle base r=10 + trapezoid shade(20,8,14,8) | 18×55 |
| **Chair** | 4 leg rects(4×10) + seat rect(35×5) at y=230 + back rect(35×22) | 35×45 |

### Short (floating at head-height, duck required)

| Type | Draw sequence | Hitbox (w×h, bottom Y) |
|------|--------------|------------------------|
| **Toy Ball** | circle r=15 at cx=15,cy=185 + stripe arc | 24×30, bottom Y=200 |
| **Basket** | trapezoid(10,28,22) at y=170 + weave lines×5 | 28×30, bottom Y=198 |
| **Plant** | pot rect(14×12) at y=150 + 4 leaf ellipses above | 30×45, bottom Y=205 |

**Obstacle spawn**: Random type from combined pool. Spawn interval 1.2s–3.0s (random), min gap 300px between obstacles. Max 3 active. Recycle off-screen (x < −width) back to pool.

## Background

| Layer | Draw | Scroll speed | Wrap |
|-------|------|-------------|------|
| Wall | fillRect(0,0,800,232) #F5F0E8 + subtle dot pattern every 40px | 0 (static) | — |
| Window | rect(620,60,100,130) frame #8B7355 + glass #C8E8F8 + crossbars | 0 | — |
| Baseboard | fillRect(0,232,800,8) #6B4226 | 0 | — |
| Floor | 6 planks: each 135×60 rect, fill #C4924A, stroke #A07030 gap lines. Scroll speed = `gameSpeed × 0.6` | gameSpeed×0.6 | Two 810px segments, offset % 810 |

## Dog

| Body part | Shape | Fill | Coords |
|-----------|-------|------|--------|
| Body | ellipse | #8B5E3C | rx=22, ry=16 |
| Head | circle | #8B5E3C | r=14, offset (+20,−10) from body |
| Ears | ellipse×2 | #6B3E1C | rx=6, ry=12, flopped down from head |
| Snout | rect | #8B5E3C | 10×8, attached to head front |
| Tongue | ellipse | #E87080 | rx=3, ry=6, only in lunging state |

**States**: idle(mouth closed, ears drooped) → advancing(legs spread, leaning forward) → lunging(mouth open, tongue out, stretched body). Position: X = −100 + hitCount×90 (hits 0,1,2 → dog at −100, 60, 250). Visual only during PLAYING and GAME_OVER.

## Collision System

```js
function aabbCollision(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
```

| Entity | Hitbox (x,y,w,h) |
|--------|-------------------|
| Cat standing | (130, 180, 40, 60) |
| Cat ducking | (130, 204, 40, 36) |
| Tall obstacles | per-type (bottom Y=240) |
| Short obstacles | per-type (bottom Y≈200) |

**Invulnerability**: After hit → 800ms window. Cat drawn at globalAlpha 0.5, toggling at 100ms intervals (8 blinks). Collision skipped during window.

**Damage flow**: Collision + not invuln → increment damageCount → cat pushed 60px left (x−=60) → dog X = −100 + damageCount×90 → if damageCount≥3, set GAME_OVER.

## Responsive Scaling

```css
canvas {
  width: 100vw; height: 100vh;
  object-fit: contain;
  touch-action: none;
  image-rendering: pixelated;
}
```

Touch zones: `e.clientY < canvas.height/2` → jump, else → duck. Font scale: `Math.min(canvas.width/800, canvas.height/300)` applied to all UI text. Mobile detection: `'ontouchstart' in window` → show ↑↓ zone hints overlay at 50% opacity.

## File Structure

```
catgametest/
  index.html          ← single-file game (HTML+CSS+JS)
  .gitignore          ← .config/ .claude/ .atl/ .gemini/ .copilot/
  openspec/
    changes/cat-runner-game/
      exploration.md, proposal.md, spec.md, design.md
```

## Performance

| Concern | Mitigation |
|---------|-----------|
| Max 3 obstacles | Active array capped; spawn skipped if full |
| Object pooling | Pre-allocate 6 obstacle objects; set `active=false` instead of delete |
| GC pressure | Reuse arrays, pre-computed constants, no `new` in game loop |
| Crisp rendering | `ctx.imageSmoothingEnabled = false` |
| Frame budget | All draw calls are Canvas 2D primitives — no images, no text layout recalc; ~0.1ms per obstacle draw |

## Open Questions

- [ ] R8 spec says "ducked cat bypasses tall obstacles" — this design resolves it as "duck bypasses SHORT (floating) obstacles" because tall obstacles are on ground and ducked cat still collides with them. Confirm with product.
- [ ] Speed ramp curve: proposal says "gradual", spec says +0.08×/10s cap 3.0×. Use spec formula.
