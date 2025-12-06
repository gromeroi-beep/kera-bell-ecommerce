import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseService } from './firebase-service';
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { User } from '../interfaces/user';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  private _users$ = new BehaviorSubject<User[]>([]);
  
  public users$(): Observable<User[]> {
    return this._users$.asObservable();
  }

  private unsubscribe: Unsubscribe | null = null;
  private listenerActive = false;

  constructor(private firebase: FirebaseService) {
    console.log('🏗️ UserService inicializado');
    this.initListener();
  }

  ngOnDestroy() {
    this.stopListener();
  }

  /**
   * Inicializa el listener de usuarios en tiempo real
   */
  private initListener() {
    if (this.listenerActive) {
      console.warn('⚠️ Listener de usuarios ya está activo');
      return;
    }

    this.listenerActive = true;

    try {
      const db = this.firebase.db;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('email', 'asc'));

      console.log('🔍 Iniciando listener de usuarios...');

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('👥 Listener de usuarios disparado - Documentos encontrados:', snapshot.size);
          
          const usersList: User[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;

            usersList.push({
              uid: docSnap.id,
              email: data['email'] || '',
              displayName: data['displayName'] || data['name'] || '',
              role: data['role'] || 'client',
              active: data['active'] !== false,
              createdAt: data['createdAt']?.toDate?.() || new Date(),
              updatedAt: data['updatedAt']?.toDate?.() || new Date()
            });
          });

          this._users$.next(usersList);
          console.log('✅ Usuarios cargados exitosamente:', usersList.length);
        },
        (error: any) => {
          console.error('❌ Error en listener de usuarios:', error.message);
          this.listenerActive = false;
        }
      );
    } catch (error: any) {
      console.error('❌ Error inicializando listener de usuarios:', error.message);
      this.listenerActive = false;
    }
  }

  /**
   * Detiene el listener
   */
  private stopListener() {
    if (this.unsubscribe) {
      console.log('🛑 Deteniendo listener de usuarios');
      this.unsubscribe();
      this.unsubscribe = null;
      this.listenerActive = false;
    }
  }

  /**
   * Obtiene todos los usuarios (método legacy)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const db = this.firebase.db;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('email', 'asc'));
      const snapshot = await getDocs(q);

      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        usersList.push({
          uid: doc.id,
          email: data['email'] || '',
          displayName: data['displayName'] || data['name'] || '',
          role: data['role'] || 'client',
          active: data['active'] !== false,
          createdAt: data['createdAt']?.toDate?.() || new Date(),
          updatedAt: data['updatedAt']?.toDate?.() || new Date()
        });
      });

      return usersList;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return [];
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(uid: string): Promise<boolean> {
    try {
      const db = this.firebase.db;
      await deleteDoc(doc(db, 'users', uid));
      console.log('✅ Usuario eliminado:', uid);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      return false;
    }
  }

  /**
   * Actualiza el rol de un usuario
   */
  async updateUserRole(uid: string, role: 'admin' | 'client'): Promise<boolean> {
    try {
      const db = this.firebase.db;
      await updateDoc(doc(db, 'users', uid), {
        role: role,
        updatedAt: new Date()
      });
      console.log('✅ Rol actualizado:', uid, 'Role:', role);
      return true;
    } catch (error) {
      console.error('❌ Error actualizando rol:', error);
      return false;
    }
  }
}