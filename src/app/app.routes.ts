import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Ruteador central.
// Estrategia: lazy loading por feature, layouts separados para público vs admin.
// Las tareas de Fase 1+ agregan rutas hijas a cada layout (NO modifican esta estructura).

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.component').then((m) => m.HomeComponent),
      },
      // T-01-3: cargar login + registro.
      // T-02-3: cargar /eventos y /eventos/:id.
      // T-01-3 (perfil): cargar /perfil.
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      // T-05-4 (dashboard), T-02-5 (event-manager), T-03-5 (attendee-list).
    ],
  },
  { path: '**', redirectTo: '' },
];
