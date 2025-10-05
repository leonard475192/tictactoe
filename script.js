// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const gameOverMessage = document.getElementById('game-over-message');
const winnerMessage = document.getElementById('winner-message');
const difficultySelection = document.getElementById('difficulty-selection');
const gameContainer = document.getElementById('game-container');
const difficultyButtons = document.querySelectorAll('#difficulty-selection button');

// Game State
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let difficulty = 'easy'; // easy, normal, hard

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- Game Initialization ---
function initializeGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;

    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o');
    });

    statusText.innerText = `${currentPlayer}のターン`;
    gameOverMessage.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    difficultySelection.classList.add('hidden');
}

// --- Win/Draw Check ---
function checkResult(currentBoard, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
            if (player) { // Only return true/false if checking for a hypothetical win
                return currentBoard[a] === player;
            }
            return true; // Return true for an actual win
        }
    }
    if (!currentBoard.includes('')) {
        return 'draw';
    }
    return false;
}


// --- Game End ---
function endGame(isDraw) {
    gameActive = false;
    gameOverMessage.classList.remove('hidden');
    if (isDraw) {
        winnerMessage.innerText = '引き分け！';
    } else {
        winnerMessage.innerText = `${currentPlayer}の勝利！`;
    }
    statusText.innerText = '';
}

// --- Player's Move ---
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }

    updateBoard(clickedCell, clickedCellIndex);
    const gameResult = checkResult(board);
    if (gameResult) {
        endGame(gameResult === 'draw');
        return;
    }

    changePlayer();
    setTimeout(computerMove, 500);
}

function updateBoard(cell, index) {
    board[index] = currentPlayer;
    cell.innerText = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
}

function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (gameActive) {
        statusText.innerText = `${currentPlayer}のターン`;
    }
}

// --- Computer's Thinking Logic ---
function computerMove() {
    if (!gameActive || currentPlayer !== 'O') return;

    let move;
    switch (difficulty) {
        case 'easy':
            move = easyMove();
            break;
        case 'normal':
            move = normalMove();
            break;
        case 'hard':
            move = hardMove();
            break;
    }

    const cell = document.querySelector(`.cell[data-index='${move}']`);
    updateBoard(cell, move);

    const gameResult = checkResult(board);
    if (gameResult) {
        endGame(gameResult === 'draw');
        return;
    }

    changePlayer();
}

// 難易度：梅 (Easy) - ランダム
function easyMove() {
    const emptyCells = board.map((c, i) => c === '' ? i : null).filter(i => i !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// 難易度：竹 (Normal) - 勝利を狙い、敗北を防ぐ
function normalMove() {
    const emptyCells = board.map((c, i) => c === '' ? i : null).filter(i => i !== null);

    // 1. Check if computer can win in the next move
    for (const index of emptyCells) {
        const tempBoard = [...board];
        tempBoard[index] = 'O';
        if (checkResult(tempBoard, 'O')) {
            return index;
        }
    }

    // 2. Check if player can win in the next move, and block them
    for (const index of emptyCells) {
        const tempBoard = [...board];
        tempBoard[index] = 'X';
        if (checkResult(tempBoard, 'X')) {
            return index;
        }
    }

    // 3. Fallback to a random move
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// 難易度：松 (Hard) - Minimaxアルゴリズム
function hardMove() {
    let bestScore = -Infinity;
    let bestMove;
    const emptyCells = board.map((c, i) => c === '' ? i : null).filter(i => i !== null);

    for (const index of emptyCells) {
        const tempBoard = [...board];
        tempBoard[index] = 'O';
        let score = minimax(tempBoard, 0, false);
        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }
    return bestMove;
}

const scores = {
    X: -10,
    O: 10,
    draw: 0
};

function minimax(currentBoard, depth, isMaximizing) {
    const result = checkResult(currentBoard);
    if (result !== false) {
        return result === 'draw' ? scores.draw : scores[isMaximizing ? 'X' : 'O'];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === '') {
                currentBoard[i] = 'O';
                let score = minimax(currentBoard, depth + 1, false);
                currentBoard[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === '') {
                currentBoard[i] = 'X';
                let score = minimax(currentBoard, depth + 1, true);
                currentBoard[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}


// --- Reset / Difficulty Selection ---
function resetGame() {
    gameContainer.classList.add('hidden');
    difficultySelection.classList.remove('hidden');
}

function selectDifficulty(event) {
    difficulty = event.target.getAttribute('data-difficulty');
    initializeGame();
}

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
difficultyButtons.forEach(button => button.addEventListener('click', selectDifficulty));
