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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
