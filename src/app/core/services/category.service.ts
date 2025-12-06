import { Injectable, signal, OnDestroy } from '@angular/core';
import { FirebaseService } from './firebase-service';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Category {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService implements OnDestroy {

  categories = signal<Category[]>([]);
  loading = signal<boolean>(true);

  private _categories$ = new BehaviorSubject<Category[]>([]);
  public categories$(): Observable<Category[]> {
    return this._categories$.asObservable();
  }

  private unsubscribe: Unsubscribe | null = null;
  private listenerActive = false;

  constructor(private firebase: FirebaseService) {
    console.log('🏗️ CategoryService inicializado');
    this.initListener();
  }

  ngOnDestroy() {
    this.stopListener();
  }

  /**
   * Inicializa el listener en tiempo real SOLO UNA VEZ
   */
  private initListener() {
    if (this.listenerActive) {
      console.warn('⚠️ Listener de categorías ya está activo');
      return;
    }

    this.listenerActive = true;
    this.loading.set(true);

    try {
      const db = this.firebase.db;
      const ref = collection(db, 'categories');
      const q = query(ref, orderBy('name', 'asc'));

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('📂 Listener de categorías disparado - Documentos encontrados:', snapshot.size);
          
          const list: Category[] = [];
          snapshot.forEach((docu) => {
            const data = docu.data();
            list.push({
              id: docu.id,
              name: data['name'] || '',
              createdAt: data['createdAt']?.toDate?.() || new Date(),
              updatedAt: data['updatedAt']?.toDate?.() || new Date()
            });
          });

          this.categories.set(list);
          this._categories$.next(list);
          this.loading.set(false);
          console.log('✅ Categorías cargadas exitosamente:', list.length);
        },
        (error: any) => {
          console.error('❌ Error en listener de categorías:', error.message);
          this.loading.set(false);
          this.listenerActive = false;
        }
      );
    } catch (error: any) {
      console.error('❌ Error inicializando listener de categorías:', error.message);
      this.loading.set(false);
      this.listenerActive = false;
    }
  }

  /**
   * Detiene el listener
   */
  private stopListener() {
    if (this.unsubscribe) {
      console.log('🛑 Deteniendo listener de categorías');
      this.unsubscribe();
      this.unsubscribe = null;
      this.listenerActive = false;
    }
  }

  /**
   * Agrega una nueva categoría
   */
  async addCategory(category: Category) {
    try {
      const db = this.firebase.db;
      const payload = {
        name: category.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(collection(db, 'categories'), payload);
      console.log('✅ Categoría agregada:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('❌ Error agregando categoría:', error);
      throw error;
    }
  }

  /**
   * Actualiza una categoría
   */
  async updateCategory(id: string, category: Category) {
    try {
      const db = this.firebase.db;
      const docRef = doc(db, 'categories', id);
      const payload = {
        name: category.name,
        updatedAt: new Date()
      };
      await updateDoc(docRef, payload);
      console.log('✅ Categoría actualizada:', id);
      return true;
    } catch (error) {
      console.error('❌ Error actualizando categoría:', error);
      throw error;
    }
  }

  /**
   * Elimina una categoría
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const db = this.firebase.db;
      await deleteDoc(doc(db, 'categories', id));
      console.log('✅ Categoría eliminada:', id);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando categoría:', error);
      return false;
    }
  }
}