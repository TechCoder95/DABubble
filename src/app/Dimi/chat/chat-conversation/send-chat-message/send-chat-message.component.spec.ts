import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendChatMessageComponent } from './send-chat-message.component';

describe('SendChatMessageComponent', () => {
  let component: SendChatMessageComponent;
  let fixture: ComponentFixture<SendChatMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendChatMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendChatMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
