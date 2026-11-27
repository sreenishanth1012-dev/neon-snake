(() => {
  const GRID_SIZE = 20;
  const HIGH_SCORE_KEY = "neon_snake_high_score";

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("high-score");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlaySubtitle = document.getElementById("overlay-subtitle");
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const speedSelect = document.getElementById("speed-select");
  const wrapToggle = document.getElementById("wrap-toggle");
  const dpadButtons = document.querySelectorAll(".dpad-btn");

  const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  };

  const OPPOSITE = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT",
  };

  let snake = [];
  let direction = "RIGHT";
  let inputQueue = [];
  let food = { x: 14, y: 10 };
  let score = 0;
  let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
  let state = "idle"; // "idle" | "running" | "paused" | "gameover"
  let tickTimer = null;
  let animFrameId = null;

  highScoreEl.textContent = String(highScore);

  function setupCanvasResolution() {
    const dpr = window.devicePixelRatio || 1;
    const size = 480;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resetGameState() {
    snake = [
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
    ];
    direction = "RIGHT";
    inputQueue = [];
    score = 0;
    scoreEl.textContent = "0";
    spawnFood();
  }

  function spawnFood() {
    const occupied = new Set(snake.map((seg) => `${seg.x},${seg.y}`));
    const freeCells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!occupied.has(`${x},${y}`)) {
          freeCells.push({ x, y });
        }
      }
    }
    if (freeCells.length === 0) {
      winGame();
      return;
    }
    food = freeCells[Math.floor(Math.random() * freeCells.length)];
  }

  function currentTickMs() {
    const base = Number(speedSelect.value);
    const speedUp = Math.min(30, Math.floor(score / 5) * 2);
    return Math.max(90, base - speedUp);
  }

  function startLoop() {
    clearTimeout(tickTimer);
    if (state !== "running") return;
    tickTimer = setTimeout(() => {
      step();
      startLoop();
    }, currentTickMs());
  }

  function startGame() {
    resetGameState();
    state = "running";
    pauseBtn.disabled = false;
    pauseBtn.textContent = "Pause";
    hideOverlay();
    startLoop();
  }

  function togglePause() {
    if (state === "running") {
      state = "paused";
      clearTimeout(tickTimer);
      pauseBtn.textContent = "Resume";
      showOverlay("Paused", "Press Space or Resume to continue.", "Resume");
    } else if (state === "paused") {
      state = "running";
      pauseBtn.textContent = "Pause";
      hideOverlay();
      startLoop();
    }
  }

  function gameOver() {
    state = "gameover";
    clearTimeout(tickTimer);
    pauseBtn.disabled = true;
    pauseBtn.textContent = "Pause";
    showOverlay(
      "Game Over",
      `Final score: ${score}. Press Space or Play Again to retry.`,
      "Play Again"
    );
  }

  function winGame() {
    state = "gameover";
    clearTimeout(tickTimer);
    pauseBtn.disabled = true;
    showOverlay(
      "You Win!",
      `Perfect board! Final score: ${score}.`,
      "Play Again"
    );
  }

  function showOverlay(title, subtitle, btnLabel) {
    overlayTitle.textContent = title;
    overlaySubtitle.textContent = subtitle;
    startBtn.textContent = btnLabel;
    overlay.classList.add("visible");
  }

  function hideOverlay() {
    overlay.classList.remove("visible");
  }

  function enqueueDirection(nextDir) {
    if (!DIRECTIONS[nextDir]) return;
    const lastPlanned = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : direction;
    if (nextDir === lastPlanned || nextDir === OPPOSITE[lastPlanned]) return;
    if (inputQueue.length < 2) {
      inputQueue.push(nextDir);
    }
  }

  function step() {
    if (inputQueue.length > 0) {
      direction = inputQueue.shift();
    }

    const delta = DIRECTIONS[direction];
    let nextX = snake[0].x + delta.x;
    let nextY = snake[0].y + delta.y;

    if (wrapToggle.checked) {
      nextX = (nextX + GRID_SIZE) % GRID_SIZE;
      nextY = (nextY + GRID_SIZE) % GRID_SIZE;
    } else if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
      gameOver();
      return;
    }

    const willEat = nextX === food.x && nextY === food.y;
    const bodyToCheck = willEat ? snake : snake.slice(0, -1);
    const hitSelf = bodyToCheck.some((seg) => seg.x === nextX && seg.y === nextY);

    if (hitSelf) {
      gameOver();
      return;
    }

    const newHead = { x: nextX, y: nextY };
    snake.unshift(newHead);

    if (willEat) {
      score += 1;
      scoreEl.textContent = String(score);
      if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = String(highScore);
        localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
      }
      spawnFood();
    } else {
      snake.pop();
    }
  }

  function drawRoundedCell(x, y, cellSize, pad, radius) {
    const px = x * cellSize + pad;
    const py = y * cellSize + pad;
    const w = cellSize - pad * 2;
    const h = cellSize - pad * 2;
    ctx.beginPath();
    ctx.roundRect(px, py, w, h, radius);
    ctx.fill();
  }

  function render(time) {
    const boardSize = 480;
    const cellSize = boardSize / GRID_SIZE;

    ctx.fillStyle = "#080c14";
    ctx.fillRect(0, 0, boardSize, boardSize);

    // Subtle grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < GRID_SIZE; i++) {
      const pos = i * cellSize;
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, boardSize);
      ctx.moveTo(0, pos);
      ctx.lineTo(boardSize, pos);
    }
    ctx.stroke();

    // Pulsing food
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.007);
    const foodX = (food.x + 0.5) * cellSize;
    const foodY = (food.y + 0.5) * cellSize;
    const foodRadius = cellSize * (0.31 + pulse * 0.06);

    ctx.save();
    ctx.shadowColor = "#fb7185";
    ctx.shadowBlur = 14 + pulse * 6;
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Snake segments (tail to head)
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const ratio = 1 - i / Math.max(1, snake.length);

      if (isHead) {
        ctx.save();
        ctx.shadowColor = "rgba(52, 211, 153, 0.55)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#34d399";
        drawRoundedCell(seg.x, seg.y, cellSize, 1.5, 6);
        ctx.restore();
        drawEyes(seg, cellSize);
      } else {
        const g = Math.round(145 + ratio * 60);
        const b = Math.round(105 + ratio * 45);
        ctx.fillStyle = `rgb(16, ${g}, ${b})`;
        drawRoundedCell(seg.x, seg.y, cellSize, 2.5, 5);
      }
    }

    animFrameId = requestAnimationFrame(render);
  }

  function drawEyes(head, cellSize) {
    const cx = (head.x + 0.5) * cellSize;
    const cy = (head.y + 0.5) * cellSize;
    const offsetForward = cellSize * 0.18;
    const offsetSide = cellSize * 0.18;
    const d = DIRECTIONS[direction];

    // Perpendicular vector
    const px = -d.y;
    const py = d.x;

    const eye1 = {
      x: cx + d.x * offsetForward + px * offsetSide,
      y: cy + d.y * offsetForward + py * offsetSide,
    };
    const eye2 = {
      x: cx + d.x * offsetForward - px * offsetSide,
      y: cy + d.y * offsetForward - py * offsetSide,
    };

    ctx.fillStyle = "#06121a";
    for (const eye of [eye1, eye2]) {
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const keyMap = {
      arrowup: "UP",
      w: "UP",
      arrowdown: "DOWN",
      s: "DOWN",
      arrowleft: "LEFT",
      a: "LEFT",
      arrowright: "RIGHT",
      d: "RIGHT",
    };

    if (keyMap[key]) {
      event.preventDefault();
      if (state === "idle") {
        startGame();
      }
      if (state === "running") {
        enqueueDirection(keyMap[key]);
      }
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      if (state === "idle" || state === "gameover") {
        startGame();
      } else if (state === "running" || state === "paused") {
        togglePause();
      }
      return;
    }

    if (key === "r") {
      startGame();
    }
  });

  startBtn.addEventListener("click", () => {
    if (state === "paused") {
      togglePause();
    } else {
      startGame();
    }
  });

  pauseBtn.addEventListener("click", togglePause);

  speedSelect.addEventListener("change", () => {
    speedSelect.blur();
  });

  dpadButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.dir;
      if (state === "idle") {
        startGame();
      }
      if (state === "running") {
        enqueueDirection(dir);
      }
    });
  });

  setupCanvasResolution();
  resetGameState();
  animFrameId = requestAnimationFrame(render);
})();
