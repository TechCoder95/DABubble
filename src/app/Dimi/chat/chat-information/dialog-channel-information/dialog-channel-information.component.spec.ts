import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelInformationComponent } from './dialog-channel-information.component';

describe('DialogChannelInformationComponent', () => {
  let component: DialogChannelInformationComponent;
  let fixture: ComponentFixture<DialogChannelInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChannelInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogChannelInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
