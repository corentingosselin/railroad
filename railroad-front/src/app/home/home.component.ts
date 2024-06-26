import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { BlockchainService } from '../services/blockchain.service';
import { BehaviorSubject } from 'rxjs';
import { PrivilegeCard, Ticket } from '../railroad.interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {

  blockchainService = inject(BlockchainService);

  privilegeCards$: BehaviorSubject<PrivilegeCard[]> = new BehaviorSubject<PrivilegeCard[]>([]);
  myPrivilegeCards$: BehaviorSubject<PrivilegeCard[]> = new BehaviorSubject<PrivilegeCard[]>([]);
  myTickets$: BehaviorSubject<Ticket[]> = new BehaviorSubject<Ticket[]>([]);


  ngOnInit(): void {
    this.blockchainService.privilegeCards$.subscribe((cards) => {
      this.privilegeCards$.next(cards);
    });

    this.blockchainService.myPrivilegeCards$.subscribe((cards) => {
      this.myPrivilegeCards$.next(cards);
    });

    this.blockchainService.myTickets$.subscribe((tickets) => {
      this.myTickets$.next(tickets);
    });
  }

  async buyPrivilegeCard(card: PrivilegeCard) {
    await this.blockchainService.buyPrivilegeCard(card);
  }
  
  async buyTicket() {
    await this.blockchainService.buyTicket();
  }

}
