## Exploration: Cat Runner Game

### Current State

The repository at `catgametest` is a **brand-new empty project** — no commits, no source files, no HTML/CSS/JS, no build configuration. The only contents are dotfiles for AI tooling (`.claude/`, `.config/`, `.gemini/`, `.copilot/`, `.atl/`) and an initialized OpenSpec directory (`openspec/`) with a config but no specs yet.

- Remote: `https://github.com/OmarVillamizar/catgametest` (GitHub)
- Branch: `main` (no commits yet)
- No `.gitignore` exists — the `.config/opencode/node_modules/` directory would be committed if not excluded
- No CI/CD configured
- GitHub Pages: not enabled yet but the repo exists on GitHub — just needs `index.html` at root and GH Pages pointed to `main`

### Affected Areas

- `index.html` (root) — **NEW**: single-page game entry point, will be created at project root
- `openspec/changes/cat-runner-game/` — SDD artifacts for this change
- `.gitignore` (root) — **NEW**: needed to exclude AI tooling directories from version control

### Approaches

1. **Single HTML file, Canvas-based, vector drawing** — recommended
   - Structure: One `index.html` with embedded `<style>` and `<script>`. Cat, obstacles, and background drawn via Canvas 2D API (geometric primitives). Game loop via `requestAnimationFrame`. No external dependencies.
   - Pros: Zero build step, instant deploy to GH Pages, works offline natively, pixel-perfect collision, responsive via CSS scaling, single file to manage, no CORS, no CDN dependency
   - Cons: All code in one file (can hit ~500-800 lines), harder to test in isolation
   - Effort: Medium

2. **Separate files (index.html + style.css + game.js), Canvas-based, sprite images**
   - Structure: Separate files for HTML, CSS, and JS. Cat and obstacles rendered as hand-drawn sprite images (PNG/SVG) loaded into Canvas.
   - Pros: Cleaner separation of concerns, easier to iterate on art assets separately, JS can be unit-tested in isolation
   - Cons: More files to manage, sprites need to be created/loaded (adds visual dependency), CORS considerations for local testing, slightly more complex deployment
   - Effort: Medium-High

3. **DOM-based rendering (CSS divs + animations)**
   - Structure: All game entities as absolutely-positioned `<div>` elements, animated via CSS `transform` and `requestAnimationFrame` for JS logic. Cat as CSS art (pseudo-elements, borders).
   - Pros: No Canvas API knowledge needed, CSS animations are GPU-accelerated, easier for someone comfortable with CSS, text/UI rendering is native
   - Cons: DOM reflow overhead at 60fps for many elements, collision detection requires reading computed styles, harder to do smooth parallax backgrounds, more complex responsive scaling, CSS art is limited for complex characters
   - Effort: Medium

### Recommendation

**Approach 1: Single HTML file, Canvas-based, vector drawing.**

Rationale:
- Zero dependencies, zero build step — the definition of "works offline"
- Canvas gives us smooth 60fps rendering with precise collision math
- Vector drawing (geometric shapes) avoids needing to create/find sprite assets — the cat is drawn programmatically with circles, triangles, and arcs
- One file deployed to GH Pages: `index.html` at root, that's it
- Responsive: set internal resolution to 800×300, use CSS `object-fit` or manual scaling to fill the viewport maintaining aspect ratio
- Fully offline: no CDN fonts, no external libraries, `localStorage` for high score

Game architecture:

| Component | Responsibility |
|-----------|---------------|
| `Game` (module) | State machine: READY → PLAYING → GAME_OVER. Owns loop, orchestrates update/render |
| `Player` (cat) | Jump physics (velocity + gravity), leg animation, duck state, draw as vector cat |
| `ObstacleManager` | Spawn obstacles on timer, manage active obstacles, increase speed over time |
| `Background` | Floor line, wall, window, baseboard — parallax scroll at slower rate |
| `UI` | Score display, high score, READY prompt, GAME_OVER overlay, restart hint |
| `Input` | Keyboard (Space/Up/Down) + Touch (tap/hold) → mapped to game actions |

Game mechanics:
- Cat runs left-to-right (or rather, world scrolls right-to-left)
- Tap/Space → jump (parabolic arc: set negative vy, gravity pulls down)
- Hold Down → duck (reduces hitbox height)
- Obstacles: furniture items (chair, lamp, plant) spawned at random intervals
- Collision: AABB intersection between cat hitbox and obstacle hitbox
- Score: distance-based (pixels scrolled / constant)
- Speed: ramps up gradually, increases difficulty
- Game over: stop loop, show score, tap to restart

### Risks

- **No `.gitignore`** — must create one before committing. Without it, `node_modules` in `.config/opencode/` gets committed. Risk: accidental commit of large binary directory.
- **GitHub Pages not yet enabled** — user needs to enable it in repo settings after first push. Not a code risk but a deployment step.
- **Empty repo — first commit** — the first commit will include both SDD infrastructure dotfiles AND the game. The diff will be large. Consider a two-phase approach: commit SDD infra + `.gitignore` first, then game code.
- **No asset creation pipeline** — vector drawing means the cat must look good with only Canvas primitives. Risk: visual quality depends entirely on math in drawing functions.
- **Touch controls** — mobile browsers handle touch events differently. Must prevent default on touchstart/touchmove to avoid scrolling the page during gameplay.
- **Offline first** — no CDN means no webfonts. Must use system fonts (`system-ui, -apple-system, sans-serif`). Fine for a game UI.

### Ready for Proposal

Yes. The technical approach is clear, the architecture is straightforward, and there are no blockers. Proceed to `sdd-propose` to define scope, business rules, and acceptance criteria.
