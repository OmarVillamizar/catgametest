# Spec: cat-runner-game

## game-core

| # | Requirement | Scenario |
|---|-------------|----------|
| R1 | State machine: READY → PLAYING → GAME_OVER. Transitions MUST be exclusive. | **Load**: canvas init → READY, intro plays. **Start**: READY + key/tap → PLAYING, obstacles spawn. **End**: PLAYING + 3rd hit → GAME_OVER. **Retry**: GAME_OVER + key/tap → READY reset. |
| R2 | Fixed-timestep loop via `requestAnimationFrame`, dt capped at 100ms. | **Tick**: compute dt → `update(dt)` on all modules → `render(ctx)`. **Refocus**: lost focus → dt capped, no time-jump. |

## player

| # | Requirement | Scenario |
|---|-------------|----------|
| R3 | Jump: negative `vy` + gravity. Cat MUST clamp at ground. | **Arc**: jump triggers → vy<0, gravity pulls down → lands at baseline. **Clamp**: y > ground → y=ground, vy=0. |
| R4 | Duck: hitbox height to 60% while key held. | **Crouch**: duck held + on ground → hitbox shrinks. **Release**: key up → hitbox restored. |
| R5 | Stumble: 3-frame anim on hit, 800ms invulnerability. | **Hit**: collision → 3 stagger frames, hitbox off 800ms. **Window**: during 800ms → new collision ignored. |

## obstacles

| # | Requirement | Scenario |
|---|-------------|----------|
| R6 | Spawn random obstacle every 1.2s–3s with min gap. ≥6 types: 3 tall (vase,lamp,chair), 3 short (toy,basket,plant). | **Spawn**: timer fires → random type at right edge. **Tall**: hitbox above standing cat → jump needed. **Short**: hitbox below cat top → duck needed. |
| R7 | Speed ramps: +0.08× per 10s, cap 3.0×. Obstacles removed at x < -width. | **Ramp**: 10s elapsed → baseSpeed × 1.08. **Cleanup**: off-screen left → removed. |
| R8 | AABB collision: both axes overlap → hit. Ducked cat bypasses tall obstacles. | **Hit**: rect overlap x+y → damage trigger. **Dodge**: ducked + tall above → no collision. |

## background

| # | Requirement | Scenario |
|---|-------------|----------|
| R9 | 4 layers: wall/window/baseboard static, floor scrolls at speed×0.6. Tiles wrap seamlessly. | **Scroll**: speed S → floor moves S×0.6 left, repeats off-screen. **Static**: wall/window/baseboard fixed. |

## input

| # | Requirement | Scenario |
|---|-------------|----------|
| R10 | Keys: Space/↑/W → jump, ↓/S → duck. Any in READY/GAME_OVER restarts. All touch events call `preventDefault()`. | **Jump**: Space/↑/W → cat jumps. **Duck**: ↓/S held → duck; released → stand. **Conflict**: both pressed → jump wins, duck suppressed till landing. |
| R11 | Touch: top-half tap → jump, bottom-half → duck. | **Top**: tap upper 50% → jump. **Bottom**: tap lower 50% → duck. |

## ui-hud

| # | Requirement | Scenario |
|---|-------------|----------|
| R12 | Score: top-right, `baseSpeed * dt / 10` per frame. High score in `localStorage['catRunnerHighScore']`. | **Count**: PLAYING → score ticks each frame. **Persist**: GAME_OVER + new best → localStorage set, high score shown. |
| R13 | READY: centered prompt. GAME_OVER: score + high + retry. Touch device: zone hints visible. | **Ready**: "Press Space or Tap" centered. **Overlay**: score, high score, retry button. **Mobile**: `ontouchstart` detected → ↑↓ hints rendered. |

## damage-system

| # | Requirement | Scenario |
|---|-------------|----------|
| R14 | 3 hits = game over. Hit N: cat pushed 60px left, dog advances to [60,150,250], 800ms invuln. | **Hit1**: 0 dmg + coll → stumble, dog x=60, dmg=1. **Hit2**: 1 dmg + coll → stumble, dog x=150, dmg=2. **Hit3**: 2 dmg + coll → stumble, dog x=250, dmg=3, GAME_OVER. |
| R15 | Cat opacity flickers 1.0↔0.4 at 100ms intervals during 800ms invulnerability. | **Flash**: hit → 100ms blink cycle for 800ms. |
