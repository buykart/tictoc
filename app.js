// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Room Creation
document.getElementById("create-room").addEventListener("click", () => {
  const playerName = prompt("Enter your name:");
  const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
  console.log("Room created with ID:", roomId);

  // Save to Firebase
  set(ref(database, `rooms/${roomId}`), {
    host: playerName,
    opponent: "",
    state: Array(9).fill(null)
  });

  // Display in Lobby
  displayGameLobby(playerName, roomId);
});
