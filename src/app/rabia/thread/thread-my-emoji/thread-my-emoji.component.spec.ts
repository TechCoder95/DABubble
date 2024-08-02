import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadMyEmojiComponent } from './thread-my-emoji.component';

describe('ThreadMyEmojiComponent', () => {
  let component: ThreadMyEmojiComponent;
  let fixture: ComponentFixture<ThreadMyEmojiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadMyEmojiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadMyEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
