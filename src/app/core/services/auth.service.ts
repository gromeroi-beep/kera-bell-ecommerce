// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  updateProfile
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';

// Inicializar Firebase
const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: User | null = null;
  private userRole: string | null = null;

  constructor(private router: Router) {

    // Observador de cambios de sesión
    auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;

      if (user) {
        await this.loadUserRole(user.uid); // Carga el rol del usuario
      } else {
        this.userRole = null;
      }
    });
  }

  // ---------------------------------------------------------
  // LOGIN (devuelve success/error)
  // ---------------------------------------------------------
  public async login(email: string, password: string): Promise<{ success: boolean, error?: string }> {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Esperar que el rol se cargue
      await new Promise(r => setTimeout(r, 600));

      this.redirectToRole();
      return { success: true };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ---------------------------------------------------------
  // REGISTRO (con nombre, ahora con success/error)
  // ---------------------------------------------------------
  public async register(email: string, password: string, name: string): Promise<{ success: boolean, error?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Guardar nombre en Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Guardar en Firestore
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: name,
        email: email,
        role: 'client',
        createdAt: new Date()
      });

      // Rol interno
      this.userRole = 'client';

      return { success: true };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------
  public async logout(): Promise<void> {
    await signOut(auth);
    this.router.navigate(['/login']);
  }

  // ---------------------------------------------------------
  // CARGAR ROL DEL USUARIO DESDE FIRESTORE
  // ---------------------------------------------------------
  private async loadUserRole(uid: string): Promise<void> {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      this.userRole = snap.data()['role'] || 'client';
    } else {
      this.userRole = 'client';
    }
  }

  // ---------------------------------------------------------
  // CONSULTAS PARA AUTH GUARD
  // ---------------------------------------------------------
  public isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  public getUserRole(): string | null {
    return this.userRole;
  }

  // ---------------------------------------------------------
  // REDIRECCIÓN SEGÚN ROL
  // ---------------------------------------------------------
  private redirectToRole(): void {
    if (this.userRole === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
