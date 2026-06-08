# 🐱 Cat Runner

> A tiny browser endless-runner where a cat dodges household obstacles — and a personal sandbox for building software with **AI agents in orchestration**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
![Vanilla JS](https://img.shields.io/badge/stack-Vanilla%20JS%20%2B%20Canvas-blue)
![Status](https://img.shields.io/badge/status-personal%20experiment-orange)

**🌐 Language / Idioma — [English](#-english) · [Español](#-español)**

---

## 🇬🇧 English

### What is this?

**Cat Runner** is a small endless-runner game that runs entirely in the browser. You control a cat that runs through a house: **jump** over tall obstacles (vases, lamps, chairs) and **slide** under floating ones (toys, baskets, plants). A dog chases you — take three hits and it's game over. Survive as long as you can and beat your high score.

It's a single `index.html` file: **HTML5 Canvas + vanilla JavaScript**, no framework, no build step, no bundler.

### Why does it exist?

This is **not** a commercial product. It's a **personal experiment** to test how far modern software development can go when it's **driven by AI agents working in orchestration** rather than written by hand.

Concretely, the project was used to evaluate:

- **Agent orchestration** — a coordinator agent ([Claude Code](https://claude.com/claude-code)) delegating focused work to specialized sub-agents (exploration, implementation, review, verification) instead of one monolithic assistant.
- **Spec-Driven Development (SDD)** — every meaningful change flows through `proposal → spec → design → tasks → apply → verify → archive`. The artifacts are kept in the repo under [`openspec/`](./openspec) as evidence of the process, not just the result.
- **Closing the loop with real verification** — a [Puppeteer](https://pptr.dev) harness ([`debug/harness.mjs`](./debug/harness.mjs)) drives the game through a `window.__game` debug API (`snap`, `input`, `tick`, `render`) so agents can assert real behavior, not just read code.

In short: the *game* is the excuse; the *process* is the point.

### Features

- 🎮 Tight, frame-rate-independent gameplay (fixed-timestep loop with delta capping)
- 😺 Forgiving game feel — friendly hitboxes (~85%), jump buffering, snappy jump
- 📱 **Mobile controls** — tap to jump, swipe down to slide (low-latency gesture input)
- ⌨️ **Desktop controls** — full keyboard support
- ✨ Juice — dust particles, squash & stretch, screen shake on death
- 🔊 Background music + sound effects, with a mute toggle (persisted)
- 🏆 High score saved in `localStorage`
- ⏸️ Auto-pause when the tab loses focus

### Controls

| Action  | Desktop                | Mobile            |
| ------- | ---------------------- | ----------------- |
| Jump    | `Space` / `↑` / `W`    | Tap               |
| Slide   | `↓` / `S`              | Swipe down (hold) |
| Pause   | `Esc`                  | —                 |
| Restart | `R` (while paused)     | Tap (on game over)|

### Run it

It's a static page — just open it:

```bash
# Option 1: open the file directly
# (double-click index.html, or)
open index.html        # macOS
start index.html       # Windows

# Option 2: serve it (recommended; needed for the test harness)
npx serve .            # or VS Code "Live Server" on port 5500
```

Run the automated smoke tests (requires a static server on `http://127.0.0.1:5500`):

```bash
npm install            # installs Puppeteer
node debug/harness.mjs
```

### Tech stack

- **HTML5 Canvas + vanilla JavaScript** — single file, zero runtime dependencies
- **Puppeteer** — headless browser harness for automated checks (dev only)
- **Built with** Claude Code (agent orchestration) + Spec-Driven Development

### License

[MIT](./LICENSE) © 2026 Omar Villamizar

---

## 🇪🇸 Español

### ¿Qué es esto?

**Cat Runner** es un pequeño juego de tipo *endless runner* que corre por completo en el navegador. Controlas a un gato que corre por una casa: **salta** sobre obstáculos altos (jarrones, lámparas, sillas) y **deslízate** por debajo de los que flotan (juguetes, canastos, plantas). Un perro te persigue: con tres golpes termina la partida. Sobrevive lo máximo posible y supera tu récord.

Es un único archivo `index.html`: **HTML5 Canvas + JavaScript puro**, sin framework, sin paso de build, sin bundler.

### ¿Por qué existe?

Esto **no** es un producto comercial. Es un **experimento personal** para probar hasta dónde llega el desarrollo de software cuando está **dirigido por agentes de IA trabajando en orquestación**, en lugar de escribirse a mano.

En concreto, el proyecto sirvió para evaluar:

- **Orquestación de agentes** — un agente coordinador ([Claude Code](https://claude.com/claude-code)) que delega trabajo acotado a sub-agentes especializados (exploración, implementación, revisión, verificación), en vez de un único asistente monolítico.
- **Desarrollo guiado por especificación (SDD)** — todo cambio relevante pasa por `propuesta → spec → diseño → tareas → aplicar → verificar → archivar`. Los artefactos quedan en el repo bajo [`openspec/`](./openspec) como evidencia del proceso, no solo del resultado.
- **Cerrar el ciclo con verificación real** — un harness con [Puppeteer](https://pptr.dev) ([`debug/harness.mjs`](./debug/harness.mjs)) maneja el juego a través de una API de depuración `window.__game` (`snap`, `input`, `tick`, `render`), de modo que los agentes pueden comprobar comportamiento real y no solo leer código.

En resumen: el *juego* es la excusa; el *proceso* es el objetivo.

### Características

- 🎮 Jugabilidad precisa e independiente de los FPS (bucle de paso fijo con tope de delta)
- 😺 Sensación amigable — hitboxes indulgentes (~85%), *jump buffering*, salto ágil
- 📱 **Controles móviles** — toca para saltar, desliza hacia abajo para agacharte (gestos de baja latencia)
- ⌨️ **Controles de escritorio** — soporte completo de teclado
- ✨ *Juice* — partículas de polvo, *squash & stretch*, sacudida de pantalla al morir
- 🔊 Música de fondo y efectos de sonido, con botón de silencio (persistente)
- 🏆 Récord guardado en `localStorage`
- ⏸️ Pausa automática cuando la pestaña pierde el foco

### Controles

| Acción    | Escritorio             | Móvil                  |
| --------- | ---------------------- | ---------------------- |
| Saltar    | `Espacio` / `↑` / `W`  | Tocar                  |
| Agacharse | `↓` / `S`              | Deslizar abajo (mantener) |
| Pausar    | `Esc`                  | —                      |
| Reiniciar | `R` (en pausa)         | Tocar (en game over)   |

### Cómo ejecutarlo

Es una página estática, solo ábrela:

```bash
# Opción 1: abrir el archivo directamente
# (doble clic en index.html, o)
open index.html        # macOS
start index.html       # Windows

# Opción 2: servirla (recomendado; necesario para el harness de pruebas)
npx serve .            # o "Live Server" de VS Code en el puerto 5500
```

Ejecutar las pruebas automáticas (requiere un servidor estático en `http://127.0.0.1:5500`):

```bash
npm install            # instala Puppeteer
node debug/harness.mjs
```

### Tecnologías

- **HTML5 Canvas + JavaScript puro** — un solo archivo, cero dependencias en runtime
- **Puppeteer** — harness de navegador headless para pruebas automáticas (solo desarrollo)
- **Construido con** Claude Code (orquestación de agentes) + Desarrollo guiado por especificación

### Licencia

[MIT](./LICENSE) © 2026 Omar Villamizar
