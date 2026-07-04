import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService } from '../../../../../core/services/categoria.service';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: CategoriaService,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.service.create(this.form.value).subscribe(() => alert('Guardado!'));
    }
  }
}
