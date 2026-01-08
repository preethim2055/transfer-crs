import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetailsComponent implements OnInit {
  data: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    const token = this.route.snapshot.paramMap.get('token');

    if (token) {
      this.fetchVehicleInfo(token);
    } else {
      console.error('No token found in URL');
      this.router.navigate(['/search']);
    }
  }

  fetchVehicleInfo(token: string) {
    this.api.bookingPost('transfercrs/info', { ResultToken: token }).subscribe({
      next: (res: any) => {
        this.data = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load vehicle info:', err);
        this.loading = false;
      }
    });
  }


onBookNow() {
    if (!this.data || !this.data.DetailsToken) {
      alert("Session expired. Please search again.");
      return;
    }

    this.loading = true;
    const detailsToken = this.data.DetailsToken;
    const refPayload = { "module": "transfer" };


    this.http.post('http://localhost:4017/transfercrs/createAppReference', refPayload, { responseType: 'text' })
      .pipe(
        switchMap((appRef: string) => {
          const blockPayload = {
            "DetailsToken": detailsToken,
            "app_reference": appRef,
            "booking_source": "B2C"
          };

          return this.api.bookingPost('transfercrs/blocktrip', blockPayload);
        })
      )
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res.status === 200 || res.message === 'Trip blocked successfully') {
            localStorage.setItem('active_app_reference', res.app_reference);
            this.router.navigate(['/booking/passenger-info', res.app_reference]);
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error("Booking flow failed", err);
          alert("Could not initialize booking. Please try again.");
        }
      });
  }

getFormattedDetailsFee(details: any): string {
  if (!details) return '';

  const fee = details.cancellation_fee;
  const type = details.cancellation_type; 

  return type === 'PERCENT' ? parseFloat(fee) + '%' : '₹' + fee;
}
}