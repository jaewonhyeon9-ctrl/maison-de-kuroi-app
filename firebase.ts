import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAj-vusHYKDij4FiP2dO0MoFGAvgkAK9hI",
  authDomain: "green-objective-489004-m7.firebaseapp.com",
  projectId: "green-objective-489004-m7",
  storageBucket: "green-objective-489004-m7.firebasestorage.app",
  messagingSenderId: "211774201156",
  appId: "1:211774201156:web:6d97a53f1f2bd97a850b11",
  measurementId: "G-BGJ1VQK1RE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
