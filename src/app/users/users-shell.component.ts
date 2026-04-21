// users/users-shell.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-users-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="users-shell">

      <!-- Users Sidebar -->
      <aside class="users-sidebar">
        <div class="users-sidebar-header">
          <button class="back-btn" routerLink="/">
            ← NEXUS
          </button>
          <div class="module-title">
            <span class="module-icon">◈</span>
            <span>USER MGMT</span>
          </div>
        </div>

        <nav class="users-nav">
          <span class="nav-group-label">MANAGEMENT</span>
          <ul>
            @for (item of navItems; track item.path) {
              <li>
                <a class="users-nav-item"
                   [routerLink]="item.path"
                   routerLinkActive="active"
                   [routerLinkActiveOptions]="{ exact: item.exact ?? false }">
                  <span class="nav-item-icon">{{ item.icon }}</span>
                  <span class="nav-item-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="nav-item-badge">{{ item.badge }}</span>
                  }
                </a>
              </li>
            }
          </ul>

          @if (isAdmin()) {
            <span class="nav-group-label" style="margin-top: 16px">ADMIN ONLY</span>
            <ul>
              @for (item of adminNavItems; track item.path) {
                <li>
                  <a class="users-nav-item"
                     [routerLink]="item.path"
                     routerLinkActive="active">
                    <span class="nav-item-icon">{{ item.icon }}</span>
                    <span class="nav-item-label">{{ item.label }}</span>
                  </a>
                </li>
              }
            </ul>
          }
        </nav>

        <!-- Auth user info -->
        <div class="users-sidebar-footer">
          @if (userSvc.authUser(); as user) {
            <div class="auth-user">
              <div class="auth-avatar" [style.color]="user.avatarColor">{{ user.avatarInitials }}</div>
              <div class="auth-info">
                <div class="auth-name">{{ user.firstName }} {{ user.lastName }}</div>
                <div class="auth-role">{{ user.role | uppercase }}</div>
              </div>
              <button class="logout-btn" (click)="logout()" title="Logout">⏻</button>
            </div>
          }
        </div>
      </aside>

      <!-- Routed page content -->
      <div class="users-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./users-shell.component.css']
})
export class UsersShellComponent {
  userSvc = inject(UserService);
  private router = inject(Router);

  navItems = [
    { path: '/users/dashboard', label: 'Dashboard',   icon: '⬡', exact: true },
    { path: '/users/list',      label: 'User List',   icon: '☰', badge: this.userSvc.userStats().total },
    { path: '/users/create',    label: 'Add User',    icon: '+' },
  ];

  adminNavItems = [
    { path: '/users/list', label: 'All Users',     icon: '◫' },
  ];

  isAdmin() {
    return this.userSvc.authUser()?.role === 'admin';
  }

  logout() {
    this.userSvc.logout();
    this.router.navigate(['/users/login']);
  }
}
