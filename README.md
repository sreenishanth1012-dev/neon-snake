# Neon Snake

A responsive browser-based Snake game built with HTML, CSS, and Canvas JavaScript.

## Features
- Smooth 20×20 grid gameplay with queued directional input
- Three speed presets: **Chill** (240 ms), **Classic** (180 ms), and **Turbo** (120 ms)
- Optional **Wrap Walls** mode
- Persistent **Best** score saved in `localStorage`
- Keyboard controls (`Arrow` keys / `WASD`, `Space` to pause/resume, `R` to restart) plus an on-screen D-pad for touch/mobile

## Running Locally
```bash
python -m http.server 8765 --bind 127.0.0.1
```
Then open `http://127.0.0.1:8765` in your browser.
