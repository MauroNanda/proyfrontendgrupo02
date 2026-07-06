import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./registro/registro.component').then((m) => m.RegistroComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./callback/oauth-callback.component').then((m) => m.OAuthCallbackComponent),
  },
  {
    path: 'auth/2fa',
    loadComponent: () => import('./2fa/2fa.component').then((m) => m.TwoFaComponent),
  },
];
