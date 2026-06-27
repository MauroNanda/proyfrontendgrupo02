export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol?: 'ORGANIZADOR' | 'ASISTENTE';
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
