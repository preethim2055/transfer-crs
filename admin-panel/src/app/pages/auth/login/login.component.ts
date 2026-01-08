import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private router: Router, private api: ApiService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      role: ['USER', Validators.required]
    });
  }

onLogin() {
  if (this.loginForm.invalid) return;
  this.loading = true;

  // FIX: Change 'bookingPost' to 'adminPost' to hit Port 3000
  this.api.adminPost('api/auth/login', this.loginForm.value).subscribe({
    next: (res: any) => {
      // Store session data locally
      localStorage.setItem('tripgo_token', res.token);
      localStorage.setItem('tripgo_role', res.role);

      // Conditional routing based on role
      if (res.role === 'ADMIN') {
        this.router.navigate(['/admin/vehicle-type']);
      } else {
        this.router.navigate(['/booking/search']);
      }
    },
    error: (err) => {
      this.loading = false;
      // Helpful error message for debugging
      alert('Login failed: ' + (err.error?.message || 'Invalid Credentials'));
    }
  });
}
}