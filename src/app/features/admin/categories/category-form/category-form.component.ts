import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Categoria, CategoriaService } from '../../../../core/services/categoria.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css',
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  readonly editando = signal(false);
  readonly loading = signal(false);
  readonly cargando = signal(false);
  idCategoria = '';

  formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(255)],
  });

  ngOnInit(): void {
    this.idCategoria = this.route.snapshot.paramMap.get('id') || '';

    if (this.idCategoria) {
      this.editando.set(true);
      this.cargando.set(true);

      // Note: we can fetch all categories and find the specific one, or if we had a getById backend endpoint.
      // Wait, does the backend have a getById endpoint for category?
      // Let's check: routes/categoria.routes.js:
      // router.get('/', controller.listar);
      // Wait, it only has get '/' (which is listar)! No get('/:id')!
      // Since there is no get('/:id') on the backend for categories, we can fetch all categories and filter the one with this ID, or add a getById on backend.
      // Wait! Let's check: we can fetch all categories using getAll() and search in the array!
      // This is very clean and doesn't require backend additions if they didn't write a GET /:id!
      // Let's write that logic to be perfectly safe and functional!
      this.categoriaService.getAll().subscribe({
        next: (lista) => {
          const cat = lista.find((c) => c.id === this.idCategoria);
          if (cat) {
            this.formulario.patchValue({
              nombre: cat.nombre,
              descripcion: cat.descripcion || '',
            });
          } else {
            this.toastService.error('Categoría no encontrada');
            this.router.navigate(['/admin/categorias']);
          }
          this.cargando.set(false);
        },
        error: () => {
          this.toastService.error('No se pudieron cargar las categorías');
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
      this.categoriaService
        .update(this.idCategoria, this.formulario.getRawValue() as Partial<Categoria>)
        .subscribe({
          next: () => {
            this.toastService.success('Categoría actualizada correctamente');
            this.router.navigate(['/admin/categorias']);
          },
          error: () => {
            this.toastService.error('Error al actualizar la categoría');
            this.loading.set(false);
          },
        });
    } else {
      this.categoriaService.create(this.formulario.getRawValue() as Partial<Categoria>).subscribe({
        next: () => {
          this.toastService.success('Categoría creada correctamente');
          this.router.navigate(['/admin/categorias']);
        },
        error: () => {
          this.toastService.error('Error al crear la categoría');
          this.loading.set(false);
        },
      });
    }
  }
}
