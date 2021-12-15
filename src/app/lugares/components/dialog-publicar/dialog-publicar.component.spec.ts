import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPublicarComponent } from './dialog-publicar.component';

describe('DialogPublicarComponent', () => {
  let component: DialogPublicarComponent;
  let fixture: ComponentFixture<DialogPublicarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogPublicarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPublicarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
