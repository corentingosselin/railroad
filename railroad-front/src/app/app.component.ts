import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectWalletComponent } from './connect-wallet/connect-wallet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConnectWalletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'railroad-front';
}
