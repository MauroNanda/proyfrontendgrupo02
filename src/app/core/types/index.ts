export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  username?: string;
  rol?: 'ORGANIZADOR' | 'ASISTENTE';
  avatarUrl?: string;
  two_factor_enabled?: boolean;
}

export interface AuthResponse {
  // El token ya NO se usa en el front (la sesión va por cookie httpOnly); el
  // backend lo sigue mandando en transición, por eso queda opcional.
  token?: string;
  usuario: Usuario;
  // Presentes solo cuando el login dispara el segundo factor (no hay usuario aún).
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
