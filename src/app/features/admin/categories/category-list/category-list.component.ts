import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Categoria, CategoriaService } from '../../../../core/services/categoria.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private toastService = inject(ToastService);

  readonly categorias = signal<Categoria[]>([]);
  readonly loading = signal(true);
  readonly eliminandoId = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading.set(true);
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al cargar las categorías');
        this.loading.set(false);
      },
    });
  }

  confirmarEliminar(categoria: Categoria): void {
    if (
      !confirm(
        `¿Eliminar la categoría "${categoria.nombre}"? Esto desvinculará la categoría de todos los eventos.`,
      )
    ) {
      return;
    }
    this.eliminandoId.set(categoria.id);
    this.categoriaService.delete(categoria.id).subscribe({
      next: () => {
        this.toastService.success('Categoría eliminada correctamente');
        this.eliminandoId.set(null);
        this.cargarCategorias();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al eliminar la categoría');
        this.eliminandoId.set(null);
      },
    });
  }
}
