import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Evento, EventoService } from '../../../../core/services/evento.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css',
})
export class EventFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventoService = inject(EventoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  readonly editando = signal(false);
  readonly loading = signal(false);
  readonly cargando = signal(false);
  idEvento = '';

  formulario = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    fecha: ['', Validators.required],
    ubicacion: ['', Validators.required],
    cupo_maximo: [1, [Validators.required, Validators.min(1)]],
    estado: ['BORRADOR', Validators.required],
  });

  ngOnInit(): void {
    this.idEvento = this.route.snapshot.paramMap.get('id') || '';

    if (this.idEvento) {
      this.editando.set(true);
      this.cargando.set(true);

      this.eventoService.obtenerPorId(this.idEvento).subscribe({
        next: (evento) => {
          this.formulario.patchValue({
            titulo: evento.titulo,
            descripcion: evento.descripcion,
            fecha: evento.fecha?.substring(0, 16),
            ubicacion: evento.ubicacion,
            cupo_maximo: evento.cupo_maximo,
            estado: evento.estado,
          });
          this.cargando.set(false);
        },
        error: () => {
          this.toastService.error('No se pudo cargar el evento');
          this.cargando.set(false);
        },
      });
    }
  }

  guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    if (this.editando()) {
      this.eventoService
        .actualizar(this.idEvento, this.formulario.getRawValue() as Partial<Evento>)
        .subscribe({
          next: () => {
            this.toastService.success('Evento actualizado correctamente');
            this.router.navigate(['/admin/eventos']);
          },
          error: () => {
            this.toastService.error('Error al actualizar el evento');
            this.loading.set(false);
          },
        });
    } else {
      this.eventoService.crear(this.formulario.getRawValue() as Partial<Evento>).subscribe({
        next: () => {
          this.toastService.success('Evento creado correctamente');
          this.router.navigate(['/admin/eventos']);
        },
        error: () => {
          this.toastService.error('Error al crear el evento');
          this.loading.set(false);
        },
      });
    }
  }
}
