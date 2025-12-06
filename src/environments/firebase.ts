// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHI_eQvB3cqnjp93KsLkLGc1lGgAxqRos",
  authDomain: "kera-bell-e-commerce.firebaseapp.com",
  projectId: "kera-bell-e-commerce",
  storageBucket: "kera-bell-e-commerce.firebasestorage.app",
  messagingSenderId: "642330840530",
  appId: "1:642330840530:web:5d026226e5dc14fe370c0b",
  measurementId: "G-5GM4J6S89D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);