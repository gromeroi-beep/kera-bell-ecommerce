import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonInput,
  IonIcon,
  IonButton,
  IonCheckbox,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
    IonCheckbox,
    IonSpinner,
    RouterModule,
  ],
})
export class RegisterPage {
  form: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  // Estados de focus
  nameFocused = false;
  emailFocused = false;
  passwordFocused = false;
  confirmPasswordFocused = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        terms: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Maneja el registro del usuario
   */
  async register() {
    // Validar formulario
    if (this.form.invalid) {
      this.showToast('Por favor completa todos los campos correctamente.', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      const { name, email, password } = this.form.value;

      // Llamar al servicio de autenticación
      const result = await this.auth.register(email, password, name);

      if (!result.success) {
        this.showToast(
          result.error || 'Error al crear la cuenta. Intenta de nuevo.',
          'danger'
        );
        this.isLoading = false;
        return;
      }

      // Registro exitoso
      this.showToast('¡Cuenta creada exitosamente! Redirigiendo...', 'success');

      setTimeout(() => {
        this.router.navigate(['/login']);
        this.isLoading = false;
      }, 1500);
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      this.showToast(
        error.message || 'Error al conectar. Intenta de nuevo.',
        'danger'
      );
      this.isLoading = false;
    }
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