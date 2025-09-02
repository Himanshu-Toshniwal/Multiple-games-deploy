class MultiGamePlatform {
    constructor() {
        this.currentGame = 'menu';
        this.games = {
            tictactoe: new TicTacToe(),
            memory: new MemoryGame(),
            snake: new SnakeGame(),
            airhockey: new AirHockey(),
            pong: new PongGame(),
            breakout: new BreakoutGame()
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('menu');
    }

    setupEventListeners() {
        // Game selector buttons
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const game = e.target.dataset.game;
                this.switchGame(game);
            });
        });

        // Game card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const game = e.target.closest('.game-card').dataset.game;
                this.switchGame(game);
            });
        });

        // Modal buttons
        document.getElementById('play-again').addEventListener('click', () => {
            this.hideModal();
            if (this.currentGame === 'snake' || this.currentGame === 'breakout') {
                this.games[this.currentGame].startGame();
            } else {
                this.games[this.currentGame].resetGame();
            }
        });

        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.hideModal();
            this.switchGame('menu');
        });
    }

    switchGame(game) {
        this.currentGame = game;
        this.showScreen(game);
        
        // Update active button
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.game === game);
        });

        // Initialize game if not menu
        if (game !== 'menu' && this.games[game]) {
            this.games[game].init();
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.game-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showWinner(winnerData) {
        const modal = document.getElementById('winner-modal');
        const emoji = document.getElementById('winner-emoji');
        const text = document.getElementById('winner-text');
        const details = document.getElementById('winner-details');

        emoji.textContent = winnerData.emoji;
        text.textContent = winnerData.title;
        details.innerHTML = winnerData.details;

        modal.classList.add('show');
    }

    hideModal() {
        document.getElementById('winner-modal').classList.remove('show');
    }
}

class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'computer';
        this.player1Name = 'Player 1';
        this.player2Name = 'Computer';
        this.scores = { player1: 0, player2: 0 };
        this.gameActive = false;
    }

    init() {
        this.setupEventListeners();
        this.showSetup();
    }

    setupEventListeners() {
        // Mode selector
        document.querySelectorAll('#tictactoe .mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.target.dataset.mode);
            });
        });

        // Start button
        document.getElementById('ttt-start').addEventListener('click', () => {
            this.startGame();
        });

        // Control buttons
        document.getElementById('ttt-reset').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('ttt-back').addEventListener('click', () => {
            platform.switchGame('menu');
        });
    }

    setMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('#tictactoe .mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const player2Group = document.getElementById('ttt-player2-group');
        if (mode === 'player') {
            player2Group.style.display = 'block';
            this.player2Name = 'Player 2';
        } else {
            player2Group.style.display = 'none';
            this.player2Name = 'Computer';
        }
    }

    showSetup() {
        document.getElementById('ttt-setup').style.display = 'block';
        document.getElementById('ttt-game').style.display = 'none';
    }

    startGame() {
        this.player1Name = document.getElementById('ttt-player1').value || 'Player 1';
        if (this.gameMode === 'player') {
            this.player2Name = document.getElementById('ttt-player2').value || 'Player 2';
        }

        document.getElementById('ttt-setup').style.display = 'none';
        document.getElementById('ttt-game').style.display = 'block';

        this.resetGame();
        this.updateDisplay();
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.createBoard();
        this.updateDisplay();
    }

    createBoard() {
        const boardElement = document.getElementById('ttt-board');
        boardElement.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.className = 'ttt-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.makeMove(i));
            boardElement.appendChild(cell);
        }
    }

    makeMove(index) {
        if (!this.gameActive || this.board[index] !== '') return;

        this.board[index] = this.currentPlayer;
        this.updateBoard();

        if (this.checkWinner()) {
            this.endGame();
            return;
        }

        if (this.board.every(cell => cell !== '')) {
            this.endGame(true);
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();

        // Computer move
        if (this.gameMode === 'computer' && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => this.computerMove(), 500);
        }
    }

    computerMove() {
        const availableMoves = this.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        if (availableMoves.length === 0) return;

        // Simple AI: try to win, block player, or random move
        let move = this.findBestMove('O') || this.findBestMove('X') || availableMoves[Math.floor(Math.random() * availableMoves.length)];
        this.makeMove(move);
    }

    findBestMove(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            const line = [this.board[a], this.board[b], this.board[c]];
            const playerCount = line.filter(cell => cell === player).length;
            const emptyCount = line.filter(cell => cell === '').length;

            if (playerCount === 2 && emptyCount === 1) {
                return pattern.find(index => this.board[index] === '');
            }
        }
        return null;
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningPattern = pattern;
                return true;
            }
        }
        return false;
    }

    endGame(draw = false) {
        this.gameActive = false;

        if (!draw) {
            // Highlight winning cells
            this.winningPattern.forEach(index => {
                document.querySelector(`[data-index="${index}"]`).classList.add('winning');
            });

            const winner = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
            if (this.currentPlayer === 'X') {
                this.scores.player1++;
            } else {
                this.scores.player2++;
            }

            this.updateDisplay();

            setTimeout(() => {
                platform.showWinner({
                    emoji: '🏆',
                    title: `🎉 ${winner} Wins! 🎉`,
                    details: `
                        <div style="font-size: 1.5rem; margin-bottom: 15px;">${winner === this.player1Name ? '⭕' : '❌'}</div>
                        <div><strong>${this.player1Name}:</strong> ${this.scores.player1}</div>
                        <div><strong>${this.player2Name}:</strong> ${this.scores.player2}</div>
                    `
                });
            }, 1000);
        } else {
            setTimeout(() => {
                platform.showWinner({
                    emoji: '🤝',
                    title: '🤝 It\'s a Draw! 🤝',
                    details: `
                        <div style="font-size: 1.5rem; margin-bottom: 15px;">⭕ ❌</div>
                        <div><strong>${this.player1Name}:</strong> ${this.scores.player1}</div>
                        <div><strong>${this.player2Name}:</strong> ${this.scores.player2}</div>
                    `
                });
            }, 500);
        }
    }

    updateBoard() {
        document.querySelectorAll('.ttt-cell').forEach((cell, index) => {
            cell.textContent = this.board[index] === 'X' ? '⭕' : this.board[index] === 'O' ? '❌' : '';
        });
    }

    updateDisplay() {
        const currentPlayerName = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
        const symbol = this.currentPlayer === 'X' ? '⭕' : '❌';
        
        document.getElementById('ttt-current').textContent = this.gameActive ? `${currentPlayerName}'s Turn` : 'Game Over';
        document.getElementById('ttt-symbol').textContent = symbol;
        document.getElementById('ttt-score1').textContent = `${this.player1Name}: ${this.scores.player1}`;
        document.getElementById('ttt-score2').textContent = `${this.player2Name}: ${this.scores.player2}`;
    }
}

class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.currentPlayer = 1;
        this.gameMode = 'computer';
        this.player1Name = 'Player 1';
        this.player2Name = 'Computer';
        this.scores = { player1: 0, player2: 0 };
        this.gameActive = false;
        this.emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    }

    init() {
        this.setupEventListeners();
        this.showSetup();
    }

    setupEventListeners() {
        // Mode selector
        document.querySelectorAll('#memory .mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.target.dataset.mode);
            });
        });

        // Start button
        document.getElementById('memory-start').addEventListener('click', () => {
            this.startGame();
        });

        // Control buttons
        document.getElementById('memory-reset').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('memory-back').addEventListener('click', () => {
            platform.switchGame('menu');
        });
    }

    setMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('#memory .mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const player2Group = document.getElementById('memory-player2-group');
        if (mode === 'player') {
            player2Group.style.display = 'block';
            this.player2Name = 'Player 2';
        } else {
            player2Group.style.display = 'none';
            this.player2Name = 'Computer';
        }
    }

    showSetup() {
        document.getElementById('memory-setup').style.display = 'block';
        document.getElementById('memory-game').style.display = 'none';
    }

    startGame() {
        this.player1Name = document.getElementById('memory-player1').value || 'Player 1';
        if (this.gameMode === 'player') {
            this.player2Name = document.getElementById('memory-player2').value || 'Player 2';
        }

        document.getElementById('memory-setup').style.display = 'none';
        document.getElementById('memory-game').style.display = 'block';

        this.resetGame();
        this.updateDisplay();
    }

    resetGame() {
        this.cards = [...this.emojis, ...this.emojis].sort(() => Math.random() - 0.5);
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.currentPlayer = 1;
        this.gameActive = true;
        this.createBoard();
        this.updateDisplay();
    }

    createBoard() {
        const boardElement = document.getElementById('memory-board');
        boardElement.innerHTML = '';

        this.cards.forEach((emoji, index) => {
            const card = document.createElement('button');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.emoji = emoji;
            card.textContent = '❓';
            card.addEventListener('click', () => this.flipCard(index));
            boardElement.appendChild(card);
        });
    }

    flipCard(index) {
        if (!this.gameActive || this.flippedCards.length >= 2) return;
        
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.textContent = card.dataset.emoji;
        this.flippedCards.push({ index, emoji: card.dataset.emoji, element: card });

        if (this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 1000);
        }

        // Computer turn
        if (this.gameMode === 'computer' && this.currentPlayer === 2 && this.flippedCards.length === 0) {
            setTimeout(() => this.computerMove(), 1000);
        }
    }

    computerMove() {
        if (!this.gameActive || this.flippedCards.length > 0) return;

        const availableCards = Array.from(document.querySelectorAll('.memory-card'))
            .filter(card => !card.classList.contains('flipped') && !card.classList.contains('matched'));

        if (availableCards.length === 0) return;

        // Simple AI: random moves
        const randomCard1 = availableCards[Math.floor(Math.random() * availableCards.length)];
        this.flipCard(parseInt(randomCard1.dataset.index));

        setTimeout(() => {
            const stillAvailable = Array.from(document.querySelectorAll('.memory-card'))
                .filter(card => !card.classList.contains('flipped') && !card.classList.contains('matched'));
            
            if (stillAvailable.length > 0) {
                const randomCard2 = stillAvailable[Math.floor(Math.random() * stillAvailable.length)];
                this.flipCard(parseInt(randomCard2.dataset.index));
            }
        }, 500);
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.emoji === card2.emoji) {
            // Match found
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            this.matchedPairs++;

            if (this.currentPlayer === 1) {
                this.scores.player1++;
            } else {
                this.scores.player2++;
            }

            if (this.matchedPairs === this.emojis.length) {
                this.endGame();
                return;
            }
        } else {
            // No match
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                card1.element.textContent = '❓';
                card2.element.textContent = '❓';
                this.switchPlayer();
            }, 500);
        }

        this.flippedCards = [];
        this.updateDisplay();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateDisplay();

        if (this.gameMode === 'computer' && this.currentPlayer === 2) {
            setTimeout(() => this.computerMove(), 1000);
        }
    }

    endGame() {
        this.gameActive = false;
        const winner = this.scores.player1 > this.scores.player2 ? this.player1Name : 
                      this.scores.player2 > this.scores.player1 ? this.player2Name : null;

        setTimeout(() => {
            if (winner) {
                platform.showWinner({
                    emoji: '🧠',
                    title: `🎉 ${winner} Wins! 🎉`,
                    details: `
                        <div style="font-size: 1.5rem; margin-bottom: 15px;">🏆</div>
                        <div><strong>${this.player1Name}:</strong> ${this.scores.player1} pairs</div>
                        <div><strong>${this.player2Name}:</strong> ${this.scores.player2} pairs</div>
                    `
                });
            } else {
                platform.showWinner({
                    emoji: '🤝',
                    title: '🤝 It\'s a Tie! 🤝',
                    details: `
                        <div style="font-size: 1.5rem; margin-bottom: 15px;">🧠</div>
                        <div><strong>${this.player1Name}:</strong> ${this.scores.player1} pairs</div>
                        <div><strong>${this.player2Name}:</strong> ${this.scores.player2} pairs</div>
                    `
                });
            }
        }, 1000);
    }

    updateDisplay() {
        const currentPlayerName = this.currentPlayer === 1 ? this.player1Name : this.player2Name;
        document.getElementById('memory-current').textContent = this.gameActive ? `${currentPlayerName}'s Turn` : 'Game Over';
        document.getElementById('memory-score1').textContent = `${this.player1Name}: ${this.scores.player1}`;
        document.getElementById('memory-score2').textContent = `${this.player2Name}: ${this.scores.player2}`;
    }
}

class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: 0, y: 0 };
        this.food = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameActive = false;
        this.gameLoop = null;
        this.playerName = 'Player';
        this.isPaused = false;
    }

    init() {
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.showSetup();
    }

    setupEventListeners() {
        // Start button
        document.getElementById('snake-start').addEventListener('click', () => {
            this.startGame();
        });

        // Control buttons
        document.getElementById('snake-pause').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('snake-reset').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('snake-back').addEventListener('click', () => {
            this.stopGame();
            platform.switchGame('menu');
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('snake').classList.contains('active')) {
                switch(e.key) {
                    case 'ArrowUp': 
                        e.preventDefault();
                        this.changeDirection('up'); 
                        break;
                    case 'ArrowDown': 
                        e.preventDefault();
                        this.changeDirection('down'); 
                        break;
                    case 'ArrowLeft': 
                        e.preventDefault();
                        this.changeDirection('left'); 
                        break;
                    case 'ArrowRight': 
                        e.preventDefault();
                        this.changeDirection('right'); 
                        break;
                    case ' ': 
                        e.preventDefault();
                        this.togglePause(); 
                        break;
                }
            }
        });
    }

    showSetup() {
        document.getElementById('snake-setup').style.display = 'block';
        document.getElementById('snake-game').style.display = 'none';
    }

    startGame() {
        this.playerName = document.getElementById('snake-player').value || 'Player';
        
        document.getElementById('snake-setup').style.display = 'none';
        document.getElementById('snake-game').style.display = 'block';

        this.resetGame();
        this.updateDisplay();
        
        // Start game loop
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 200);
    }

    resetGame() {
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.gameActive = false; // Don't start immediately
        this.isPaused = false;
        this.generateFood();
        this.updateDisplay();
        this.draw();
        document.getElementById('snake-pause').textContent = '⏸️ Pause';
    }

    stopGame() {
        this.gameActive = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    togglePause() {
        if (!this.gameActive) return;
        
        this.isPaused = !this.isPaused;
        document.getElementById('snake-pause').textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
    }

    changeDirection(dir) {
        const directions = {
            up: { x: 0, y: -20 },
            down: { x: 0, y: 20 },
            left: { x: -20, y: 0 },
            right: { x: 20, y: 0 }
        };

        const newDir = directions[dir];
        
        // Start game on first move
        if (!this.gameActive && this.direction.x === 0 && this.direction.y === 0) {
            this.gameActive = true;
            this.direction = newDir;
            return;
        }
        
        if (!this.gameActive || this.isPaused) return;
        
        // Prevent reverse direction
        if (newDir.x === -this.direction.x && newDir.y === -this.direction.y) return;
        
        this.direction = newDir;
    }

    update() {
        if (!this.gameActive || this.isPaused || (this.direction.x === 0 && this.direction.y === 0)) return;

        // Move snake
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        // Check wall collision
        if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
            this.endGame();
            return;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            this.updateDisplay();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * 20) * 20,
                y: Math.floor(Math.random() * 20) * 20
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
        
        // Ensure food is within canvas bounds
        if (this.food.x >= 400) this.food.x = 380;
        if (this.food.y >= 400) this.food.y = 380;
    }

    draw() {
        // Clear canvas with black background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 400, 400);

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Snake head - green
                this.ctx.fillStyle = '#4ecdc4';
                this.ctx.fillRect(segment.x + 1, segment.y + 1, 18, 18);
                // Add eyes
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(segment.x + 4, segment.y + 4, 3, 3);
                this.ctx.fillRect(segment.x + 13, segment.y + 4, 3, 3);
            } else {
                // Snake body - lighter green
                this.ctx.fillStyle = '#96ceb4';
                this.ctx.fillRect(segment.x + 1, segment.y + 1, 18, 18);
            }
        });

        // Draw food as apple emoji style
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fillRect(this.food.x + 1, this.food.y + 1, 18, 18);
        // Add apple details
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(this.food.x + 8, this.food.y + 1, 4, 6);
    }

    endGame() {
        this.gameActive = false;
        this.stopGame();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }

        this.updateDisplay();

        setTimeout(() => {
            platform.showWinner({
                emoji: '🐍',
                title: '🎮 Game Over! 🎮',
                details: `
                    <div style="font-size: 1.5rem; margin-bottom: 15px;">🏆</div>
                    <div><strong>Player:</strong> ${this.playerName}</div>
                    <div><strong>Final Score:</strong> ${this.score}</div>
                    <div><strong>High Score:</strong> ${this.highScore}</div>
                    <div style="margin-top: 10px;">Length: ${this.snake.length} segments</div>
                `
            });
        }, 500);
    }

    updateDisplay() {
        document.getElementById('snake-player-name').textContent = this.playerName;
        document.getElementById('snake-score').textContent = `Score: ${this.score}`;
        document.getElementById('snake-high-score').textContent = `High Score: ${this.highScore}`;
    }
}

class AirHockey {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameMode = 'computer';
        this.player1Name = 'Player 1';
        this.player2Name = 'Computer';
        this.scores = { player1: 0, player2: 0 };
        this.gameActive = false;
        this.gameLoop = null;
        
        this.puck = { x: 300, y: 200, vx: 0, vy: 0, radius: 15 };
        this.paddle1 = { x: 50, y: 200, radius: 25 };
        this.paddle2 = { x: 550, y: 200, radius: 25 };
    }

    init() {
        this.canvas = document.getElementById('airhockey-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.showSetup();
    }

    setupEventListeners() {
        document.querySelectorAll('#airhockey .mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.target.dataset.mode);
            });
        });

        document.getElementById('airhockey-start').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('airhockey-reset').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('airhockey-back').addEventListener('click', () => {
            this.stopGame();
            platform.switchGame('menu');
        });

        this.canvas?.addEventListener('mousemove', (e) => {
            if (!this.gameActive) return;
            const rect = this.canvas.getBoundingClientRect();
            this.paddle1.x = Math.max(25, Math.min(275, e.clientX - rect.left));
            this.paddle1.y = Math.max(25, Math.min(375, e.clientY - rect.top));
        });
    }

    setMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('#airhockey .mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const player2Group = document.getElementById('airhockey-player2-group');
        if (mode === 'player') {
            player2Group.style.display = 'block';
            this.player2Name = 'Player 2';
        } else {
            player2Group.style.display = 'none';
            this.player2Name = 'Computer';
        }
    }

    showSetup() {
        document.getElementById('airhockey-setup').style.display = 'block';
        document.getElementById('airhockey-game').style.display = 'none';
    }

    startGame() {
        this.player1Name = document.getElementById('airhockey-player1').value || 'Player 1';
        if (this.gameMode === 'player') {
            this.player2Name = document.getElementById('airhockey-player2').value || 'Player 2';
        }

        document.getElementById('airhockey-setup').style.display = 'none';
        document.getElementById('airhockey-game').style.display = 'block';

        this.resetGame();
        this.updateDisplay();
        this.gameLoop = setInterval(() => this.update(), 16);
    }

    resetGame() {
        this.puck = { x: 300, y: 200, vx: Math.random() > 0.5 ? 3 : -3, vy: (Math.random() - 0.5) * 2, radius: 15 };
        this.paddle1 = { x: 50, y: 200, radius: 25 };
        this.paddle2 = { x: 550, y: 200, radius: 25 };
        this.gameActive = true;
        this.draw();
    }

    stopGame() {
        this.gameActive = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    update() {
        if (!this.gameActive) return;

        // Move puck
        this.puck.x += this.puck.vx;
        this.puck.y += this.puck.vy;

        // Wall collisions
        if (this.puck.y <= this.puck.radius || this.puck.y >= 400 - this.puck.radius) {
            this.puck.vy = -this.puck.vy;
        }

        // Goal detection - only score if puck is within goal area
        if (this.puck.x <= 10 && this.puck.y >= 150 && this.puck.y <= 250) {
            this.scores.player2++;
            this.resetPuck();
        } else if (this.puck.x >= 590 && this.puck.y >= 150 && this.puck.y <= 250) {
            this.scores.player1++;
            this.resetPuck();
        }
        
        // Bounce off walls if not in goal area
        if (this.puck.x <= this.puck.radius && (this.puck.y < 150 || this.puck.y > 250)) {
            this.puck.vx = Math.abs(this.puck.vx);
        }
        if (this.puck.x >= 600 - this.puck.radius && (this.puck.y < 150 || this.puck.y > 250)) {
            this.puck.vx = -Math.abs(this.puck.vx);
        }

        // Paddle collisions
        this.checkPaddleCollision(this.paddle1);
        this.checkPaddleCollision(this.paddle2);

        // AI for computer
        if (this.gameMode === 'computer') {
            this.paddle2.y += (this.puck.y - this.paddle2.y) * 0.1;
            this.paddle2.y = Math.max(25, Math.min(375, this.paddle2.y));
        }

        // Check win condition
        if (this.scores.player1 >= 5 || this.scores.player2 >= 5) {
            this.endGame();
            return;
        }

        this.updateDisplay();
        this.draw();
    }

    checkPaddleCollision(paddle) {
        const dx = this.puck.x - paddle.x;
        const dy = this.puck.y - paddle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.puck.radius + paddle.radius) {
            const angle = Math.atan2(dy, dx);
            this.puck.vx = Math.cos(angle) * 5;
            this.puck.vy = Math.sin(angle) * 5;
        }
    }

    resetPuck() {
        this.puck.x = 300;
        this.puck.y = 200;
        this.puck.vx = Math.random() > 0.5 ? 3 : -3;
        this.puck.vy = (Math.random() - 0.5) * 2;
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 600, 400);

        // Draw center line
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(300, 0);
        this.ctx.lineTo(300, 400);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw goals with proper boundaries
        this.ctx.strokeStyle = '#e91e63';
        this.ctx.lineWidth = 3;
        
        // Left goal
        this.ctx.strokeRect(0, 150, 10, 100);
        this.ctx.beginPath();
        this.ctx.moveTo(10, 150);
        this.ctx.lineTo(10, 0);
        this.ctx.moveTo(10, 250);
        this.ctx.lineTo(10, 400);
        this.ctx.stroke();
        
        // Right goal
        this.ctx.strokeRect(590, 150, 10, 100);
        this.ctx.beginPath();
        this.ctx.moveTo(590, 150);
        this.ctx.lineTo(590, 0);
        this.ctx.moveTo(590, 250);
        this.ctx.lineTo(590, 400);
        this.ctx.stroke();
        
        // Goal area highlights
        this.ctx.fillStyle = 'rgba(233, 30, 99, 0.2)';
        this.ctx.fillRect(0, 150, 10, 100);
        this.ctx.fillRect(590, 150, 10, 100);

        // Draw paddles
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.beginPath();
        this.ctx.arc(this.paddle1.x, this.paddle1.y, this.paddle1.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#e91e63';
        this.ctx.beginPath();
        this.ctx.arc(this.paddle2.x, this.paddle2.y, this.paddle2.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw puck
        this.ctx.fillStyle = '#feca57';
        this.ctx.beginPath();
        this.ctx.arc(this.puck.x, this.puck.y, this.puck.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    endGame() {
        this.gameActive = false;
        this.stopGame();
        const winner = this.scores.player1 >= 5 ? this.player1Name : this.player2Name;
        
        setTimeout(() => {
            platform.showWinner({
                emoji: '🏒',
                title: `🎉 ${winner} Wins! 🎉`,
                details: `
                    <div style="font-size: 1.5rem; margin-bottom: 15px;">🏆</div>
                    <div><strong>${this.player1Name}:</strong> ${this.scores.player1}</div>
                    <div><strong>${this.player2Name}:</strong> ${this.scores.player2}</div>
                `
            });
        }, 500);
    }

    updateDisplay() {
        document.getElementById('airhockey-score1').textContent = `${this.player1Name}: ${this.scores.player1}`;
        document.getElementById('airhockey-score2').textContent = `${this.player2Name}: ${this.scores.player2}`;
    }
}

class PongGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameMode = 'computer';
        this.player1Name = 'Player 1';
        this.player2Name = 'Computer';
        this.scores = { player1: 0, player2: 0 };
        this.gameActive = false;
        this.gameLoop = null;
        
        this.ball = { x: 300, y: 200, vx: 4, vy: 2, radius: 8 };
        this.paddle1 = { x: 10, y: 150, width: 10, height: 100 };
        this.paddle2 = { x: 580, y: 150, width: 10, height: 100 };
        this.keys = {};
    }

    init() {
        this.canvas = document.getElementById('pong-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.showSetup();
    }

    setupEventListeners() {
        document.querySelectorAll('#pong .mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.target.dataset.mode);
            });
        });

        document.getElementById('pong-start').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('pong-reset').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('pong-back').addEventListener('click', () => {
            this.stopGame();
            platform.switchGame('menu');
        });

        document.addEventListener('keydown', (e) => {
            if (document.getElementById('pong').classList.contains('active')) {
                this.keys[e.key] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (document.getElementById('pong').classList.contains('active')) {
                this.keys[e.key] = false;
            }
        });
    }

    setMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('#pong .mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const player2Group = document.getElementById('pong-player2-group');
        if (mode === 'player') {
            player2Group.style.display = 'block';
            this.player2Name = 'Player 2';
        } else {
            player2Group.style.display = 'none';
            this.player2Name = 'Computer';
        }
    }

    showSetup() {
        document.getElementById('pong-setup').style.display = 'block';
        document.getElementById('pong-game').style.display = 'none';
    }

    startGame() {
        this.player1Name = document.getElementById('pong-player1').value || 'Player 1';
        if (this.gameMode === 'player') {
            this.player2Name = document.getElementById('pong-player2').value || 'Player 2';
        }

        document.getElementById('pong-setup').style.display = 'none';
        document.getElementById('pong-game').style.display = 'block';

        this.resetGame();
        this.updateDisplay();
        this.gameLoop = setInterval(() => this.update(), 16);
    }

    resetGame() {
        this.ball = { x: 300, y: 200, vx: Math.random() > 0.5 ? 4 : -4, vy: (Math.random() - 0.5) * 4, radius: 8 };
        this.paddle1 = { x: 10, y: 150, width: 10, height: 100 };
        this.paddle2 = { x: 580, y: 150, width: 10, height: 100 };
        this.gameActive = true;
        this.draw();
    }

    stopGame() {
        this.gameActive = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    update() {
        if (!this.gameActive) return;

        // Move paddles
        if (this.keys['w'] || this.keys['W']) {
            this.paddle1.y = Math.max(0, this.paddle1.y - 6);
        }
        if (this.keys['s'] || this.keys['S']) {
            this.paddle1.y = Math.min(300, this.paddle1.y + 6);
        }

        // AI or Player 2 controls
        if (this.gameMode === 'computer') {
            this.paddle2.y += (this.ball.y - this.paddle2.y - 50) * 0.1;
            this.paddle2.y = Math.max(0, Math.min(300, this.paddle2.y));
        } else {
            if (this.keys['ArrowUp']) {
                this.paddle2.y = Math.max(0, this.paddle2.y - 6);
            }
            if (this.keys['ArrowDown']) {
                this.paddle2.y = Math.min(300, this.paddle2.y + 6);
            }
        }

        // Move ball
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Ball collision with top/bottom
        if (this.ball.y <= this.ball.radius || this.ball.y >= 400 - this.ball.radius) {
            this.ball.vy = -this.ball.vy;
        }

        // Ball collision with paddles
        if (this.ball.x <= this.paddle1.x + this.paddle1.width && 
            this.ball.y >= this.paddle1.y && 
            this.ball.y <= this.paddle1.y + this.paddle1.height) {
            this.ball.vx = -this.ball.vx;
            this.ball.vy += (Math.random() - 0.5) * 2;
        }

        if (this.ball.x >= this.paddle2.x && 
            this.ball.y >= this.paddle2.y && 
            this.ball.y <= this.paddle2.y + this.paddle2.height) {
            this.ball.vx = -this.ball.vx;
            this.ball.vy += (Math.random() - 0.5) * 2;
        }

        // Score
        if (this.ball.x <= 0) {
            this.scores.player2++;
            this.resetBall();
        } else if (this.ball.x >= 600) {
            this.scores.player1++;
            this.resetBall();
        }

        // Check win condition
        if (this.scores.player1 >= 10 || this.scores.player2 >= 10) {
            this.endGame();
            return;
        }

        this.updateDisplay();
        this.draw();
    }

    resetBall() {
        this.ball.x = 300;
        this.ball.y = 200;
        this.ball.vx = Math.random() > 0.5 ? 4 : -4;
        this.ball.vy = (Math.random() - 0.5) * 4;
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 600, 400);

        // Draw center line
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(300, 0);
        this.ctx.lineTo(300, 400);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        
        this.ctx.fillStyle = '#e91e63';
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);

        // Draw ball
        this.ctx.fillStyle = '#feca57';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    endGame() {
        this.gameActive = false;
        this.stopGame();
        const winner = this.scores.player1 >= 10 ? this.player1Name : this.player2Name;
        
        setTimeout(() => {
            platform.showWinner({
                emoji: '🏓',
                title: `🎉 ${winner} Wins! 🎉`,
                details: `
                    <div style="font-size: 1.5rem; margin-bottom: 15px;">🏆</div>
                    <div><strong>${this.player1Name}:</strong> ${this.scores.player1}</div>
                    <div><strong>${this.player2Name}:</strong> ${this.scores.player2}</div>
                `
            });
        }, 500);
    }

    updateDisplay() {
        document.getElementById('pong-score1').textContent = `${this.player1Name}: ${this.scores.player1}`;
        document.getElementById('pong-score2').textContent = `${this.player2Name}: ${this.scores.player2}`;
    }
}

class BreakoutGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.playerName = 'Player';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameActive = false;
        this.gameLoop = null;
        this.isPaused = false;
        
        this.ball = { x: 300, y: 400, vx: 4, vy: -4, radius: 8 };
        this.paddle = { x: 250, y: 460, width: 100, height: 10 };
        this.bricks = [];
        this.keys = {};
    }

    init() {
        this.canvas = document.getElementById('breakout-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.showSetup();
    }

    setupEventListeners() {
        document.getElementById('breakout-start').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('breakout-pause').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('breakout-reset').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('breakout-back').addEventListener('click', () => {
            this.stopGame();
            platform.switchGame('menu');
        });

        document.addEventListener('keydown', (e) => {
            if (document.getElementById('breakout').classList.contains('active')) {
                this.keys[e.key] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (document.getElementById('breakout').classList.contains('active')) {
                this.keys[e.key] = false;
            }
        });

        this.canvas?.addEventListener('mousemove', (e) => {
            if (!this.gameActive) return;
            const rect = this.canvas.getBoundingClientRect();
            this.paddle.x = Math.max(0, Math.min(500, e.clientX - rect.left - this.paddle.width / 2));
        });
    }

    showSetup() {
        document.getElementById('breakout-setup').style.display = 'block';
        document.getElementById('breakout-game').style.display = 'none';
    }

    startGame() {
        this.playerName = document.getElementById('breakout-player').value || 'Player';
        
        document.getElementById('breakout-setup').style.display = 'none';
        document.getElementById('breakout-game').style.display = 'block';

        this.resetGame();
        this.updateDisplay();
        this.gameLoop = setInterval(() => this.update(), 16);
    }

    resetGame() {
        this.ball = { x: 300, y: 400, vx: 4, vy: -4, radius: 8 };
        this.paddle = { x: 250, y: 460, width: 100, height: 10 };
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameActive = true;
        this.isPaused = false;
        this.createBricks();
        this.draw();
        document.getElementById('breakout-pause').textContent = '⏸️ Pause';
    }

    createBricks() {
        this.bricks = [];
        const colors = ['#e91e63', '#4ecdc4', '#feca57', '#f093fb', '#764ba2'];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                this.bricks.push({
                    x: col * 60,
                    y: row * 30 + 50,
                    width: 55,
                    height: 25,
                    color: colors[row],
                    visible: true
                });
            }
        }
    }

    stopGame() {
        this.gameActive = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    togglePause() {
        if (!this.gameActive) return;
        this.isPaused = !this.isPaused;
        document.getElementById('breakout-pause').textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
    }

    update() {
        if (!this.gameActive || this.isPaused) return;

        // Move paddle
        if (this.keys['a'] || this.keys['A']) {
            this.paddle.x = Math.max(0, this.paddle.x - 8);
        }
        if (this.keys['d'] || this.keys['D']) {
            this.paddle.x = Math.min(500, this.paddle.x + 8);
        }

        // Move ball
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Ball collision with walls
        if (this.ball.x <= this.ball.radius || this.ball.x >= 600 - this.ball.radius) {
            this.ball.vx = -this.ball.vx;
        }
        if (this.ball.y <= this.ball.radius) {
            this.ball.vy = -this.ball.vy;
        }

        // Ball collision with paddle
        if (this.ball.y >= this.paddle.y - this.ball.radius &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width) {
            this.ball.vy = -Math.abs(this.ball.vy);
            this.ball.vx += (this.ball.x - (this.paddle.x + this.paddle.width / 2)) * 0.1;
        }

        // Ball collision with bricks
        this.bricks.forEach(brick => {
            if (brick.visible &&
                this.ball.x >= brick.x &&
                this.ball.x <= brick.x + brick.width &&
                this.ball.y >= brick.y &&
                this.ball.y <= brick.y + brick.height) {
                brick.visible = false;
                this.ball.vy = -this.ball.vy;
                this.score += 10;
            }
        });

        // Check if ball fell
        if (this.ball.y >= 500) {
            this.lives--;
            if (this.lives <= 0) {
                this.endGame();
                return;
            }
            this.ball = { x: 300, y: 400, vx: 4, vy: -4, radius: 8 };
        }

        // Check if all bricks destroyed
        if (this.bricks.every(brick => !brick.visible)) {
            this.level++;
            this.createBricks();
            this.ball.vx *= 1.1;
            this.ball.vy *= 1.1;
        }

        this.updateDisplay();
        this.draw();
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 600, 500);

        // Draw bricks
        this.bricks.forEach(brick => {
            if (brick.visible) {
                this.ctx.fillStyle = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                this.ctx.strokeStyle = '#fff';
                this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        });

        // Draw paddle
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Draw ball
        this.ctx.fillStyle = '#feca57';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    endGame() {
        this.gameActive = false;
        this.stopGame();
        
        setTimeout(() => {
            platform.showWinner({
                emoji: '🧱',
                title: '🎮 Game Over! 🎮',
                details: `
                    <div style="font-size: 1.5rem; margin-bottom: 15px;">🏆</div>
                    <div><strong>Player:</strong> ${this.playerName}</div>
                    <div><strong>Final Score:</strong> ${this.score}</div>
                    <div><strong>Level Reached:</strong> ${this.level}</div>
                `
            });
        }, 500);
    }

    updateDisplay() {
        document.getElementById('breakout-player-name').textContent = this.playerName;
        document.getElementById('breakout-score').textContent = `Score: ${this.score}`;
        document.getElementById('breakout-lives').textContent = `Lives: ${this.lives}`;
        document.getElementById('breakout-level').textContent = `Level: ${this.level}`;
    }
}

// Initialize the platform
const platform = new MultiGamePlatform();