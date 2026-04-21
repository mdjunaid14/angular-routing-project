// users/pages/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">

        <!-- Logo -->
        <div class="login-logo">
          <div class="logo-mark">N</div>
          <div>
            <div class="logo-title">NEXUS</div>
            <div class="logo-sub">User Management Portal</div>
          </div>
        </div>

        <!-- Error banner -->
        @if (loginError) {
          <div class="error-banner">
            <span>⊘</span> {{ loginError }}
          </div>
        }

        <!-- Login Form (Reactive) -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate>

          <div class="field-group">
            <label class="field-label">EMAIL ADDRESS</label>
            <input
              type="email"
              formControlName="email"
              class="field-input"
              [class.field-input--error]="isInvalid('email')"
              placeholder="admin@nexus.io"
              autocomplete="email">
            @if (isInvalid('email')) {
              <span class="field-error">
                @if (f['email'].errors?.['required']) { Email is required }
                @else if (f['email'].errors?.['email']) { Enter a valid email address }
              </span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">PASSWORD</label>
            <div class="field-input-wrap">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                class="field-input"
                [class.field-input--error]="isInvalid('password')"
                placeholder="••••••••"
                autocomplete="current-password">
              <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                {{ showPassword ? '⊙' : '⊚' }}
              </button>
            </div>
            @if (isInvalid('password')) {
              <span class="field-error">
                @if (f['password'].errors?.['required']) { Password is required }
                @else if (f['password'].errors?.['minlength']) { Minimum 6 characters }
              </span>
            }
          </div>

          <button type="submit" class="login-btn" [class.loading]="isLoading" [disabled]="isLoading">
            @if (isLoading) {
              <span class="spinner">↻</span> AUTHENTICATING...
            } @else {
              SIGN IN →
            }
          </button>
        </form>

        <!-- Demo credentials -->
        <div class="demo-hint">
          <span class="demo-label">DEMO CREDENTIALS</span>
          <div class="demo-credentials">
            <button class="demo-btn" (click)="fillDemo('admin@nexus.io')">
              Admin
            </button>
            <button class="demo-btn" (click)="fillDemo('p.chen@nexus.io')">
              Designer
            </button>
            <button class="demo-btn" (click)="fillDemo('j.muller@nexus.io')">
              Developer
            </button>
          </div>
          <span class="demo-pw">All passwords: <code>nexus123</code></span>
        </div>

      </div>

      <!-- Right panel -->
      <div class="login-aside">
        <div class="aside-content">
          <div class="aside-tag">SECURE ACCESS PORTAL</div>
          <h2 class="aside-title">Manage your<br><span class="aside-accent">team & users</span><br>with precision.</h2>
          <div class="aside-features">
            @for (feat of features; track feat.label) {
              <div class="aside-feat">
                <span class="feat-icon">{{ feat.icon }}</span>
                <span>{{ feat.label }}</span>
              </div>
            }
          </div>
        </div>
        <div class="aside-glow"></div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb      = inject(FormBuilder);
  private userSvc = inject(UserService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);

  showPassword = false;
  isLoading    = false;
  loginError   = '';

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  features = [
    { icon: '◎', label: 'Role-based access control' },
    { icon: '⊙', label: 'Real-time user activity' },
    { icon: '◫', label: 'Task assignment tracking' },
    { icon: '⊞', label: 'Department analytics' },
  ];

  get f() { return this.loginForm.controls; }

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  fillDemo(email: string) {
    this.loginForm.patchValue({ email, password: 'nexus123' });
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.isLoading   = true;
    this.loginError  = '';

    // Simulate async auth
    setTimeout(() => {
      const { email, password } = this.loginForm.value;
      const ok = this.userSvc.login(email!, password!);
      this.isLoading = false;

      if (ok) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/users/dashboard';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.loginError = 'Invalid email or password. Try nexus123 as password.';
      }
    }, 800);
  }
}
