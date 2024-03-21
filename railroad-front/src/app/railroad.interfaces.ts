import { BigNumberish } from 'ethers';

export interface PrivilegeCard {
  id: BigNumberish;
  name: string;
  description: string;
  imageURL: string;
  price: number;
  maxSupply: BigNumberish;
  discountRate: number;
  totalSupplied: BigNumberish;
}

export interface Ticket {
  id: number;
  pricePaid: number;
  discountApplied: number;
}