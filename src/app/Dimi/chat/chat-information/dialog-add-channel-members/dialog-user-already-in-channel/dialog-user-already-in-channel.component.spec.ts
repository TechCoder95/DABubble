import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUserAlreadyInChannelComponent } from './dialog-user-already-in-channel.component';

describe('DialogUserAlreadyInChannelComponent', () => {
  let component: DialogUserAlreadyInChannelComponent;
  let fixture: ComponentFixture<DialogUserAlreadyInChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogUserAlreadyInChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogUserAlreadyInChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
