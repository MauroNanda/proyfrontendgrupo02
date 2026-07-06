export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol?: 'ORGANIZADOR' | 'ASISTENTE';
  avatarUrl?: string;
  two_factor_enabled?: boolean;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
  // Presentes solo cuando el login dispara el segundo factor (no hay token aún).
  requiere2FA?: boolean;
  email?: string;
  mensaje?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegistroCredentials {
  nombre: string;
  username: string;
  email: string;
  password: string;
}
