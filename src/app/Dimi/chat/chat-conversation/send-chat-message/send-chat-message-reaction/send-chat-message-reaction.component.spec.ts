import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendChatMessageReactionComponent } from './send-chat-message-reaction.component';

describe('SendChatMessageReactionComponent', () => {
  let component: SendChatMessageReactionComponent;
  let fixture: ComponentFixture<SendChatMessageReactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendChatMessageReactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendChatMessageReactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
