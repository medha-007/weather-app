import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3esh-D1MuVtQVpN2he443NiYaaN42yIU",
  authDomain: "weather-app-3333.firebaseapp.com",
  projectId: "weather-app-3333",
  storageBucket: "weather-app-3333.firebasestorage.app",
  messagingSenderId: "981350775967",
  appId: "1:981350775967:web:2fd132b372fad482d036aa",
  measurementId: "G-DBT5KVBYZX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);