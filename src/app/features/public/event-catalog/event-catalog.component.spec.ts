import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCatalogComponent } from './event-catalog.component';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventoService } from '../../../core/services/evento.service';
import { CategoriaService } from '../../../core/services/categoria.service';

describe('EventCatalogComponent', () => {
  let component: EventCatalogComponent;
  let fixture: ComponentFixture<EventCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCatalogComponent],
      providers: [
        provideRouter([]),
        { provide: EventoService, useValue: { obtenerTodos: () => of([]) } },
        { provide: CategoriaService, useValue: { getAll: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCatalogComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
