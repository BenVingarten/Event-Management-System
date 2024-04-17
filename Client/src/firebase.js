// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "event-planner-16665.firebaseapp.com",
  projectId: "event-planner-16665",
  storageBucket: "event-planner-16665.appspot.com",
  messagingSenderId: "917334623501",
  appId: "1:917334623501:web:8f890ae2c95cc5c105dc44",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
