import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleType } from './vehicle-type/vehicle-type';
import { VehicleMaster } from './vehicle-master/vehicle-master'; // Ensure this matches your filename

const routes: Routes = [
  { path: 'vehicle-type', component: VehicleType },
  { path: 'vehicle-master', component: VehicleMaster },
  { path: '', redirectTo: 'vehicle-type', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }