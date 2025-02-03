const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");  
const { getFirestore } = require("firebase/firestore");  

const firebaseConfig = {
  apiKey: "AIzaSyDqIHq2KdDhNViXJSSfmYJB_J-uv3i4XB0",
  authDomain: "freecommit-d464d.firebaseapp.com",
  projectId: "freecommit-d464d",
  storageBucket: "freecommit-d464d.appspot.com", 
  messagingSenderId: "235569964249",
  appId: "1:235569964249:web:39a3aa95aa319949238ac8",
  measurementId: "G-E9BYEY9H7K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { auth, db };
