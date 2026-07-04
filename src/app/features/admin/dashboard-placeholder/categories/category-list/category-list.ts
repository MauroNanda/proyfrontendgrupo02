import { Component } from '@angular/core';
import { CategoriaService } from '../../../../../core/services/categoria.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-list',
  imports: [CommonModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList {
  categorias: any[] = [];

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit() {
    this.categoriaService.getAll().subscribe((data) => (this.categorias = data));
  }
}
