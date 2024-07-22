import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenProfileInfoComponent } from './open-profile-info.component';

describe('OpenProfileInfoComponent', () => {
  let component: OpenProfileInfoComponent;
  let fixture: ComponentFixture<OpenProfileInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenProfileInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenProfileInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
