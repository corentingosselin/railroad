import { TestBed } from '@angular/core/testing';

import { ContractABIService } from './contract-abi.service';

describe('ContractABIService', () => {
  let service: ContractABIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractABIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
