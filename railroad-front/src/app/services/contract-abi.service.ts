import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

interface ContractAddress {
  address: string;
  ticketAddress: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContractABIService {
  private http = inject(HttpClient);

  contractABI?: any;
  ticketABI?: any;
  contractAddress?: string;
  ticketContractAddress?: string;

  constructor() {
    this.getPrivilegeCardABI().subscribe((data: any) => {
      this.contractABI = data;
    });

    this.getTicketABI().subscribe((data: any) => {
      this.ticketABI = data;
    });

    this.getContractAddress().subscribe((data) => {
      this.contractAddress = data.address;
      this.ticketContractAddress = data.ticketAddress;
    });
  }

  getContractAddress() {
    return this.http.get<ContractAddress>('assets/contractAddress.json');
  }

  getPrivilegeCardABI() {
    return this.http.get('assets/PrivilegeCard.json');
  }

  getTicketABI() {
    return this.http.get('assets/TicketSystem.json');
  }
}
