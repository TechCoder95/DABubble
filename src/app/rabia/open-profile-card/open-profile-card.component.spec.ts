import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenProfileCardComponent } from './open-profile-card.component';

describe('OpenProfileCardComponent', () => {
  let component: OpenProfileCardComponent;
  let fixture: ComponentFixture<OpenProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenProfileCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
