import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex" id="wrapper">
      <div class="bg-dark text-white" style="width: 250px; min-height: 100vh;">
        <div class="p-4 border-bottom border-secondary">
          <h4 class="text-primary mb-0">CRS Admin</h4>
        </div>
        <div class="list-group list-group-flush pt-3">
          <a routerLink="/admin/vehicle-type" class="nav-link px-4 py-3 text-white border-bottom border-secondary">
            <i class="bi bi-tag me-2"></i> Vehicle Types
          </a>
          <a routerLink="/admin/vehicle-master" class="nav-link px-4 py-3 text-white border-bottom border-secondary">
            <i class="bi bi-car-front me-2"></i> Vehicle Master
          </a>
          <a routerLink="/admin/routes" class="nav-link px-4 py-3 text-white border-bottom border-secondary">
            <i class="bi bi-map me-2"></i> Routes & Seasons
          </a>
        </div>
      </div>

      <div class="flex-grow-1 bg-light">
        <nav class="navbar navbar-light bg-white shadow-sm px-4 py-3">
          <span class="navbar-brand h5 mb-0">Administrator Panel</span>
        </nav>
        <div class="p-4">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-link:hover { background: #343a40; }
    .nav-link { text-decoration: none; display: block; transition: 0.2s; }
  `]
})
export class AdminDashboard {}