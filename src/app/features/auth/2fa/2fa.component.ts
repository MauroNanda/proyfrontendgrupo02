import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-2fa',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-4">
      <h3>Verificación 2FA</h3>
      <input
        type="text"
        formControlName="codigo"
        placeholder="Código de 6 dígitos"
        class="form-control"
      />
      <button type="submit" class="btn btn-primary mt-2">Verificar</button>
    </form>
  `,
})
export class TwoFaComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  onSubmit() {
    const email = localStorage.getItem('login_email'); // Recuperamos el email guardado al inicio
    const { codigo } = this.form.value;

    this.authService.verificar2FA(email!, codigo!).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.token);
        this.router.navigate(['/dashboard']);
      },
    });
  }
}
