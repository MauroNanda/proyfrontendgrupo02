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
        (m) => m.PublicLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'eventos/:id',
        loadComponent: () =>
          import('./features/public/event-detail/event-detail.component').then(
            (m) => m.EventDetailComponent,
          ),
      },
      {
        path: 'test-login',
        loadComponent: () =>
          import('./features/public/test-login/test-login.component').then(
            (m) => m.TestLoginComponent,
          ),
      },
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./features/public/event-catalog/event-catalog.component').then(
            (m) => m.EventCatalogComponent,
          ),
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/user/perfil/perfil.component').then((m) => m.PerfilComponent),
      },
      {
        path: 'mis-inscripciones',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/user/mis-inscripciones/mis-inscripciones.component').then(
            (m) => m.MisInscripcionesComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'test-export',
        loadComponent: () =>
          import('./features/admin/test-export/test-export/test-export').then((m) => m.TestExport),
      },
      {
        path: 'accesos',
        loadComponent: () =>
          import('./features/admin/accesos/acceso-list.component').then(
            (m) => m.AccesoListComponent,
          ),
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/admin/categories/category.routes').then((m) => m.CATEGORY_ROUTES),
      },
      {
        path: 'eventos',
        loadChildren: () =>
          import('./features/admin/events/event.routes').then((m) => m.EVENT_ROUTES),
      },
      {
        path: 'eventos/:id/inscriptos',
        loadComponent: () =>
          import('./features/admin/attendees/attendee-list.component').then(
            (m) => m.AttendeeListComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
