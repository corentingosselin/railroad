import { Injectable, inject } from '@angular/core';
import {
  BigNumberish,
  BrowserProvider,
  Contract,
  Signer,
  ethers,
  toNumber,
} from 'ethers';
import { PrivilegeCard } from '../railroad.interfaces';
import { ContractABIService } from './contract-abi.service';
import {
  BehaviorSubject,
  Observable,
  filter,
  forkJoin,
  from,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlockchainService {
  privilegeCards$: BehaviorSubject<PrivilegeCard[]> = new BehaviorSubject<
    PrivilegeCard[]
  >([]);

  myPrivilegeCards$: BehaviorSubject<PrivilegeCard[]> = new BehaviorSubject<
    PrivilegeCard[]
  >([]);

  private contract?: Contract;

  constructor() {
    this.initialize();
  }

  private contractABIService = inject(ContractABIService);

  async initialize(): Promise<void> {
    // Assuming BrowserProvider is the updated way to get a provider
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await this.getSigner(provider);

    console.log('abi ', this.contractABIService.contractABI?.abi);

    const contractAddress = this.contractABIService.contractAddress;

    if (!contractAddress) {
      console.error('Contract address not found');
      return;
    }

    this.contract = new Contract(
      contractAddress,
      this.contractABIService.contractABI?.abi,
      signer
    );

    console.log('Contract initialized ', await this.contract.getAddress());
    this.getPrivilegeCards(this.contract).subscribe((cards) => {
      this.privilegeCards$.next(cards);
    });

    this.getUserPrivilegeCards(this.contract, signer).subscribe((cards) => {
      this.myPrivilegeCards$.next(cards);
    });
  }

  refreshPrivilegeCards(): void {
    if (this.contract) {
      this.getPrivilegeCards(this.contract).subscribe((cards) => {
        this.privilegeCards$.next(cards);
      });
    }
  }

  getSigner(provider: BrowserProvider): Promise<Signer> {
    return provider.getSigner();
  }

  async createPrivilegeCard(
    name: string,
    description: string,
    price: ethers.BigNumberish,
    maxSupply: number,
    discountRate: number
  ): Promise<void> {
    if (!this.contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      const transaction = await this.contract['createCard'](
        name,
        description,
        ethers.parseEther(price.toString()),
        maxSupply,
        discountRate
      );
      await transaction.wait(); // Wait for the transaction to be mined
      this.refreshPrivilegeCards(); // Refresh the list after adding a new card
      console.log('PrivilegeCard created successfully');
    } catch (error) {
      console.error('Failed to create PrivilegeCard:', error);
    }
  }

  getPrivilegeCards(contracts: Contract): Observable<PrivilegeCard[]> {
    const getTotalCards = this.contract!['getTotalCards']();
    return from(getTotalCards).pipe(
      switchMap((totalCards) => {
        const cardObservables = [];
        for (let i = 0; i < totalCards; i++) {
          cardObservables.push(from(this.contract!['cards'](i)));
        }
        return forkJoin(cardObservables);
      }),
      map((cards) => {
        return cards.map((card) => ({
          id: card.id,
          name: card.name,
          description: card.description,
          price: Number(ethers.formatEther(card.price)),
          maxSupply: card.maxSupply,
          discountRate: card.discountRate,
          totalSupplied: card.totalSupplied,
        }));
      }),
      map((cards) =>
        cards.filter(
          (card) => toNumber(card.totalSupplied) < toNumber(card.maxSupply)
        )
      )
    );
  }

  async buyPrivilegeCard(card: PrivilegeCard) {
    if (!this.contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      console.log('Buying PrivilegeCard:', card);
      const transaction = await this.contract['buyCard'](card.id, {
        value: ethers.parseEther(card.price.toString()),
      });
      console.log('Transaction:', transaction);
      await transaction.wait();
      console.log('PrivilegeCard bought successfully');
    } catch (error) {
      console.error('Failed to buy PrivilegeCard:', error);
    }
  }

  getUserPrivilegeCards(
    contract: Contract,
    signer: Signer
  ): Observable<PrivilegeCard[]> {
    if (!contract) {
      console.error('Contract not initialized');
      return of([]);
    }

    const userAddress$ = from(signer.getAddress());
    return userAddress$.pipe(
      switchMap((userAddress) =>
        from(contract['balanceOf'](userAddress)).pipe(
          switchMap((tokenCount: BigNumberish) => {
            const cardObservables = [];
            for (let i = 0; i < toNumber(tokenCount); i++) {
              cardObservables.push(
                from(contract['tokenOfOwnerByIndex'](userAddress, i))
              );
            }
            return cardObservables.length > 0
              ? forkJoin(cardObservables)
              : of([]);
          }),
          switchMap((tokenIds) =>
            forkJoin(
              tokenIds.map((tokenId) =>
                from(contract['getCardType'](tokenId)).pipe(
                  switchMap((cardType) => from(contract['cards'](cardType)))
                )
              )
            )
          ),
          map((cards) =>
            cards.map((card, index) => ({
              // Assuming the structure of your card object
              id: card.id,
              name: card.name,
              description: card.description,
              price: Number(ethers.formatEther(card.price)),
              maxSupply: card.maxSupply,
              discountRate: card.discountRate,
              totalSupplied: card.totalSupplied,
            }))
          )
        )
      )
    );
  }
}
