import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.css']
})
export class SearchResultsComponent implements OnInit {
  // Search parameters matching your Availability API structure
  searchParams = {
    starting_point: '',
    ending_point: '',
    start_date: ''
  };

  filteredRoutes: any[] = [];
  pickupSuggestions: any[] = [];
  dropoffSuggestions: any[] = [];
  isSearching: boolean = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    // We no longer need to load master vehicles here
    // because the availability API returns names directly.
  }

performSearch() {
  this.isSearching = true;
  this.filteredRoutes = [];

  this.api.bookingPost('transfercrs/availability', this.searchParams).subscribe({
    next: (res: any) => {
      this.filteredRoutes = Array.isArray(res) ? res : [res];
      this.isSearching = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.isSearching = false;
      this.cdr.detectChanges();
    }
  });
}

selectCity(city: string, type: 'pickup' | 'dropoff') {
  if (type === 'pickup') {
    this.searchParams.starting_point = city; // Update key here
    this.pickupSuggestions = [];
  } else {
    this.searchParams.ending_point = city;   // Update key here
    this.dropoffSuggestions = [];
  }
}

  getSuggestions(term: string, type: 'pickup' | 'dropoff') {
    if (!term || term.length < 3) return;

    this.api.bookingPost('transfercrs/autosuggest', { DestName: term }).subscribe({
      next: (res: any) => {
        if (type === 'pickup') this.pickupSuggestions = res;
        else this.dropoffSuggestions = res;
        this.cdr.detectChanges();
      }
    });
  }

  // transfercrs.service.ts




  checkLoginAndBook(route: any) {
  this.router.navigate(['/booking/details', route.ResultToken]);
  }
}