import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadEmojiComponent } from './thread-emoji.component';

describe('ThreadEmojiComponent', () => {
  let component: ThreadEmojiComponent;
  let fixture: ComponentFixture<ThreadEmojiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadEmojiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
