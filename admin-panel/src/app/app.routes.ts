import { Routes } from '@angular/router';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard.component';
import { VehicleType } from './admin/vehicle-type/vehicle-type';
import { VehicleMaster } from './admin/vehicle-master/vehicle-master';
import { RouteMaster } from './admin/route-master/route-master.component';
import { ProductDetailsComponent } from './pages/product-details/product-details';
import { SearchResultsComponent } from './booking/search-results/search-results';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminDashboard,
    children: [
      { path: 'vehicle-type', component: VehicleType },
      { path: 'vehicle-master', component: VehicleMaster },
      { path: 'routes', component: RouteMaster },
      { path: '', redirectTo: 'vehicle-type', pathMatch: 'full' }
    ]
  },
  {
    path: 'booking',
    children: [
      { path: 'search', component: SearchResultsComponent },
      { path: 'details/:token', component: ProductDetailsComponent },
     
      {
        path: 'passenger-info/:app_reference',
        loadComponent: () => import('./pages/passenger-info/passenger-info.component').then(m => m.PassengerInfoComponent)
      }
    ]
  },
  { path: '', redirectTo: 'admin/vehicle-type', pathMatch: 'full' }
];