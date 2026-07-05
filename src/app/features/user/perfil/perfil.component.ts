import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card p-4">
      <h3>Seguridad</h3>
      <div class="form-check form-switch mt-3">
        <input
          class="form-check-input"
          type="checkbox"
          id="flexSwitch2FA"
          [checked]="is2FAEnabled()"
          (change)="onToggle2FA($event)"
        />
        <label class="form-check-label" for="flexSwitch2FA">
          Habilitar autenticación en dos pasos (2FA)
        </label>
      </div>
    </div>
  `,
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Usamos un signal para reflejar el estado real de la cuenta
  is2FAEnabled = signal<boolean>(false);

  ngOnInit() {
    // Aquí deberías cargar el estado actual del usuario al entrar al perfil
    const usuario = this.authService.currentUser();
    this.is2FAEnabled.set(!!usuario?.two_factor_enabled);
  }

  onToggle2FA(event: any) {
    const habilitar = event.target.checked;

    this.authService.configurar2FA(habilitar).subscribe({
      next: (res) => {
        this.is2FAEnabled.set(res.two_factor_enabled);
        this.toastService.success(res.message);
      },
      error: () => {
        this.toastService.error('No se pudo actualizar la configuración');
        // Revertimos el switch en caso de error
        event.target.checked = !habilitar;
      },
    });
  }
}
