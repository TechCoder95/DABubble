import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddChannelMembersComponent } from './dialog-add-channel-members.component';

describe('DialogAddChannelMembersComponent', () => {
  let component: DialogAddChannelMembersComponent;
  let fixture: ComponentFixture<DialogAddChannelMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddChannelMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddChannelMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
