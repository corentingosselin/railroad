import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectWalletComponent } from './connect-wallet/connect-wallet.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConnectWalletComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'railroad-front';
}
