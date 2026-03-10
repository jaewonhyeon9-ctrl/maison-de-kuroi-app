import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// 1. 기존 getFirestore 대신 더 강력한 도구들을 불러옵니다.
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9-p4b91ihqh7mvMRsOkVFxp4-Q7BMIyI",
  authDomain: "gen-lang-client-0567438063.firebaseapp.com",
  // ⚠️ 주의: 아래 따옴표 안에 눈에 안 보이는 띄어쓰기(공백)가 절대 없어야 합니다!
  projectId: "gen-lang-client-0567438063",
  storageBucket: "gen-lang-client-0567438063.firebasestorage.app",
  messagingSenderId: "494435805192",
  appId: "1:494435805192:web:c982dab42057532ebb49bd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 2. 핵심 해결책: 기존의 고장 난 브라우저 캐시(기억)를 완전히 무시하고, 
//    매번 신선하게 서버(Google) 창고에 직접 연결하도록 강제합니다!
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
export const secondaryAuth = getAuth(secondaryApp);
