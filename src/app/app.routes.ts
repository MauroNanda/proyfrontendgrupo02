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
          import('./features/admin/dashboard-placeholder/dashboard-placeholder.component').then(
            (m) => m.DashboardPlaceholderComponent,
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
