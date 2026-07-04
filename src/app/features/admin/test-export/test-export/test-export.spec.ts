import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestExport } from './test-export';

describe('TestExport', () => {
  let component: TestExport;
  let fixture: ComponentFixture<TestExport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestExport],
    }).compileComponents();

    fixture = TestBed.createComponent(TestExport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
