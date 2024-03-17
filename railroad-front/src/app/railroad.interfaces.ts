import { BigNumberish } from 'ethers';

export interface PrivilegeCard {
  id: BigNumberish;
  name: string;
  description: string;
  price: number;
  maxSupply: BigNumberish;
  discountRate: number;
  totalSupplied: BigNumberish;
}
