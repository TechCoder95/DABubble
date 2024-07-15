import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelMembersComponent } from './dialog-channel-members.component';

describe('DialogChannelMembersComponent', () => {
  let component: DialogChannelMembersComponent;
  let fixture: ComponentFixture<DialogChannelMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChannelMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogChannelMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
