import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

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
export class TwoFaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  // El email no es tipeado por el usuario: viene del login (sessionStorage) o
  // del callback de Google (fragment #email=). sessionStorage (no localStorage)
  // acota la exposición de este PII a la pestaña actual.
  private email = '';

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  ngOnInit() {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    this.email = hash.get('email') || sessionStorage.getItem('login_email') || '';
    if (!this.email) {
      this.toast.error('No encontramos tu sesión de verificación. Ingresá de nuevo.');
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { codigo } = this.form.value;

    this.authService
      .verificar2FA(this.email, codigo!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          sessionStorage.removeItem('login_email');
          this.toast.success('Verificación exitosa');
          this.authService.redirigirPostAuth();
        },
        error: () => this.toast.error('Código inválido o expirado. Probá de nuevo.'),
      });
  }
}
