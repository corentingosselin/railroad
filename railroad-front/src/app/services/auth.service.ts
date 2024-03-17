import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import detectEthereumProvider from '@metamask/detect-provider';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentAccount = new BehaviorSubject<string | null>(null);

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    const provider: any = await detectEthereumProvider();

    if (provider) {
      // If MetaMask is available, check if we're already connected
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        // MetaMask automatically populates `eth_accounts` with the selected account if your site is authorized
        this.currentAccount.next(accounts[0]);
        
      }

      // Listen for account changes
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          this.currentAccount.next(accounts[0]);
        } else {
          this.currentAccount.next(null);
        }
      });
    } else {
      console.error('Please install MetaMask!');
    }
  }

  getCurrentAccount(): Observable<string | null> {
    return this.currentAccount.asObservable();
  }

  // Method to sign in with MetaMask, potentially updating `currentAccount`
  public async signInWithMetaMask() {
    const provider: any = await detectEthereumProvider();
    if (provider) {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        this.currentAccount.next(accounts[0]);
        return accounts[0];
      } else {
        throw new Error('No accounts returned from MetaMask.');
      }
    }
    throw new Error('MetaMask is not installed.');
  }

  public signOut() {
    // Clear the current account
    this.currentAccount.next(null);
    // You might want to instruct the user to manually disconnect their wallet from MetaMask for full "sign-out"
  }
}
