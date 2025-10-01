import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAR5WzajHiPC2jlN0g8ncReCaA6Er_fQlI",
  authDomain: "webmusiconline-538fa.firebaseapp.com",
  projectId: "webmusiconline-538fa",
  storageBucket: "webmusiconline-538fa.firebasestorage.app",
  messagingSenderId: "614337186861",
  appId: "1:614337186861:web:1c57ab6e130a5cefb27ca4",
  measurementId: "G-4ZEQY3W0RL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;