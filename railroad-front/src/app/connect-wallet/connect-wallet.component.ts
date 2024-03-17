import { ChangeDetectionStrategy, Component, NgZone, OnInit, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connect-wallet',
  standalone: true,
  imports: [],
  templateUrl: './connect-wallet.component.html',
  styleUrl: './connect-wallet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectWalletComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  private ngZone = inject(NgZone);

  async connectToMetaMask() {
    try {
      await this.authService.signInWithMetaMask();
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit(): void {
    this.authService.getCurrentAccount().subscribe((account) => {
      if (account) {
        this.ngZone.run(() => {
          this.router.navigate(['/admin']);
        });
      }
    });
  }
}
