import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  
import { getFirestore } from "firebase/firestore";  

const firebaseConfig = {
  apiKey: "AIzaSyDqIHq2KdDhNViXJSSfmYJB_J-uv3i4XB0",
  authDomain: "freecommit-d464d.firebaseapp.com",
  projectId: "freecommit-d464d",
  storageBucket: "freecommit-d464d.firebasestorage.app",
  messagingSenderId: "235569964249",
  appId: "1:235569964249:web:39a3aa95aa319949238ac8",
  measurementId: "G-E9BYEY9H7K"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);  
