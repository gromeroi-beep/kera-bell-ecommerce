import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonInput,
  IonIcon,
  IonButton,
  IonSpinner,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonIcon,
    IonButton,
    IonSpinner,
    RouterModule,
  ],
})
export class LoginPage {
  form: FormGroup;
  showPassword = false;
  isLoading = false;

  // Estados de focus para inputs
  emailFocused = false;
  passwordFocused = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Maneja el login del usuario
   */
  async login() {
    // Validar formulario
    if (this.form.invalid) {
      this.showToast('Por favor completa todos los campos correctamente.', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      const { email, password } = this.form.value;

      // Llamar al servicio de autenticación
      const result = await this.auth.login(email, password);

      if (!result.success) {
        this.showToast(
          result.error || 'Error al iniciar sesión. Intenta de nuevo.',
          'danger'
        );
        this.isLoading = false;
        return;
      }

      // Login exitoso
      this.showToast('¡Bienvenida! Accediendo a tu cuenta...', 'success');

      // El AuthService se encarga de la redirección según el rol
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      this.showToast(
        error.message || 'Error al conectar. Intenta de nuevo.',
        'danger'
      );
      this.isLoading = false;
    }
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Muestra un toast (notificación)
   */
  private async showToast(
    message: string,
    color: string = 'primary'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
      buttons: [
        {
          text: '✕',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }
}