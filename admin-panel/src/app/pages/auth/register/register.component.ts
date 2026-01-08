import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER'] // Hardcoded for public safety
    });
  }
onRegister() {
  if (this.registerForm.invalid) return;
  this.loading = true;

  // FIX: Use adminPost to hit port 3000
  this.api.adminPost('api/auth/register', this.registerForm.value).subscribe({
    next: (res: any) => {
      alert('Registration successful!');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.loading = false;
      alert('Registration failed: ' + (err.error?.message || 'Check your connection'));
    }
  });
}
}