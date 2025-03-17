
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIQ2pxTuvPCBiJh8nPfoWOtIzI7Cr4Vnk",
  authDomain: "tic-toc-8bd3c.firebaseapp.com",
  databaseURL: "https://tic-toc-8bd3c-default-rtdb.firebaseio.com",
  projectId: "tic-toc-8bd3c",
  storageBucket: "tic-toc-8bd3c.appspot.com",
  messagingSenderId: "143591558845",
  appId: "1:143591558845:web:976aa26fd5027f0df7f1d4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let playerName = "";
let roomId = "";
let currentPlayer = "X";

// Loading Screen (3 seconds)
window.onload = function() {
    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("home-page").style.display = "block";
    }, 3000);
};

// Create Room Functionality
function showCreateRoomPopup() {
    playerName = prompt("Enter your name:");
    if (!playerName) return;

    roomId = Math.floor(1000 + Math.random() * 9000).toString();
    db.ref("rooms/" + roomId).set({
        player1: { name: playerName, symbol: "X" },
        player2: { name: "", symbol: "O" },
        board: ["", "", "", "", "", "", "", "", ""],
        turn: "X",
        status: "waiting"
    });

    enterLobby(roomId);
}

// Join Room Functionality
function showJoinRoomPopup() {
    playerName = prompt("Enter your name:");
    roomId = prompt("Enter Room ID:");
    if (!playerName || !roomId) return;

    db.ref("rooms/" + roomId).once("value", snapshot => {
        if (!snapshot.exists()) return alert("Room not found!");

        db.ref("rooms/" + roomId + "/player2").update({ name: playerName });
        enterLobby(roomId);
    });
}

// Enter Game Lobby
function enterLobby(room) {
    document.getElementById("home-page").style.display = "none";
    document.getElementById("game-lobby").style.display = "block";
    document.getElementById("room-code").innerText = roomId;
    
    db.ref("rooms/" + room).on("value", snapshot => {
        let gameData = snapshot.val();
        document.getElementById("player1").innerText = gameData.player1.name || "Waiting...";
        document.getElementById("player2").innerText = gameData.player2.name || "Waiting for Opponent...";
        if (gameData.status === "playing") startGame();
    });
}

// Start Game
function startGame() {
    document.getElementById("game-lobby").style.display = "none";
    document.getElementById("game-board").style.display = "block";
    loadBoard();
}

// Load Board and Handle Turns
function loadBoard() {
    db.ref("rooms/" + roomId).on("value", snapshot => {
        let gameData = snapshot.val();
        document.querySelectorAll(".cell").forEach((cell, index) => {
            cell.innerText = gameData.board[index];
        });
    });
}

// Restart Game
function restartGame() {
    document.getElementById("winner-popup").style.display = "none";
    db.ref("rooms/" + roomId).update({
        board: ["", "", "", "", "", "", "", "", ""],
        turn: "X",
        status: "playing"
    });
}
