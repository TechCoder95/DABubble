import { TestBed } from '@angular/core/testing';

import { GlobalsubService } from './globalsub.service';

describe('GlobalsubService', () => {
  let service: GlobalsubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalsubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
