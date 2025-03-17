// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBIQ2pxTuvPCBiJh8nPfoWOtIzI7Cr4Vnk",
    authDomain: "tic-toc-8bd3c.firebaseapp.com",
    databaseURL: "https://tic-toc-8bd3c-default-rtdb.firebaseio.com",
    projectId: "tic-toc-8bd3c",
    storageBucket: "tic-toc-8bd3c.firebasestorage.app",
    messagingSenderId: "143591558845",
    appId: "1:143591558845:web:976aa26fd5027f0df7f1d4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Get DOM elements
const loadingScreen = document.getElementById('loading-screen');
const homePage = document.getElementById('home-page');
const createRoomBtn = document.getElementById('create-room-btn');
const enterRoomBtn = document.getElementById('enter-room-btn');
const createRoomPopup = document.getElementById('create-room-popup');
const enterRoomPopup = document.getElementById('enter-room-popup');
const createNameInput = document.getElementById('create-name');
const createRoomConfirmBtn = document.getElementById('create-room-confirm');
const enterNameInput = document.getElementById('enter-name');
const roomIdInput = document.getElementById('room-id-input');
const joinRoomConfirmBtn = document.getElementById('join-room-confirm');
const gameLobby = document.getElementById('game-lobby');
const player1NameDisplay = document.getElementById('player1-name');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2NameDisplay = document.getElementById('player2-name');
const player2ScoreDisplay = document.getElementById('player2-score');
const roomIdDisplay = document.getElementById('room-id');
const loadingAnimation = document.getElementById('loading-animation');
const gameScreen = document.getElementById('game-screen');
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turn-indicator');
const winnerPopup = document.getElementById('winner-popup');
const winnerMessageDisplay = document.getElementById('winner-message');
const finalScoresDisplay = document.getElementById('final-scores');
const playerNamesDisplay = document.getElementById('player-names');
const playAgainBtn = document.getElementById('play-again-btn');
const searchRoomInput = document.getElementById('search-room');
const searchResultsDiv = document.getElementById('search-results');
const leaderboardDataDiv = document.getElementById('leaderboard-data');

// Game state variables
let playerName = '';
let roomId = '';
let playerSymbol = '';
let opponentSymbol = '';
let isMyTurn = false;
let gameActive = false;
let boardState = ['', '', '', '', '', '', '', '', ''];
let player1Score = 0;
let player2Score = 0;

// Function to generate a unique room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Function to update game state in Firebase
function updateGame(data) {
    database.ref(`rooms/${roomId}`).update(data);
}

// Function to check for a winner
function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }

    return boardState.includes('') ? null : 'Tie';
}

// Function to handle cell click
function handleCellClick(index) {
    if (!gameActive || !isMyTurn || boardState[index] !== '') {
        return;
    }

    boardState[index] = playerSymbol;
    cells[index].textContent = playerSymbol;
    cells[index].classList.add(playerSymbol);
    isMyTurn = false;
    turnIndicator.textContent = `Opponent's Turn`;

    const winner = checkWin();
    if (winner) {
        gameActive = false;
        let winnerName = '';
        let loserName = '';
        if (winner === playerSymbol) {
            winnerMessageDisplay.textContent = 'You Won!';
            winnerName = playerName;
            loserName = player2NameDisplay.textContent;
            player1Score++;
            player1ScoreDisplay.textContent = player1Score;
        } else if (winner === opponentSymbol) {
            winnerMessageDisplay.textContent = 'You Lost!';
            winnerName = player2NameDisplay.textContent;
            loserName = playerName;
            player2Score++;
            player2ScoreDisplay.textContent = player2Score;
        } else {
            winnerMessageDisplay.textContent = 'Tie Game!';
        }

        finalScoresDisplay.textContent = `${playerName}: ${player1Score}, ${player2NameDisplay.textContent}: ${player2Score}`;
        playerNamesDisplay.textContent = `Winner: ${winnerName}, Loser: ${loserName}`;
        winnerPopup.classList.remove('hidden');

        // Save result to leaderboard
        const leaderboardEntry = {
            winner: winnerName,
            loser: loserName,
            winnerScore: winner === playerSymbol ? player1Score : player2Score,
            loserScore: winner === playerSymbol ? player2Score : player1Score
        };
        database.ref(`leaderboard/${roomId}`).set(leaderboardEntry);

        updateGame({ board: boardState, isTurn: isMyTurn, player1Score: player1Score, player2Score: player2Score });
    } else {
        updateGame({ board: boardState, isTurn: isMyTurn });
    }
}

// Event listeners
createRoomBtn.addEventListener('click', () => {
    createRoomPopup.classList.remove('hidden');
});

enterRoomBtn.addEventListener('click', () => {
    enterRoomPopup.classList.remove('hidden');
});

createRoomConfirmBtn.addEventListener('click', () => {
    playerName = createNameInput.value.trim();
    if (playerName) {
        roomId = generateRoomId();
        playerSymbol = 'X';
        opponentSymbol = 'O';
        isMyTurn = true;
        gameActive = false;
        boardState = ['', '', '', '', '', '', '', '', ''];
        player1Score = 0;
        player2Score = 0;
        player1ScoreDisplay.textContent = player1Score;
        player2ScoreDisplay.textContent = player2Score;

        database.ref(`rooms/${roomId}`).set({
            player1: playerName,
            player1Score: 0,
            player2: '',
            player2Score: 0,
            board: boardState,
            isTurn: isMyTurn
        });

        player1NameDisplay.textContent = playerName;
        roomIdDisplay.textContent = roomId;
        gameLobby.classList.remove('hidden');
        homePage.classList.add('hidden');
        createRoomPopup.classList.add('hidden');

        // Listen for changes in the room
        database.ref(`rooms/${roomId}`).on('value', (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                if (roomData.player2) {
                    player2NameDisplay.textContent = roomData.player2;
                    // Start game animation
                    loadingAnimation.classList.remove('hidden');
                    setTimeout(() => {
                        loadingAnimation.classList.add('hidden');
                        gameScreen.classList.remove('hidden');
                        isMyTurn = roomData.isTurn;
                        updateTurnIndicator();
                        gameActive = true;
                        boardState = roomData.board;
                        player1Score = roomData.player1Score;
                        player2Score = roomData.player2Score;
                        player1ScoreDisplay.textContent = player1Score;
                        player2ScoreDisplay.textContent = player2Score;
                        updateBoardUI();
                    }, 2000);
                }
                if (roomData.board) {
                    boardState = roomData.board;
                    updateBoardUI();
                }
                if (roomData.isTurn !== undefined) {
                    isMyTurn = roomData.isTurn;
                    updateTurnIndicator();
                }
                if (roomData.player1Score !== undefined) {
                    player1Score = roomData.player1Score;
                    player1ScoreDisplay.textContent = player1Score;
                }
                if (roomData.player2Score !== undefined) {
                    player2Score = roomData.player2Score;
                    player2ScoreDisplay.textContent = player2Score;
                }
            } else {
                // Room deleted, go back to home
                alert('Room does not exist or has been deleted.');
                resetGame();
            }
        });
    } else {
        alert('Please enter your name.');
    }
});

joinRoomConfirmBtn.addEventListener('click', () => {
    playerName = enterNameInput.value.trim();
    roomId = roomIdInput.value.trim().toUpperCase();
    if (playerName && roomId) {
        playerSymbol = 'O';
        opponentSymbol = 'X';
        gameActive = false;
        boardState = ['', '', '', '', '', '', '', '', ''];
        player1Score = 0;
        player2Score = 0;
        player1ScoreDisplay.textContent = player1Score;
        player2ScoreDisplay.textContent = player2Score;

        database.ref(`rooms/${roomId}`).once('value', (snapshot) => {
            const roomData = snapshot.val();
            if (roomData && !roomData.player2) {
                database.ref(`rooms/${roomId}`).update({ player2: playerName });
                player2NameDisplay.textContent = playerName;
                roomIdDisplay.textContent = roomId;
                gameLobby.classList.remove('hidden');
                homePage.classList.add('hidden');
                enterRoomPopup.classList.add('hidden');

                // Listen for changes in the room
                database.ref(`rooms/${roomId}`).on('value', (snapshot) => {
                    const roomData = snapshot.val();
                    if (roomData) {
                        player1NameDisplay.textContent = roomData.player1;
                        isMyTurn = !roomData.isTurn; // Opponent's turn initially
                        updateTurnIndicator();
                        gameActive = true;
                        boardState = roomData.board;
                        player1Score = roomData.player1Score;
                        player2Score = roomData.player2Score;
                        player1ScoreDisplay.textContent = player1Score;
                        player2ScoreDisplay.textContent = player2Score;
                        updateBoardUI();
                    } else {
                        // Room deleted, go back to home
                        alert('Room does not exist or has been deleted.');
                        resetGame();
                    }
                });
            } else {
                alert('Invalid room ID or room is full.');
            }
        });
    } else {
        alert('Please enter your name and room ID.');
    }
});

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = parseInt(cell.dataset.index);
        handleCellClick(index);
    });
});

playAgainBtn.addEventListener('click', () => {
    winnerPopup.classList.add('hidden');
    resetGame();
    if (roomId) {
        database.ref(`rooms/${roomId}`).update({ board: ['', '', '', '', '', '', '', '', ''], isTurn: playerSymbol === 'X' });
    }
});

searchRoomInput.addEventListener('input', () => {
    const searchId = searchRoomInput.value.trim().toUpperCase();
    if (searchId) {
        database.ref(`leaderboard/${searchId}`).once('value', (snapshot) => {
            const result = snapshot.val();
            if (result) {
                searchResultsDiv.textContent = `Winner: ${result.winner}, Loser: ${result.loser}, Winner Score: ${result.winnerScore}, Loser Score: ${result.loserScore}`;
            } else {
                searchResultsDiv.textContent = 'Room ID not found in leaderboard.';
            }
        });
    } else {
        searchResultsDiv.textContent = '';
    }
});

// Function to update the board UI
function updateBoardUI() {
    cells.forEach((cell, index) => {
        cell.textContent = boardState[index];
        cell.classList.remove('X', 'O');
        if (boardState[index]) {
            cell.classList.add(boardState[index]);
        }
    });
}

// Function to update the turn indicator
function updateTurnIndicator() {
    turnIndicator.textContent = isMyTurn ? 'Your Turn' : 'Opponent\'s Turn';
}

// Function to reset the game
function resetGame() {
    homePage.classList.remove('hidden');
    gameLobby.classList.add('hidden');
    gameScreen.classList.add('hidden');
    boardState = ['', '', '', '', '', '', '', '', ''];
    updateBoardUI();
    roomId = '';
    player1NameDisplay.textContent = '';
    player2NameDisplay.textContent = 'Waiting for Opponent';
    player1Score = 0;
    player2Score = 0;
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
    turnIndicator.textContent = '';
    gameActive = false;
    // Detach listeners
    database.ref(`rooms/${roomId}`).off();
}

// Loading screen logic
setTimeout(() => {
    loadingScreen.classList.add('hidden');
    homePage.classList.remove('hidden');
}, 3000);
