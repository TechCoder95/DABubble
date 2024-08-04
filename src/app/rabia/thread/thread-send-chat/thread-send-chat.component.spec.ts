import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadSendChatComponent } from './thread-send-chat.component';

describe('ThreadSendChatComponent', () => {
  let component: ThreadSendChatComponent;
  let fixture: ComponentFixture<ThreadSendChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadSendChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadSendChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
