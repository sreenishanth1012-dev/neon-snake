# Neon Snake

A clean, responsive browser-based Snake game built with HTML5 Canvas, CSS, and vanilla JavaScript.

## Features

- **Speed Presets:** Choose between **Chill** (240 ms), **Classic** (180 ms), and **Turbo** (120 ms), with a gentle progressive speed-up as your score increases.
- **Wrap Walls Mode:** Toggle between classic solid walls and wrap-around edges.
- **Persistent High Score:** Automatically saves your best score in `localStorage`.
- **Responsive Controls:** Play using Arrow keys / `WASD` on desktop or the on-screen D-pad on mobile/touch screens.
- **Input Buffering:** Queues rapid directional turns to prevent accidental self-collision between ticks.

## Controls

| Action | Keys / Input |
| --- | --- |
| Move | `Arrow Keys` or `W` `A` `S` `D` (or on-screen D-pad) |
| Pause / Resume | `Space` or **Pause** / **Resume** button |
| Restart | `R` (or `Space` / **Play Again** on Game Over) |

## Running Locally

Serve the project folder with any static HTTP server, for example:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765 in your browser.
