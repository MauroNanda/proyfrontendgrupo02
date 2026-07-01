import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCatalogComponent } from './event-catalog.component';

describe('EventCatalogComponent', () => {
  let component: EventCatalogComponent;
  let fixture: ComponentFixture<EventCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCatalogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCatalogComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
