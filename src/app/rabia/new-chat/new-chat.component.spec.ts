import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChatComponent } from './new-chat.component';

describe('NewChatComponent', () => {
  let component: NewChatComponent;
  let fixture: ComponentFixture<NewChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
