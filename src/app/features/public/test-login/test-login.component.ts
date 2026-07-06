import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-login',
  template: `
    <div class="container py-5" style="max-width: 480px;">
      <div class="card shadow-sm border-0">
        <div class="card-body p-4 text-center">
          <i class="bi bi-shield-lock-fill text-primary" style="font-size: 3rem;"></i>
          <h1 class="h4 mt-3 mb-2 fw-bold">Simulador de Login</h1>
          <p class="text-muted small mb-4">
            Usa esta página para simular que has iniciado sesión como usuario asistente de prueba
            (Juan Pérez).
          </p>

          <button
            class="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            (click)="loginComoJuan()"
          >
            <i class="bi bi-person-check-fill"></i>
            Iniciar Sesión como Juan Pérez
          </button>

          <div class="mt-3 text-start bg-light p-3 rounded small">
            <strong>Credenciales simuladas:</strong><br />
            <span class="text-muted">Nombre:</span> Juan Pérez<br />
            <span class="text-muted">Email:</span> juan.perez.v4@fi.unju.edu.ar<br />
            <span class="text-muted">ID:</span> c9b0e271-e0c2-4045-8167-372998a44274
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TestLoginComponent {
  private readonly router = inject(Router);

  loginComoJuan() {
    // NOTA: desde C-22 la sesión se autentica por una cookie httpOnly que solo
    // puede emitir el backend, así que este simulador ya no puede falsear un
    // login real (las llamadas protegidas darían 401). Se deja solo el usuario
    // cacheado para probar la UI; ya NO se escribe ningún token en localStorage.
    const usuario = {
      id: 'c9b0e271-e0c2-4045-8167-372998a44274',
      nombre: 'Juan Pérez',
      email: 'juan.perez.v4@fi.unju.edu.ar',
    };

    localStorage.setItem('usuario', JSON.stringify(usuario));

    alert('Usuario de prueba cargado (solo UI; la sesión real requiere login).');
    this.router.navigate(['/eventos/a6e11cf8-17a4-4f9e-a0de-e2e01314995f']);
  }
}
