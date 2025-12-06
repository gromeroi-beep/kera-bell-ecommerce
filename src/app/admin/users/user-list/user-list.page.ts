import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/interfaces/user';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
  imports: [CommonModule, IonicModule]
})
export class UserListPage implements OnInit, OnDestroy {

  userService = inject(UserService);
  alertController = inject(AlertController);
  toastController = inject(ToastController);
  router = inject(Router);

  users = signal<User[]>([]);
  loading = signal(true);
  isDeleting = signal(false);

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los usuarios desde el servicio
   */
  loadUsers() {
    this.loading.set(true);

    try {
      this.userService.users$()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.users.set(data);
            console.log('✅ Usuarios cargados:', data.length);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('❌ Error cargando usuarios:', err);
            this.loading.set(false);
            this.showToast('Error al cargar usuarios', 'danger');
          }
        });
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      this.loading.set(false);
    }
  }

  /**
   * Navega hacia atrás al dashboard
   */
  goBack() {
    console.log('⬅️ Volviendo al dashboard');
    this.router.navigate(['/admin']);
  }

  /**
   * Muestra confirmación antes de eliminar un usuario
   */
  async deleteUser(uid: string | undefined, email: string) {
    if (!uid) {
      console.error('❌ UID inválido');
      this.showToast('Error: UID inválido', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: '⚠️ Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar a <strong>"${email}"</strong>? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.executeDelete(uid, email);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Ejecuta la eliminación del usuario
   */
  private async executeDelete(uid: string, email: string) {
    this.isDeleting.set(true);

    try {
      const success = await this.userService.deleteUser(uid);
      
      if (success) {
        console.log('✅ Usuario eliminado:', uid);
        await this.showToast(`✅ "${email}" eliminado correctamente`, 'success');
        await this.loadUsers();
      } else {
        await this.showToast('❌ Error al eliminar el usuario', 'danger');
      }
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      await this.showToast('❌ Error al eliminar el usuario', 'danger');
    } finally {
      this.isDeleting.set(false);
    }
  }

  /**
   * Cambia el rol de un usuario con confirmación
   */
  async changeRole(uid: string | undefined, currentRole: string = 'client') {
    if (!uid) {
      console.error('❌ UID inválido');
      this.showToast('Error: UID inválido', 'danger');
      return;
    }

    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    const newRoleLabel = newRole === 'admin' ? 'Administrador' : 'Cliente';

    const alert = await this.alertController.create({
      header: '🔄 Cambiar Rol',
      message: `¿Cambiar el rol a <strong>"${newRoleLabel}"</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cambiar',
          handler: async () => {
            await this.executeChangeRole(uid, newRole);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Ejecuta el cambio de rol
   */
  private async executeChangeRole(uid: string, newRole: 'admin' | 'client') {
    this.isDeleting.set(true);

    try {
      const success = await this.userService.updateUserRole(uid, newRole);
      
      if (success) {
        const roleLabel = newRole === 'admin' ? 'Administrador' : 'Cliente';
        console.log('✅ Rol actualizado:', uid, roleLabel);
        await this.showToast(`✅ Rol actualizado a ${roleLabel}`, 'success');
        await this.loadUsers();
      } else {
        await this.showToast('❌ Error al actualizar el rol', 'danger');
      }
    } catch (error) {
      console.error('❌ Error actualizando rol:', error);
      await this.showToast('❌ Error al actualizar el rol', 'danger');
    } finally {
      this.isDeleting.set(false);
    }
  }

  /**
   * Formatea la fecha de registro
   */
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Muestra un toast
   */
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}