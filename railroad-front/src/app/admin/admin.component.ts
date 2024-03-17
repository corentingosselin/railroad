import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PrivilegeCard } from '../railroad.interfaces';
import { BlockchainService } from '../services/blockchain.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {


  blockchainService = inject(BlockchainService);

  privilegeCards$: BehaviorSubject<PrivilegeCard[]> = new BehaviorSubject<PrivilegeCard[]>([]);

  privilegeCardForm: FormGroup;

  ngOnInit(): void {
    this.blockchainService.privilegeCards$.subscribe((cards) => {
      this.privilegeCards$.next(cards);
    });
  }

  constructor(private fb: FormBuilder) {
    this.privilegeCardForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+\.?\d*$/)]], // Regex for price validation
      maxSupply: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]], // Allow only integers
      discountRate: ['', [Validators.required, Validators.pattern(/^\d+\.?\d*$/)]], // Regex for discount rate validation
    });
  }

  onSubmit() {
    if (this.privilegeCardForm.valid) {
      console.log('Form Value', this.privilegeCardForm.value);
      this.blockchainService.createPrivilegeCard(
        this.privilegeCardForm.value.name,
        this.privilegeCardForm.value.description,
        this.privilegeCardForm.value.price,
        this.privilegeCardForm.value.maxSupply,
        this.privilegeCardForm.value.discountRate
      );
      // Call your service to interact with the smart contract
    } else {
      // Handle form errors
      console.error('Form is invalid');
    }
  }
}
