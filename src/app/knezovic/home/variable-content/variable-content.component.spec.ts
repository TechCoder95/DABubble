import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableContentComponent } from './variable-content.component';

describe('VariableContentComponent', () => {
  let component: VariableContentComponent;
  let fixture: ComponentFixture<VariableContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariableContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariableContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
