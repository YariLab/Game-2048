let aiRunning = false;
let aiInterval;

const autoPlayButton = document.getElementById("auto-play-game");
const boardSizeToggleButton = document.getElementById("board-size-toggle");

function updateAIButtons() {
  if (!autoPlayButton) return;

  autoPlayButton.classList.toggle("active", aiRunning);
  autoPlayButton.textContent = aiRunning ? "Stop" : "Auto Play";

  if (boardSizeToggleButton) {
    boardSizeToggleButton.disabled = aiRunning;
  }
}

function simulateMoveGain(dir) {
  const copy = board.map((row) => [...row]);
  let gain = 0;
  let moved = false;

  function moveLine(line) {
    let newLine = line.filter((v) => v !== 0);
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        gain += newLine[i];
        newLine[i + 1] = 0;
      }
    }
    return newLine
      .filter((v) => v !== 0)
      .concat(Array(boardSize).fill(0))
      .slice(0, boardSize);
  }

  for (let i = 0; i < boardSize; i++) {
    let line;
    switch (dir) {
      case "left":
        line = copy[i];
        break;
      case "right":
        line = [...copy[i]].reverse();
        break;
      case "up":
        line = copy.map((row) => row[i]);
        break;
      case "down":
        line = copy.map((row) => row[i]).reverse();
        break;
    }

    const movedLine = moveLine(line);
    if (dir === "right" || dir === "down") movedLine.reverse();

    for (let j = 0; j < boardSize; j++) {
      let original;
      switch (dir) {
        case "left":
        case "right":
          original = copy[i][j];
          if (original !== movedLine[j]) moved = true;
          copy[i][j] = movedLine[j];
          break;
        case "up":
        case "down":
          original = copy[j][i];
          if (original !== movedLine[j]) moved = true;
          copy[j][i] = movedLine[j];
          break;
      }
    }
  }

  return { moved, gain };
}

function startAI() {
  if (aiRunning) return;
  aiRunning = true;

  function step() {
    if (!aiRunning) return;

    const directions = ["up", "down", "left", "right"];
    let bestMoves = [];
    let bestGain = -Infinity;

    directions.forEach((dir) => {
      const { moved, gain } = simulateMoveGain(dir);
      if (!moved) return;
      if (gain > bestGain) {
        bestGain = gain;
        bestMoves = [dir];
      } else if (gain === bestGain) {
        bestMoves.push(dir);
      }
    });

    if (bestMoves.length === 0) {
      aiRunning = false;
      updateAIButtons();
      document.getElementById("gameOver").style.display = "block";
      gameoverSound.play();
      setTimeout(() => {
        startNewGame();
        startAI();
      }, 3000);
      return;
    }

    const move =
      bestMoves[Math.floor(Math.random() * bestMoves.length)];
    handleMove(move);

    const nextDelay = Math.floor(Math.random() * (1200 - 200) + 200);
    aiInterval = setTimeout(step, nextDelay);
  }

  updateAIButtons();
  step();
}

function stopAI() {
  clearTimeout(aiInterval);
  aiRunning = false;
  updateAIButtons();
}

function autoPlay() {
  if (aiRunning) {
    stopAI();
  } else {
    startAI();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "p") {
    autoPlay()
  }
});
