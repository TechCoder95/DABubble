import { TestBed } from '@angular/core/testing';

import { DAStorageService } from './dastorage.service';

describe('DAStorageService', () => {
  let service: DAStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DAStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
