import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCZPU06X3M14FpkVanrXxFTb7NV1-nXsLQ",
  authDomain: "autopay-reminder-ac0af.firebaseapp.com",
  projectId: "autopay-reminder-ac0af",
  storageBucket: "autopay-reminder-ac0af.firebasestorage.app",
  messagingSenderId: "631532590969",
  appId: "1:631532590969:web:ea5e81c97a89eca06141a8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);


console.log("✅ Firestore Initialized:", db);
