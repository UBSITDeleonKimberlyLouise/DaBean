import { TestBed } from '@angular/core/testing';

import { Cafe } from './cafe';

describe('Cafe', () => {
  let service: Cafe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cafe);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
