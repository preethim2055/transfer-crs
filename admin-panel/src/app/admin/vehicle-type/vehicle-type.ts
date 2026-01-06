import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';

@Component({
  selector: 'app-vehicle-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-type.html',
  styleUrl: './vehicle-type.css',
})
export class VehicleType implements OnInit {
  vehicleTypeForm: FormGroup;
  typeList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.vehicleTypeForm = this.fb.group({
      id: [null],
      Name: ['', Validators.required],
      Status: [1, Validators.required]
    });
  }

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.api.adminPost('vehicle-type/vehicleTypeList', {}).subscribe({
      next: (res) => {
        console.log('Data Received:', res);
        this.typeList = [...res];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Fetch Error:', err)
    });
  }

  onSubmit() {
    if (this.vehicleTypeForm.valid) {
      const isUpdating = !!this.vehicleTypeForm.value.id;
      const endpoint = isUpdating
        ? 'vehicle-type/updateVehicleType'
        : 'vehicle-type/addVehicleType';

      this.api.adminPost(endpoint, this.vehicleTypeForm.value).subscribe({
        next: (res) => {

          this.vehicleTypeForm.reset({ Status: 1, id: null });


          setTimeout(() => this.loadTypes(), 100);
        },
        error: (err) => console.error('Save Error:', err)
      });
    }
  }

  editType(item: any) {
    this.vehicleTypeForm.patchValue({
      id: item.id,
      Name: item.Name,
      Status: item.Status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteType(id: number) {
      this.api.adminPost('vehicle-type/deleteVehicleType', { id }).subscribe({
        next: () => this.loadTypes(),
        error: (err) => console.error('Delete Error:', err)
      });
    }
  }
