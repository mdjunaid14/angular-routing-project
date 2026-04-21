// users/users.routes.ts
import { Routes } from '@angular/router';
import { authGuard, adminGuard } from '../guards/auth.guard';

export const USERS_ROUTES: Routes = [
  // Login — public
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Sign In — Nexus'
  },

  // Protected shell — all children require auth
  {
    path: '',
    loadComponent: () =>
      import('./users-shell.component').then(m => m.UsersShellComponent),
    canActivate: [authGuard],
    children: [
      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard overview
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        title: 'User Dashboard — Nexus'
      },

      // User list — with optional query params: ?search=&role=&status=
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/user-list/user-list.component').then(m => m.UserListComponent),
        title: 'User Directory — Nexus'
      },

      // User profile — route param :id
      {
        path: 'profile/:id',
        loadComponent: () =>
          import('./pages/user-profile/user-profile.component').then(m => m.UserProfileComponent),
        title: 'User Profile — Nexus'
      },

      // Create user — admin only
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/user-form/user-form.component').then(m => m.UserFormComponent),
        canActivate: [adminGuard],
        title: 'Create User — Nexus'
      },

      // Edit user — route param :id, admin only
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./pages/user-form/user-form.component').then(m => m.UserFormComponent),
        canActivate: [adminGuard],
        title: 'Edit User — Nexus'
      },
    ]
  }
];
