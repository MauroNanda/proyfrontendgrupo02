import { Routes } from '@angular/router';

import { EventListComponent } from './event-list/event-list.component';
import { EventFormComponent } from './event-form/event-form.component';

export const EVENT_ROUTES: Routes = [
  {
    path: '',
    component: EventListComponent,
  },
  {
    path: 'crear',
    component: EventFormComponent,
  },
  {
    path: 'editar/:id',
    component: EventFormComponent,
  },
];
