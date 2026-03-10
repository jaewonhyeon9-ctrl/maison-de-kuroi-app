import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 가장 확실한 방법: 설정값을 코드에 직접 명시합니다!
const firebaseConfig = {
  apiKey: "AIzaSyA9-p4b91ihqh7mvMRsOkVFxp4-Q7BMIyI",
  authDomain: "gen-lang-client-0567438063.firebaseapp.com",
  projectId: "gen-lang-client-0567438063",
  storageBucket: "gen-lang-client-0567438063.firebasestorage.app",
  messagingSenderId: "494435805192",
  appId: "1:494435805192:web:c982dab42057532ebb49bd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
export const secondaryAuth = getAuth(secondaryApp);
