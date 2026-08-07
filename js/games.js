/* ==========================================================================
   Sidra's Birthday Celebration - Interactive Mini-Games Suite
   1. Original 1st Time Memory Card Game Logic
   2. Birthday Slider Puzzle Challenge
   3. Birthday Tic-Tac-Toe Game (Queen 👑 vs Smart Bot 💖)
   4. Spin Wheel of Fortune
   ========================================================================== */

class GamesManager {
  constructor() {
    this.initTabs();
    this.initMemoryGame();
    this.initPuzzleGame();
    this.initTicTacToe();
    this.initSpinWheel();
  }

  /* Game Tab Switching Logic */
  initTabs() {
    const tabs = document.querySelectorAll('.game-tab-btn');
    const panels = document.querySelectorAll('.game-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetId = `game-${tab.dataset.tab}`;
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');

        if (tab.dataset.tab === 'puzzle') {
          this.renderPuzzleBoard();
        }

        if (window.birthdayAudio) window.birthdayAudio.playPopSound();
      });
    });
  }

  /* --------------------------------------------------------------------------
     1. Original 1st Time Memory Card Game Logic
     -------------------------------------------------------------------------- */
  initMemoryGame() {
    this.memoryIcons = ['👑', '🎂', '💖', '🎁', '💐', '🍫', '✨', '🎈'];
    this.memoryCards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.memoryMoves = 0;

    this.renderMemoryGrid();
  }

  renderMemoryGrid() {
    const grid = document.getElementById('memory-grid');
    const movesEl = document.getElementById('memory-moves');
    if (!grid) return;

    this.matchedPairs = 0;
    this.memoryMoves = 0;
    this.flippedCards = [];
    if (movesEl) movesEl.textContent = "Moves: 0";

    const deck = [...this.memoryIcons, ...this.memoryIcons];
    deck.sort(() => Math.random() - 0.5);

    grid.innerHTML = '';
    deck.forEach((icon, index) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.icon = icon;
      card.dataset.index = index;
      card.textContent = '❓';

      card.addEventListener('click', () => this.handleMemoryCardClick(card));
      grid.appendChild(card);
    });
  }

  handleMemoryCardClick(card) {
    if (card.classList.contains('flipped') || this.flippedCards.length === 2) return;

    card.classList.add('flipped');
    card.textContent = card.dataset.icon;

    if (window.birthdayAudio) window.birthdayAudio.playPopSound();

    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.memoryMoves++;
      const movesEl = document.getElementById('memory-moves');
      if (movesEl) movesEl.textContent = `Moves: ${this.memoryMoves}`;

      const [card1, card2] = this.flippedCards;
      if (card1.dataset.icon === card2.dataset.icon) {
        this.matchedPairs++;
        this.flippedCards = [];

        if (this.matchedPairs === this.memoryIcons.length) {
          setTimeout(() => {
            const showFn = (window.AppController && window.AppController.showModal) || AppController.showModal;
            if (showFn) showFn("Memory Match Champion! 👑", `Sidra, you solved the memory puzzle in ${this.memoryMoves} moves!`, "🎉");
          }, 300);
        }
      } else {
        setTimeout(() => {
          card1.classList.remove('flipped');
          card2.classList.remove('flipped');
          card1.textContent = '❓';
          card2.textContent = '❓';
          this.flippedCards = [];
        }, 800);
      }
    }
  }

  /* --------------------------------------------------------------------------
     2. Birthday Slider Puzzle Challenge
     -------------------------------------------------------------------------- */
  initPuzzleGame() {
    this.puzzleGridSize = 3;
    this.puzzleTiles = [];
    this.puzzleMoves = 0;
    this.puzzleTime = 0;
    this.puzzleTimer = null;
    this.puzzleImgUrl = "assets/sidra_portrait.png";
    this.draggedTileIndex = null;

    const diffSelect = document.getElementById('puzzle-difficulty');
    const newBtn = document.getElementById('puzzle-new-btn');
    const solBtn = document.getElementById('puzzle-solution-btn');
    const previewModalBtn = document.getElementById('puzzle-preview-modal-btn');
    const chooseBtn = document.getElementById('puzzle-choose-btn');
    const imgFileInput = document.getElementById('puzzle-img-file');
    const previewImg = document.getElementById('puzzle-preview-img');

    diffSelect?.addEventListener('change', (e) => {
      this.puzzleGridSize = parseInt(e.target.value);
      this.startNewPuzzle();
    });

    newBtn?.addEventListener('click', () => this.startNewPuzzle());
    solBtn?.addEventListener('click', () => this.togglePuzzleSolution());
    
    previewModalBtn?.addEventListener('click', () => {
      const openFn = (window.AppController && window.AppController.openLightbox) || window.openLightbox;
      if (openFn) openFn(this.puzzleImgUrl);
    });

    previewImg?.addEventListener('click', () => {
      const openFn = (window.AppController && window.AppController.openLightbox) || window.openLightbox;
      if (openFn) openFn(this.puzzleImgUrl);
    });

    chooseBtn?.addEventListener('click', () => imgFileInput?.click());

    imgFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.puzzleImgUrl = evt.target.result;
          if (previewImg) previewImg.src = this.puzzleImgUrl;
          this.startNewPuzzle();
        };
        reader.readAsDataURL(file);
      }
    });

    this.startNewPuzzle();
  }

  startNewPuzzle() {
    clearInterval(this.puzzleTimer);
    this.puzzleTime = 0;
    this.puzzleMoves = 0;

    const movesEl = document.getElementById('puzzle-moves');
    const timeEl = document.getElementById('puzzle-time');
    if (movesEl) movesEl.textContent = '0';
    if (timeEl) timeEl.textContent = '00:00';

    this.puzzleTimer = setInterval(() => {
      this.puzzleTime++;
      const m = String(Math.floor(this.puzzleTime / 60)).padStart(2, '0');
      const s = String(this.puzzleTime % 60).padStart(2, '0');
      if (timeEl) timeEl.textContent = `${m}:${s}`;
    }, 1000);

    const totalTiles = this.puzzleGridSize * this.puzzleGridSize;
    this.puzzleTiles = Array.from({ length: totalTiles }, (_, i) => i);
    
    do {
      this.puzzleTiles.sort(() => Math.random() - 0.5);
    } while (!this.isPuzzleSolvable());

    this.renderPuzzleBoard();
  }

  isPuzzleSolvable() {
    let inversions = 0;
    const tiles = this.puzzleTiles;
    for (let i = 0; i < tiles.length - 1; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] > tiles[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
  }

  renderPuzzleBoard() {
    const board = document.getElementById('puzzle-board');
    if (!board) return;

    const size = this.puzzleGridSize;
    board.style.display = 'grid';
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    board.style.width = '100%';
    board.style.height = '100%';
    board.style.gap = '4px';
    board.innerHTML = '';

    this.puzzleTiles.forEach((tileValue, currentIndex) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      tile.draggable = true;
      tile.dataset.index = currentIndex;

      const origRow = Math.floor(tileValue / size);
      const origCol = tileValue % size;
      const pctX = size > 1 ? (origCol / (size - 1)) * 100 : 0;
      const pctY = size > 1 ? (origRow / (size - 1)) * 100 : 0;

      tile.style.backgroundImage = `url("${this.puzzleImgUrl}")`;
      tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
      tile.style.backgroundPosition = `${pctX}% ${pctY}%`;
      tile.style.backgroundRepeat = 'no-repeat';
      tile.style.borderRadius = '8px';
      tile.style.border = '1px solid rgba(255, 215, 0, 0.4)';
      tile.style.cursor = 'grab';

      tile.addEventListener('dragstart', (e) => {
        this.draggedTileIndex = currentIndex;
        e.dataTransfer.setData('text/plain', currentIndex);
      });

      tile.addEventListener('dragover', (e) => e.preventDefault());

      tile.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetIndex = currentIndex;
        if (this.draggedTileIndex !== null && this.draggedTileIndex !== targetIndex) {
          this.swapPuzzleTiles(this.draggedTileIndex, targetIndex);
        }
      });

      tile.addEventListener('click', () => {
        if (this.draggedTileIndex === null) {
          this.draggedTileIndex = currentIndex;
          tile.style.outline = '3px solid var(--accent-gold)';
        } else if (this.draggedTileIndex === currentIndex) {
          this.draggedTileIndex = null;
          tile.style.outline = 'none';
        } else {
          this.swapPuzzleTiles(this.draggedTileIndex, currentIndex);
          this.draggedTileIndex = null;
        }
      });

      board.appendChild(tile);
    });
  }

  swapPuzzleTiles(idx1, idx2) {
    const temp = this.puzzleTiles[idx1];
    this.puzzleTiles[idx1] = this.puzzleTiles[idx2];
    this.puzzleTiles[idx2] = temp;

    this.puzzleMoves++;
    const movesEl = document.getElementById('puzzle-moves');
    if (movesEl) movesEl.textContent = this.puzzleMoves;

    if (window.birthdayAudio) window.birthdayAudio.playPopSound();
    this.renderPuzzleBoard();

    if (this.checkPuzzleSolved()) {
      clearInterval(this.puzzleTimer);
      setTimeout(() => {
        const showFn = (window.AppController && window.AppController.showModal) || AppController.showModal;
        if (showFn) showFn("Puzzle Solved! 🧩", `Sidra, you solved the picture puzzle in ${this.puzzleMoves} moves!`, "👑");
      }, 300);
    }
  }

  checkPuzzleSolved() {
    return this.puzzleTiles.every((val, idx) => val === idx);
  }

  togglePuzzleSolution() {
    const board = document.getElementById('puzzle-board');
    if (!board) return;

    const isShowingSolution = board.dataset.solution === 'true';
    const totalTiles = this.puzzleGridSize * this.puzzleGridSize;

    if (isShowingSolution) {
      board.dataset.solution = 'false';
      this.renderPuzzleBoard();
    } else {
      board.dataset.solution = 'true';
      this.puzzleTiles = Array.from({ length: totalTiles }, (_, i) => i);
      this.renderPuzzleBoard();
    }
  }

  /* --------------------------------------------------------------------------
     3. Birthday Tic-Tac-Toe Game (Queen 👑 vs Smart Bot 💖)
     -------------------------------------------------------------------------- */
  initTicTacToe() {
    this.tttBoard = Array(9).fill('');
    this.tttCurrentTurn = '👑';
    this.tttGameMode = 'vs-bot';
    this.tttIsActive = true;
    this.tttScores = { p1: 0, p2: 0, ties: 0 };

    const modeSelect = document.getElementById('ttt-mode-select');
    const restartBtn = document.getElementById('ttt-restart-btn');

    modeSelect?.addEventListener('change', (e) => {
      this.tttGameMode = e.target.value;
      this.resetTicTacToe();
    });

    restartBtn?.addEventListener('click', () => this.resetTicTacToe());

    this.renderTicTacToeBoard();
  }

  resetTicTacToe() {
    this.tttBoard = Array(9).fill('');
    this.tttCurrentTurn = '👑';
    this.tttIsActive = true;
    this.updateTicTacToeStatus("Queen 👑's Turn");
    this.renderTicTacToeBoard();
  }

  renderTicTacToeBoard() {
    const board = document.getElementById('ttt-board');
    if (!board) return;

    board.innerHTML = '';
    this.tttBoard.forEach((cellVal, index) => {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell';
      cell.dataset.index = index;
      cell.textContent = cellVal;

      cell.addEventListener('click', () => this.handleTicTacToeCellClick(index));
      board.appendChild(cell);
    });
  }

  handleTicTacToeCellClick(index) {
    if (!this.tttIsActive || this.tttBoard[index] !== '') return;

    this.tttBoard[index] = this.tttCurrentTurn;
    if (window.birthdayAudio) window.birthdayAudio.playPopSound();

    this.renderTicTacToeBoard();

    if (this.checkTicTacToeWin(this.tttCurrentTurn)) {
      this.handleTicTacToeWin(this.tttCurrentTurn);
      return;
    }

    if (this.tttBoard.every(c => c !== '')) {
      this.handleTicTacToeTie();
      return;
    }

    if (this.tttGameMode === 'vs-bot') {
      this.tttCurrentTurn = '💖';
      this.tttIsActive = false;
      this.updateTicTacToeStatus("Bot 💖 is thinking...");

      setTimeout(() => this.makeTicTacToeBotMove(), 600);
    } else {
      this.tttCurrentTurn = this.tttCurrentTurn === '👑' ? '💖' : '👑';
      const name = this.tttCurrentTurn === '👑' ? "Queen 👑" : "Heart 💖";
      this.updateTicTacToeStatus(`${name}'s Turn`);
    }
  }

  makeTicTacToeBotMove() {
    const emptyIndices = this.tttBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    if (emptyIndices.length === 0) return;

    let chosenIndex = null;
    for (let idx of emptyIndices) {
      this.tttBoard[idx] = '💖';
      if (this.checkTicTacToeWin('💖')) {
        chosenIndex = idx;
        this.tttBoard[idx] = '';
        break;
      }
      this.tttBoard[idx] = '';
    }

    if (chosenIndex === null) {
      for (let idx of emptyIndices) {
        this.tttBoard[idx] = '👑';
        if (this.checkTicTacToeWin('👑')) {
          chosenIndex = idx;
          this.tttBoard[idx] = '';
          break;
        }
        this.tttBoard[idx] = '';
      }
    }

    if (chosenIndex === null) {
      chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    this.tttBoard[chosenIndex] = '💖';
    this.tttIsActive = true;
    if (window.birthdayAudio) window.birthdayAudio.playPopSound();

    this.renderTicTacToeBoard();

    if (this.checkTicTacToeWin('💖')) {
      this.handleTicTacToeWin('💖');
      return;
    }

    if (this.tttBoard.every(c => c !== '')) {
      this.handleTicTacToeTie();
      return;
    }

    this.tttCurrentTurn = '👑';
    this.updateTicTacToeStatus("Queen 👑's Turn");
  }

  checkTicTacToeWin(symbol) {
    const winLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of winLines) {
      const [a, b, c] = line;
      if (this.tttBoard[a] === symbol && this.tttBoard[b] === symbol && this.tttBoard[c] === symbol) {
        this.winningLine = line;
        return true;
      }
    }
    return false;
  }

  handleTicTacToeWin(winnerSymbol) {
    this.tttIsActive = false;
    const winnerName = winnerSymbol === '👑' ? "Queen 👑" : (this.tttGameMode === 'vs-bot' ? "Bot 💖" : "Heart 💖");
    this.updateTicTacToeStatus(`${winnerName} Wins! 🎉`);

    if (winnerSymbol === '👑') this.tttScores.p1++;
    else this.tttScores.p2++;

    this.updateTicTacToeScoreBoard();

    if (this.winningLine) {
      const cells = document.querySelectorAll('.ttt-cell');
      this.winningLine.forEach(idx => {
        if (cells[idx]) cells[idx].classList.add('win-cell');
      });
    }

    setTimeout(() => {
      const showFn = (window.AppController && window.AppController.showModal) || AppController.showModal;
      if (showFn) showFn("Tic-Tac-Toe Champion! 👑", `${winnerName} claims victory in the Birthday Battle!`, "🎉");
    }, 400);
  }

  handleTicTacToeTie() {
    this.tttIsActive = false;
    this.tttScores.ties++;
    this.updateTicTacToeScoreBoard();
    this.updateTicTacToeStatus("It's a Tie! 🤝");

    setTimeout(() => {
      const showFn = (window.AppController && window.AppController.showModal) || AppController.showModal;
      if (showFn) showFn("Game Tied! 🤝", "It's an even match! Play another round!", "👑");
    }, 300);
  }

  updateTicTacToeStatus(msg) {
    const el = document.getElementById('ttt-status');
    if (el) el.textContent = msg;
  }

  updateTicTacToeScoreBoard() {
    const p1El = document.getElementById('ttt-score-p1');
    const p2El = document.getElementById('ttt-score-p2');
    const tiesEl = document.getElementById('ttt-score-ties');

    if (p1El) p1El.textContent = this.tttScores.p1;
    if (p2El) p2El.textContent = this.tttScores.p2;
    if (tiesEl) tiesEl.textContent = this.tttScores.ties;
  }

  /* --------------------------------------------------------------------------
     4. Spin Wheel of Fortune
     -------------------------------------------------------------------------- */
  initSpinWheel() {
    this.wheelCanvas = document.getElementById('spin-wheel-canvas');
    this.spinBtn = document.getElementById('spin-wheel-btn');
    if (!this.wheelCanvas) return;

    this.wheelCtx = this.wheelCanvas.getContext('2d');
    this.wheelCanvas.width = 320;
    this.wheelCanvas.height = 320;

    this.segments = [
      "Royal Hug 🤗",
      "Golden Crown 👑",
      "Sweet Chocolate 🍫",
      "Magic Wish ✨",
      "Secret Surprise 🎁",
      "Endless Love 💖"
    ];

    this.colors = ['#FF4D8D', '#8A2BE2', '#FFD700', '#FF85A1', '#9B51E0', '#FFA500'];
    this.startAngle = 0;
    this.arc = Math.PI / (this.segments.length / 2);
    this.isSpinning = false;

    this.drawWheel();

    this.spinBtn?.addEventListener('click', () => this.spinWheel());
  }

  drawWheel() {
    if (!this.wheelCtx) return;

    const ctx = this.wheelCtx;
    const outsideRadius = 150;
    const textRadius = 100;
    const insideRadius = 25;

    ctx.clearRect(0, 0, 320, 320);

    for (let i = 0; i < this.segments.length; i++) {
      const angle = this.startAngle + i * this.arc;
      ctx.fillStyle = this.colors[i % this.colors.length];

      ctx.beginPath();
      ctx.arc(160, 160, outsideRadius, angle, angle + this.arc, false);
      ctx.arc(160, 160, insideRadius, angle + this.arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.translate(
        160 + Math.cos(angle + this.arc / 2) * textRadius,
        160 + Math.sin(angle + this.arc / 2) * textRadius,
      );
      ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
      ctx.font = "bold 13px Poppins, sans-serif";
      const text = this.segments[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }
  }

  spinWheel() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    let spinTime = 0;
    const spinTimeTotal = Math.random() * 3000 + 4000;
    const spinAngleStart = Math.random() * 10 + 10;

    const rotateWheel = () => {
      spinTime += 30;
      if (spinTime >= spinTimeTotal) {
        this.isSpinning = false;
        const degrees = (this.startAngle * 180 / Math.PI) % 360;
        const arcd = this.arc * 180 / Math.PI;
        const index = Math.floor((360 - degrees % 360) / arcd) % this.segments.length;

        const wonPrize = this.segments[index];
        setTimeout(() => {
          const showFn = (window.AppController && window.AppController.showModal) || AppController.showModal;
          if (showFn) showFn("Wheel Prize Unlocked! 🎡", `Sidra, you won: ${wonPrize}!`, "👑");
        }, 200);
        return;
      }

      const spinAngle = spinAngleStart - (spinTime / spinTimeTotal) * spinAngleStart;
      this.startAngle += (spinAngle * Math.PI / 180);
      this.drawWheel();
      requestAnimationFrame(rotateWheel);
    };

    rotateWheel();
  }
}

function startGamesManager() {
  window.gamesManager = new GamesManager();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGamesManager);
} else {
  startGamesManager();
}
