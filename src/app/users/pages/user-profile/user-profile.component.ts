// users/pages/user-profile/user-profile.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RoleBadgeComponent } from '../../components/role-badge/role-badge.component';
import { User, UserStatus } from '../../models/user.models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, RoleBadgeComponent],
  template: `
    @if (user(); as u) {
      <div class="page">

        <!-- Hero banner -->
        <div class="profile-hero" [style.border-left-color]="u.avatarColor">
          <div class="hero-left">
            <div class="hero-avatar" [style.border-color]="u.avatarColor + '55'">
              <span [style.color]="u.avatarColor">{{ u.avatarInitials }}</span>
              <span class="hero-status" [class]="'hero-status--' + u.status"></span>
            </div>
            <div class="hero-info">
              <div class="hero-name">{{ u.firstName }} {{ u.lastName }}</div>
              <div class="hero-email">{{ u.email }}</div>
              <div class="hero-badges">
                <app-role-badge [role]="u.role" type="role"></app-role-badge>
                <app-role-badge [status]="u.status" type="status"></app-role-badge>
              </div>
            </div>
          </div>

          <div class="hero-actions">
            <button class="hero-btn" [routerLink]="['/users/edit', u.id]">✎ EDIT</button>
            <button class="hero-btn hero-btn--back" routerLink="/users/list">← LIST</button>
          </div>
        </div>

        <!-- Stats row -->
        <div class="profile-stats">
          @for (stat of getProfileStats(u); track stat.label) {
            <div class="pstat">
              <div class="pstat-val" [style.color]="stat.color">{{ stat.value }}</div>
              <div class="pstat-label">{{ stat.label }}</div>
            </div>
          }
        </div>

        <!-- Body grid -->
        <div class="profile-grid">

          <!-- Left: Personal info -->
          <div class="profile-panel">
            <div class="panel-section-title">PERSONAL INFORMATION</div>

            <ng-container>
              @for (field of personalFields(u); track field.label) {
                <div class="info-row">
                  <span class="info-label">{{ field.label }}</span>
                  <span class="info-value">{{ field.value }}</span>
                </div>
              }
            </ng-container>

            <div class="panel-section-title" style="margin-top: 24px">BIO</div>
            <p class="bio-text">{{ u.bio }}</p>

            <div class="panel-section-title" style="margin-top: 24px">PERMISSIONS</div>
            <div class="permissions-list">
              @for (perm of allPermissions; track perm) {
                <div class="permission-item" [class.granted]="u.permissions.includes(perm)">
                  <span class="perm-icon">{{ u.permissions.includes(perm) ? '✓' : '○' }}</span>
                  <span>{{ perm | titlecase }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Right: Activity & settings -->
          <div class="profile-right">

            <!-- Task progress -->
            <div class="profile-panel">
              <div class="panel-section-title">TASK PERFORMANCE</div>
              <div class="task-progress-row">
                <div class="tp-labels">
                  <span class="tp-done">{{ u.tasksCompleted }} done</span>
                  <span class="tp-total">{{ u.tasksAssigned }} assigned</span>
                </div>
                <div class="tp-bar">
                  <div class="tp-bar-fill"
                    [style.width.%]="u.tasksAssigned ? (u.tasksCompleted / u.tasksAssigned * 100) : 0"
                    [style.background]="u.avatarColor">
                  </div>
                </div>
                <div class="tp-pct">
                  {{ u.tasksAssigned ? (u.tasksCompleted / u.tasksAssigned * 100 | number:'1.0-0') : 0 }}% completion rate
                </div>
              </div>
            </div>

            <!-- Status controls (admin only) -->
            @if (isAdmin()) {
              <div class="profile-panel">
                <div class="panel-section-title">STATUS CONTROL</div>
                <p class="status-hint">Change this user's account status. Actions are immediate.</p>
                <div class="status-actions">
                  @for (s of statusOptions; track s.value) {
                    <button
                      class="status-action-btn"
                      [class.active]="u.status === s.value"
                      [class]="'status-action-btn status-action-btn--' + s.value + (u.status === s.value ? ' active' : '')"
                      (click)="setStatus(u.id, s.value)">
                      <span>{{ s.icon }}</span>
                      {{ s.label }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Danger zone -->
            @if (isAdmin()) {
              <div class="profile-panel profile-panel--danger">
                <div class="panel-section-title danger-title">DANGER ZONE</div>
                <div class="danger-row">
                  <div>
                    <div class="danger-label">Delete account</div>
                    <div class="danger-sub">Permanently remove this user and all associated data.</div>
                  </div>
                  <button class="delete-btn" (click)="confirmDelete = true">DELETE</button>
                </div>
              </div>
            }

          </div>
        </div>
      </div>

      <!-- Delete modal -->
      @if (confirmDelete) {
        <div class="modal-overlay" (click)="confirmDelete = false">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-icon">⊗</div>
            <h3 class="modal-title">Delete {{ u.firstName }} {{ u.lastName }}?</h3>
            <p class="modal-msg">This action is permanent and cannot be undone.</p>
            <div class="modal-actions">
              <button class="modal-cancel" (click)="confirmDelete = false">Cancel</button>
              <button class="modal-confirm" (click)="onDelete(u.id)">Delete User</button>
            </div>
          </div>
        </div>
      }

    } @else {
      <!-- User not found -->
      <div class="not-found">
        <div class="nf-icon">◻</div>
        <div class="nf-title">User Not Found</div>
        <p class="nf-sub">The user with ID <code>{{ route.snapshot.params['id'] }}</code> does not exist.</p>
        <button class="hero-btn" routerLink="/users/list">← Back to list</button>
      </div>
    }
  `,
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userSvc = inject(UserService);
  route   = inject(ActivatedRoute);
  private router = inject(Router);

  user = signal<User | undefined>(undefined);
  confirmDelete = false;

  allPermissions = ['read', 'write', 'delete', 'admin'];

  statusOptions: { value: UserStatus; label: string; icon: string }[] = [
    { value: 'active',    label: 'Active',    icon: '◎' },
    { value: 'inactive',  label: 'Inactive',  icon: '○' },
    { value: 'pending',   label: 'Pending',   icon: '△' },
    { value: 'suspended', label: 'Suspended', icon: '⊘' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.user.set(this.userSvc.getUserById(id));
  }

  getProfileStats(u: User) {
    const rate = u.tasksAssigned
      ? Math.round(u.tasksCompleted / u.tasksAssigned * 100) : 0;
    return [
      { label: 'Tasks Assigned',  value: u.tasksAssigned,  color: 'var(--accent-cyan)'   },
      { label: 'Tasks Completed', value: u.tasksCompleted, color: 'var(--accent-green)'  },
      { label: 'Completion Rate', value: rate + '%',       color: 'var(--accent-purple)' },
      { label: 'Member Since',    value: u.joinedDate,     color: 'var(--text-secondary)' },
    ];
  }

  personalFields(u: User) {
    return [
      { label: 'Full Name',   value: `${u.firstName} ${u.lastName}` },
      { label: 'Email',       value: u.email },
      { label: 'Phone',       value: u.phone },
      { label: 'Department',  value: u.department },
      { label: 'Location',    value: u.location },
      { label: 'Joined',      value: u.joinedDate },
      { label: 'Last Active', value: u.lastActive },
    ];
  }

  isAdmin() {
    return this.userSvc.authUser()?.role === 'admin';
  }

  setStatus(id: string, status: UserStatus) {
    this.userSvc.updateStatus(id, status);
    this.user.set(this.userSvc.getUserById(id));
  }

  onDelete(id: string) {
    this.userSvc.deleteUser(id);
    this.router.navigate(['/users/list']);
  }
}
