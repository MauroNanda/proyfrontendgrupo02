import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-placeholder',
  template: `
    <div class="container py-5">
      <div class="card shadow-sm border-0">
        <div class="card-body p-5 text-center">
          <i class="bi bi-speedometer2 text-primary" style="font-size: 3rem;"></i>
          <h1 class="h4 mt-3 mb-2 fw-bold">Dashboard</h1>
          <p class="text-muted">Próximamente: Panel de administración.</p>
        </div>
      </div>
    </div>
  `,
  imports: [],
})
export class DashboardPlaceholderComponent {}
