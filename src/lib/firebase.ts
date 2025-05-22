// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDnC1gQWrg15ze5BXPg4K6La5hnZvlwoP8",
  authDomain: "retrospective-app-25298.firebaseapp.com",
  projectId: "retrospective-app-25298",
  storageBucket: "retrospective-app-25298.appspot.com",
  databaseURL: "https://retrospective-app-25298-default-rtdb.asia-southeast1.firebasedatabase.app",
  messagingSenderId: "1018350048067",
  appId: "1:1018350048067:web:045ec8d0e5a1f2416395f6",
  measurementId: "G-QCKJ24DGRC"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, ref, push, onValue, remove, auth };
