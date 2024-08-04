import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadReceiveChatComponent } from './thread-receive-chat.component';

describe('ThreadChatComponent', () => {
  let component: ThreadReceiveChatComponent;
  let fixture: ComponentFixture<ThreadReceiveChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadReceiveChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadReceiveChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
