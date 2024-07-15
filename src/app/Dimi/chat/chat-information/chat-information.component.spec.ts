import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInformationComponent } from './chat-information.component';

describe('ChatInformationComponent', () => {
  let component: ChatInformationComponent;
  let fixture: ComponentFixture<ChatInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
