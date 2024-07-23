import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenUserInfoComponent } from './open-user-info.component';

describe('OpenUserInfoComponent', () => {
  let component: OpenUserInfoComponent;
  let fixture: ComponentFixture<OpenUserInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenUserInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenUserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
