// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(
      [
        // Root — main dashboard shell (NOT lazy for root, direct import)
        {
          path: '',
          loadComponent: () =>
            import('./app.component').then(m => m.AppComponent),
          title: 'Nexus Dashboard'
        },

        // Users module — LAZY LOADED
        // The entire users feature is only bundled & loaded when /users is first visited
        {
          path: 'users',
          loadChildren: () =>
            import('./users/users.routes').then(m => m.USERS_ROUTES),
          title: 'User Management — Nexus'
        },

        // Wildcard fallback
        { path: '**', redirectTo: '' }
      ],
      withComponentInputBinding()  // enables route params as @Input() bindings
    )
  ]
};
