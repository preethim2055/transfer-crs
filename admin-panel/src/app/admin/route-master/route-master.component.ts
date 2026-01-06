import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api';

@Component({
  selector: 'app-route-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './route-master.component.html',
  styleUrls: ['./route-master.component.css']
})
export class RouteMaster implements OnInit {
  typeList: any[] = [];
  vehicleList: any[] = [];
  filteredVehicles: any[] = [];
  allRoutes: any[] = [];
  statusMessage: string = '';
  formMode: string = 'ADD';

  routeData: any = {
    id: null,
    vehicle_type_id: null,
    vehicle_name_id: null,
    starting_point: '',
    ending_point: '',
    duration_hours: 0,
    duration_minutes: 0,
    return_trip: false,
    is_refundable: false,
    cancellation_type: 'PERCENT',
    cancellation_fee: 0,
    cancellation_days: 0,
    seasons: [{ start_date: '', end_date: '', base_price: 0 }]
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadData(); }

  loadData() {
    this.api.adminPost('vehicle-type/vehicleTypeList', {}).subscribe(res => this.typeList = res);
    this.api.adminPost('transfer-crs/vehicleMasterList', {}).subscribe(res => {
        this.vehicleList = res;
        this.filteredVehicles = res;
    });
    this.loadRoutes();
  }

  loadRoutes() {
    this.api.adminPost('transfer-crs/listVehicle', {}).subscribe(res => {
      this.allRoutes = res;
      this.cdr.detectChanges();
    });
  }

  getVehicleDisplayName(r: any): string {
    const v = this.vehicleList.find(v => v.id === (r.vehicle_name_id || r.VehicleNameID));
    return v ? v.vehicle_name : (r.vehicle_name || 'Toyota Fortuner ac');
  }

  onTypeChange() {
    const tId = Number(this.routeData.vehicle_type_id);
    this.filteredVehicles = this.vehicleList.filter(v => Number(v.vehicle_type) === tId);
  }

  editRoute(r: any) {
    this.formMode = 'EDIT_INFO';
    this.routeData = JSON.parse(JSON.stringify(r));
    this.onTypeChange();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openPriceUpdate(r: any) {
    this.formMode = 'UPDATE_PRICE';
    const edit = JSON.parse(JSON.stringify(r));
    edit.seasons = edit.seasons.map((s: any) => ({
      ...s,
      start_date: s.start_date?.split('T')[0],
      end_date: s.end_date?.split('T')[0]
    }));
    this.routeData = edit;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveRoute() {
    if (this.formMode === 'EDIT_INFO') {
      const payload = {
        route_id: Number(this.routeData.id),
        starting_point: this.routeData.starting_point,
        ending_point: this.routeData.ending_point,
        duration_hours: Number(this.routeData.duration_hours),
        duration_minutes: Number(this.routeData.duration_minutes),
        return_trip: this.routeData.return_trip ? 1 : 0,
        cancellation_type: this.routeData.cancellation_type,
        cancellation_fee: Number(this.routeData.cancellation_fee),
        cancellation_days: Number(this.routeData.cancellation_days)
      };
      this.api.adminPost('transfer-crs/updateRoute', payload).subscribe(() => { this.reset(); });
    } else {
      const payload = { ...this.routeData, return_trip: this.routeData.return_trip ? 1 : 0 };
      this.api.adminPost('transfer-crs/addVehicle', payload).subscribe(() => { this.reset(); });
    }
  }

  savePricesOnly() {
    const payload = {
      route_id: Number(this.routeData.id),
      seasons: this.routeData.seasons.map((s: any) => ({
        id: s.id,
        start_date: s.start_date,
        end_date: s.end_date,
        base_price: Number(s.base_price)
      }))
    };
    this.api.adminPost('transfer-crs/updateSeasons', payload).subscribe(() => { this.reset(); });
  }

  addSeason() { this.routeData.seasons.push({ start_date: '', end_date: '', base_price: 0 }); }
  removeSeason(i: number) { this.routeData.seasons.splice(i, 1); }

  deleteRoute(id: number) {
    if(confirm('Delete route?')) {
      this.api.adminPost('transfer-crs/deleteVehicle', { id }).subscribe(() => { this.loadRoutes(); });
    }
  }

  reset() {
    this.formMode = 'ADD';
    this.routeData = {
      id: null, vehicle_type_id: null, vehicle_name_id: null,
      starting_point: '', ending_point: '', duration_hours: 0, duration_minutes: 0,
      return_trip: false, is_refundable: false, cancellation_type: 'PERCENT',
      cancellation_fee: 0, cancellation_days: 0,
      seasons: [{ start_date: '', end_date: '', base_price: 0 }]
    };
    this.loadRoutes();
  }
}