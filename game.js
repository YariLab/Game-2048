let boardSize = 4;
let board = [];
let score = 0;
let best = 0;

const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const keyPressedElement = document.getElementById("key-pressed");

const moveSound = new Audio("sounds/move.mp3");
const mergeSound = new Audio("sounds/merge.mp3");
const gameoverSound = new Audio("sounds/game-over.mp3")
const boardSizeButton = document.getElementById("board-size-toggle");

function updateBoardSizeStyles() {
  boardElement.classList.remove("board-4", "board-6", "board-8");
  boardElement.classList.add(`board-${boardSize}`);
}

function setBoardSize(size) {
  boardSize = size;
  if (boardSizeButton) {
    boardSizeButton.textContent = `${size}x${size}`;
  }
  updateBoardSizeStyles();
  startNewGame();
}

function toggleBoardSize() {
  if (typeof aiRunning !== "undefined" && aiRunning) {
    return;
  }

  let newSize;
  if (boardSize === 4) newSize = 6;
  else if (boardSize === 6) newSize = 8;
  else newSize = 4;

  setBoardSize(newSize);
}

function startNewGame() {
  document.getElementById("gameOver").style.display = "none";
  board = Array(boardSize)
    .fill(null)
    .map(() => Array(boardSize).fill(0));
  score = 0;
  updateScore();
  spawnTile();
  spawnTile();
  renderBoard();
}

function spawnTile() {
  const empty = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length > 0) {
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function renderBoard() {
  boardElement.innerHTML = "";
  board.forEach((row) => {
    row.forEach((value) => {
      const tile = document.createElement("div");
      tile.className = "tile tile-" + value;
      tile.textContent = value === 0 ? "" : value;
      boardElement.appendChild(tile);
    });
  });
}

function updateScore() {
  scoreElement.textContent = score;
  if (score > best) {
    best = score;
    bestElement.textContent = best;
  }
}

function getPossibleMoves() {
    return ["up", "down", "left", "right"].filter((dir) => {
      const copy = board.map((row) => [...row]);
      let changed = false;
  
      function moveLine(line) {
        let newLine = line.filter((v) => v !== 0);
        for (let i = 0; i < newLine.length - 1; i++) {
          if (newLine[i] === newLine[i + 1]) {
            newLine[i] *= 2;
            newLine[i + 1] = 0;
          }
        }
        return newLine.filter((v) => v !== 0).concat(Array(boardSize).fill(0)).slice(0, boardSize);
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
          if ((dir === "left" || dir === "right") && copy[i][j] !== movedLine[j]) changed = true;
          if ((dir === "up" || dir === "down") && copy[j][i] !== movedLine[j]) changed = true;
          if (dir === "left" || dir === "right") copy[i][j] = movedLine[j];
          else copy[j][i] = movedLine[j];
        }
      }
      return changed;
    });
  }

function checkGameOver() {
    if (getPossibleMoves().length === 0) {
        document.getElementById("gameOver").style.display = "block";
        gameoverSound.play();
    }
}

function handleMove(dir) {
  let moved = false;

  let keyPressed = dir[0].toUpperCase() + dir.slice(1);
  keyPressedElement.textContent = keyPressed;

  function moveLine(line) {
    let newLine = line.filter((v) => v !== 0);
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        score += newLine[i];
        newLine[i + 1] = 0;
        mergeSound.play();
      }
    }
    return newLine.filter((v) => v !== 0).concat(Array(boardSize).fill(0)).slice(0, boardSize);
  }

  for (let i = 0; i < boardSize; i++) {
    let line;
    switch (dir) {
      case "left":
        line = board[i];
        break;
      case "right":
        line = [...board[i]].reverse();
        break;
      case "up":
        line = board.map((row) => row[i]);
        break;
      case "down":
        line = board.map((row) => row[i]).reverse();
        break;
    }

    const movedLine = moveLine(line);
    if (dir === "right") movedLine.reverse();
    if (dir === "down") movedLine.reverse();

    for (let j = 0; j < boardSize; j++) {
      let target;
      switch (dir) {
        case "left":
        case "right":
          target = board[i][j];
          if (target !== movedLine[j]) moved = true;
          board[i][j] = movedLine[j];
          break;
        case "up":
        case "down":
          target = board[j][i];
          if (target !== movedLine[j]) moved = true;
          board[j][i] = movedLine[j];
          break;
      }
    }
  }

  if (moved) {
    spawnTile();
    updateScore();
    renderBoard();
    moveSound.play();
  }
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      handleMove("up");
      break;
    case "ArrowDown":
    case "s":
    case "S":
      handleMove("down");
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      handleMove("left");
      break;
    case "ArrowRight":
    case "d":
    case "D":
      handleMove("right");
      break;
    case "Space":
    case "n":
    case "N":
        startNewGame();
        break;
  }
  checkGameOver();
});

updateBoardSizeStyles();
startNewGame();
