import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();
  private nextId = 0;

  show(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info', duration = 3000): void {
    const id = this.nextId++;
    const newToast: Toast = { message, type, id };
    this.toastsSignal.update((current) => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 3000): void {
    this.show(message, 'danger', duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 3000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: number): void {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }
}
