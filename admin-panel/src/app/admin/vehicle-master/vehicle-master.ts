import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';

@Component({
  selector: 'app-vehicle-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-master.html'
})
export class VehicleMaster implements OnInit {
  vehicleForm: FormGroup;
  typeList: any[] = [];
  masterVehicles: any[] = [];
  statusMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.vehicleForm = this.fb.group({
      id: [null],
      vehicle_name: ['', Validators.required],
      vehicle_type: ['', Validators.required],
      ac_vehicle: [1, Validators.required],
      max_capacity: [4, [Validators.required, Validators.min(1)]],
      luggage_allowances: [2],
      ratings: [5],
      image: [''],
      status: [1]
    });
  }

  ngOnInit() {
    this.loadTypes();
    this.loadMasterVehicles();
  }

  loadTypes() {
    this.api.adminPost('vehicle-type/vehicleTypeList', {}).subscribe(res => {
      this.typeList = res;
      this.cdr.detectChanges();
    });
  }

  loadMasterVehicles() {
    this.api.adminPost('transfer-crs/vehicleMasterList', {}).subscribe(res => {
      this.masterVehicles = res;
      this.cdr.detectChanges();
    });
  }


onFileSelected(event: any) {
  const file = event.target.files[0];

  if (file) {
    // Optional: Check if file is > 5MB to warn user locally
    if (file.size > 5 * 1024 * 1024) {
      this.showStatus('File is too large! Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.vehicleForm.patchValue({ image: reader.result as string });
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }
}

  saveVehicle() {
    if (this.vehicleForm.invalid) return;

    const isUpdating = !!this.vehicleForm.value.id;
    const endpoint = isUpdating
      ? 'transfer-crs/updateVehicleMaster'
      : 'transfer-crs/addVehicleMaster';

    this.api.adminPost(endpoint, this.vehicleForm.value).subscribe({
      next: (res: any) => {
        this.showStatus(isUpdating ? 'Vehicle Updated successfully' : 'Vehicle Added successfully');
        this.resetForm();
        this.loadMasterVehicles();
      },
      error: (err) => console.error('Error saving vehicle', err)
    });
  }

  editVehicle(vehicle: any) {
    this.vehicleForm.patchValue({
      id: vehicle.id,
      vehicle_name: vehicle.vehicle_name,
      vehicle_type: vehicle.vehicle_type,
      ac_vehicle: vehicle.ac_vehicle,
      max_capacity: vehicle.max_capacity,
      luggage_allowances: vehicle.luggage_allowances,
      ratings: vehicle.ratings,
      image: vehicle.image,
      status: vehicle.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteVehicle(id: number) {
    this.api.adminPost('transfer-crs/deleteVehicleMaster', { id }).subscribe(() => {
      this.showStatus('Vehicle Deleted');
      this.loadMasterVehicles();
    });
  }

  showStatus(msg: string) {
    this.statusMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.statusMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  resetForm() {
    this.vehicleForm.reset({
      id: null,
      status: 1,
      ac_vehicle: 1,
      max_capacity: 4,
      ratings: 5,
      luggage_allowances: 2,
      image: ''
    });
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.cdr.detectChanges();
  }
}