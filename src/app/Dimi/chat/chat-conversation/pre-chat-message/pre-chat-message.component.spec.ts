import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreChatMessageComponent } from './pre-chat-message.component';

describe('PreChatMessageComponent', () => {
  let component: PreChatMessageComponent;
  let fixture: ComponentFixture<PreChatMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreChatMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreChatMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
