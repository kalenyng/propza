import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPropertyModalComponent } from './add-property-modal.component';

describe('AddPropertyModalComponent', () => {
  let component: AddPropertyModalComponent;
  let fixture: ComponentFixture<AddPropertyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPropertyModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPropertyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
