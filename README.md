# Nexus Dashboard — Angular 17 Project

Full-stack Angular 17 dashboard with user management, routing, guards, lazy loading and reactive forms.

## Quick Start

```bash
npm install
ng serve
# Open http://localhost:4200
```

## Routes

| URL | Description | Guard |
|-----|-------------|-------|
| `/` | Main task dashboard | None |
| `/users/login` | Login page | None |
| `/users/dashboard` | User overview | authGuard |
| `/users/list` | User directory (search + filter) | authGuard |
| `/users/profile/:id` | User profile page | authGuard |
| `/users/create` | Create user form | authGuard + adminGuard |
| `/users/edit/:id` | Edit user form | authGuard + adminGuard |

## Demo Credentials (login page)
- Email: `a.reyes@nexus.io` (Admin) or any user email
- Password: `nexus123`

## Architecture

```
src/app/
├── root.component.ts          # Top-level router-outlet
├── app.component.ts           # Main dashboard (overview, tasks, kanban)
├── app.config.ts              # provideRouter with lazy loading
├── guards/
│   └── auth.guard.ts          # authGuard + adminGuard (CanActivateFn)
├── models/dashboard.models.ts
├── services/dashboard.service.ts  # Signal-based state
├── components/
│   ├── sidebar/               # @Output viewChanged
│   ├── header/                # @Input currentView, @Output events
│   ├── stats-widget/          # @Input stat, @Output clicked
│   ├── task-card/             # @Input task/expanded, @Output statusChanged
│   └── notification-panel/
└── users/                     # ← LAZY LOADED MODULE
    ├── users.routes.ts        # Child routes with guards
    ├── users-shell.component.ts
    ├── models/user.models.ts
    ├── services/user.service.ts   # Signal-based, login/CRUD
    ├── components/
    │   ├── user-card/         # @Input user/compact, @Output deleteClicked
    │   └── role-badge/        # @Input role/status/type
    └── pages/
        ├── login/             # Reactive form, validators
        ├── dashboard/         # Stats, role breakdown, dept table
        ├── user-list/         # Search + filter + query params
        ├── user-profile/      # Route param :id, status control
        └── user-form/         # Create/edit, custom validators, strength meter
```

## Angular Criteria Covered

| Requirement | Implementation |
|---|---|
| 4+ reusable components | Sidebar, Header, StatsWidget, TaskCard, NotifPanel, UserCard, RoleBadge |
| @Input / @Output | All components use input/output for data flow |
| Shared Service | DashboardService + UserService with Angular Signals |
| @for / *ngFor | Lists across all components |
| @if / *ngIf | Conditional rendering throughout |
| ng-template / ng-container | StatusTemplate in TaskCard, IconTemplate in NotifPanel |
| Dynamic routing | Full router with child routes |
| Route guards | authGuard, adminGuard on protected pages |
| Lazy loading | Entire `/users` module lazy-loaded via `loadChildren` |
| Reactive forms | Login + UserForm with FormBuilder, Validators |
| Form validation | required, email, minLength, custom passwordStrength, passwordsMatch, phoneFormat |
| Query parameters | UserList syncs search/role/status to URL query params |
| Route parameters | Profile `/profile/:id`, Edit `/edit/:id` |
