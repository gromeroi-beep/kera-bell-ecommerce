import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  app;
  db;
  auth;
  storage;

  constructor() {

    // ⛔ Reemplaza esto por tu configuración real
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

    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.storage = getStorage(this.app);
  }
}
