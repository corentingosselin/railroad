import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

interface ContractAddress {
  address: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContractABIService {
  private http = inject(HttpClient);

  contractABI?: any;
  contractAddress?: string;

  constructor() {
    this.getPrivilegeCardABI().subscribe((data: any) => {
      this.contractABI = data;
    });

    this.getContractAddress().subscribe(
      (data) => (this.contractAddress = data.address)
    );
  }

  getContractAddress() {
    return this.http.get<ContractAddress>('assets/contractAddress.json');
  }

  getPrivilegeCardABI() {
    return this.http.get('assets/PrivilegeCard.json');
  }
}
