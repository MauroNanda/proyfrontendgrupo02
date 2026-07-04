import { Routes } from '@angular/router';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryFormComponent } from './category-form/category-form.component';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    component: CategoryListComponent,
  },
  {
    path: 'crear',
    component: CategoryFormComponent,
  },
  {
    path: 'editar/:id',
    component: CategoryFormComponent,
  },
];
