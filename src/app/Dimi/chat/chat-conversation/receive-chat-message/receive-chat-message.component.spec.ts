import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveChatMessageComponent } from './receive-chat-message.component';

describe('ReceiveChatMessageComponent', () => {
  let component: ReceiveChatMessageComponent;
  let fixture: ComponentFixture<ReceiveChatMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiveChatMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiveChatMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
