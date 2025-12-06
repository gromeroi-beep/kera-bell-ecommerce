// src/app/firebase.config.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';

const app = initializeApp(environment.firebase);
export const dbInstance = getFirestore(app);
export const authInstance = getAuth(app);