import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveChatMessageReactionComponent } from './receive-chat-message-reaction.component';

describe('ReceiveChatMessageReactionComponent', () => {
  let component: ReceiveChatMessageReactionComponent;
  let fixture: ComponentFixture<ReceiveChatMessageReactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiveChatMessageReactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiveChatMessageReactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
