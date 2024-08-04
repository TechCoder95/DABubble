import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveChatMessageReactionsComponent } from './active-chat-message-reactions.component';

describe('ActiveChatMessageReactionsComponent', () => {
  let component: ActiveChatMessageReactionsComponent;
  let fixture: ComponentFixture<ActiveChatMessageReactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveChatMessageReactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveChatMessageReactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
