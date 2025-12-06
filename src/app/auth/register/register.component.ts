import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validar contraseñas iguales
  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.registerForm.value;

    try {
      await this.authService.register(email, password);
    } catch (error: any) {
      this.errorMessage = this.getFirebaseError(error.code);
    }

    this.isLoading = false;
  }

  getFirebaseError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'El correo ya está registrado.';
      case 'auth/invalid-email':
        return 'Correo electrónico inválido.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil.';
      default:
        return 'Ocurrió un error inesperado.';
    }
  }
}
