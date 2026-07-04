import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Evento, EventoService } from '../../../../core/services/evento.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css',
})
export class EventFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventoService = inject(EventoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editando = false;
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
      this.editando = true;

      this.eventoService.obtenerPorId(this.idEvento).subscribe((evento) => {
        this.formulario.patchValue({
          titulo: evento.titulo,
          descripcion: evento.descripcion,
          fecha: evento.fecha?.substring(0, 16),
          ubicacion: evento.ubicacion,
          cupo_maximo: evento.cupo_maximo,
          estado: evento.estado,
        });
      });
    }
  }

  guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.editando) {
      this.eventoService
        .actualizar(this.idEvento, this.formulario.getRawValue() as Partial<Evento>)
        .subscribe(() => {
          alert('Evento actualizado');

          this.router.navigate(['/admin/eventos']);
        });
    } else {
      this.eventoService.crear(this.formulario.getRawValue() as Partial<Evento>).subscribe(() => {
        alert('Evento creado');

        this.router.navigate(['/admin/eventos']);
      });
    }
  }
}
