import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-passenger-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './passenger-info.component.html',
  styleUrls: ['./passenger-info.component.css']
})
export class PassengerInfoComponent implements OnInit {
  bookingForm!: FormGroup;
  appReference: string | null = '';
  currentStep: number = 1;
  submitting = false;

  constructor(private route: ActivatedRoute,
              private api: ApiService,
              private fb: FormBuilder,
              private cdr: ChangeDetectorRef
            ) {
    this.initForm();
  }

  ngOnInit() {
    this.appReference = this.route.snapshot.paramMap.get('app_reference');
  }

  initForm() {
    this.bookingForm = this.fb.group({
      title: ['Mr', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  goToPayment() {
    if (this.bookingForm.valid) {
      this.currentStep = 2;
    }
  }

  confirmAndPay() {
    this.submitting = true;
    const paxPayload = {
      app_reference: this.appReference,
      passengers: [{
        first_name: this.bookingForm.value.first_name,
        last_name: this.bookingForm.value.last_name,
        email: this.bookingForm.value.email,
        mobile: this.bookingForm.value.mobile,
        is_lead: 1
      }]
    };

    this.api.bookingPost('transfercrs/passengerdetails', paxPayload).subscribe({
      next: (res: any) => {
        this.confirmFinalBooking();
      },
      error: (err) => {
        this.submitting = false;
        alert("Passenger Error: " + (err.error?.message || "Check reference status"));
      }
    });
  }

confirmFinalBooking() {

  const payload = {
    app_reference: this.appReference,
    booking_source: 'B2C',
    payment_mode: 'credit_card',
    payment_id: 'PAY-' + Math.random().toString(36).substr(2, 9)
  };

  this.api.bookingPost('transfercrs/confirmBooking', payload).subscribe({
    next: (res: any) => {
      if (res && res.status == 200) {
        console.log('Booking Successful:', res);
        this.currentStep = 3;
        this.submitting = false;
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error('Booking failed:', err);
      this.submitting = false;
      alert("Booking Finalization Error: " + (err.error?.message || "Server Error"));
    }
  });
}


}