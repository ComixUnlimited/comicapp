// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChtotqs8bvYzP_3LdXBXa1x81pVdgXk80",
  authDomain: "comical-archives.firebaseapp.com",
  projectId: "comical-archives",
  storageBucket: "comical-archives.appspot.com", // Corrected this line
  messagingSenderId: "330242223557",
  appId: "1:330242223557:web:51730dece8ccbda1be6fac",
  measurementId: "G-P8TJQM1YT4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase functions for use in other files
export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail 
};