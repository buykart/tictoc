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

function showCreateRoomPopup() {
    let playerName = prompt("Enter your name:");
    if (!playerName) return;
    
    let roomId = Math.floor(1000 + Math.random() * 9000).toString();
    db.ref("rooms/" + roomId).set({
        player1: { name: playerName, symbol: "X" },
        player2: { name: "", symbol: "O" },
        board: ["", "", "", "", "", "", "", "", ""],
        turn: "X",
        status: "waiting"
    });

    window.location.href = "game.html?roomId=" + roomId;
}

function showJoinRoomPopup() {
    let playerName = prompt("Enter your name:");
    let roomId = prompt("Enter Room ID:");
    if (!playerName || !roomId) return;

    db.ref("rooms/" + roomId).once("value", snapshot => {
        if (!snapshot.exists()) return alert("Room not found!");
        
        db.ref("rooms/" + roomId + "/player2").update({ name: playerName });
        window.location.href = "game.html?roomId=" + roomId;
    });
}

function searchRoom() {
    let roomId = document.getElementById("searchRoomId").value;
    if (!roomId) return;

    db.ref("rooms/" + roomId).once("value", snapshot => {
        let gameData = snapshot.val();
        if (!gameData) return alert("Room not found!");

        document.getElementById("leaderboard-results").innerHTML =
            `<p>Winner: ${gameData.winner}</p>
             <p>Loser: ${gameData.loser}</p>
             <p>Final Score: ${gameData.finalScore}</p>`;
    });
}
