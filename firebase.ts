import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9-p4b91ihqh7mvMRsOkVFxp4-Q7BMIyI",
  authDomain: "gen-lang-client-0567438063.firebaseapp.com",
  projectId: "gen-lang-client-0567438063",
  storageBucket: "gen-lang-client-0567438063.firebasestorage.app",
  messagingSenderId: "494435805192",
  appId: "1:494435805192:web:c982dab42057532ebb49bd",
  measurementId: "G-N1505DT8JE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Secondary app for creating users without logging out the current user
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
export const secondaryAuth = getAuth(secondaryApp);
