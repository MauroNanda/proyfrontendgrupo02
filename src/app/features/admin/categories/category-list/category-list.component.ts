import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  // Paleta de colores para gráficos y visuales temáticos
  readonly coloresCategorias = [
    '#5289ad', // Azul Convoca
    '#8b5cf6', // Violeta
    '#10b981', // Esmeralda
    '#f59e0b', // Ámbar
    '#ec4899', // Rosa
    '#06b6d4', // Cian
    '#ef4444', // Rojo
    '#64748b', // Pizarra
  ];

  // Cantidad total de asignaciones evento-categoría
  readonly totalEnlaces = computed(() => {
    return this.categorias().reduce((acc, cat) => acc + (cat.Eventos?.length || 0), 0);
  });

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

  obtenerNombresEventos(categoria: Categoria): string {
    if (!categoria.Eventos || categoria.Eventos.length === 0) {
      return 'Sin eventos asociados';
    }
    return `Eventos asociados:\n- ${categoria.Eventos.map((e: any) => e.titulo).join('\n- ')}`;
  }

  obtenerPorcentaje(cat: Categoria): number {
    const total = this.totalEnlaces();
    if (total === 0) return 0;
    return Math.round(((cat.Eventos?.length || 0) / total) * 100);
  }

  obtenerColorCategoria(index: number): string {
    return this.coloresCategorias[index % this.coloresCategorias.length];
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
