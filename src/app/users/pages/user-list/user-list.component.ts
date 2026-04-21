// users/pages/user-list/user-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { RoleBadgeComponent } from '../../components/role-badge/role-badge.component';
import { User, UserRole, UserStatus } from '../../models/user.models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, UserCardComponent, RoleBadgeComponent],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">User Directory</h1>
          <p class="page-sub">{{ filteredUsers().length }} of {{ userSvc.users().length }} users</p>
        </div>
        <button class="cta-btn" routerLink="/users/create">+ ADD USER</button>
      </div>

      <!-- Filters bar -->
      <div class="filters-bar" [formGroup]="filterForm">
        <div class="search-wrap">
          <span class="search-icon-lbl">⌕</span>
          <input
            formControlName="search"
            type="text"
            class="search-input"
            placeholder="Search name, email, department...">
          @if (filterForm.value.search) {
            <button class="clear-btn" (click)="filterForm.patchValue({search:''})">✕</button>
          }
        </div>

        <select formControlName="role" class="filter-select">
          <option value="all">All Roles</option>
          @for (r of roles; track r) {
            <option [value]="r">{{ r | titlecase }}</option>
          }
        </select>

        <select formControlName="status" class="filter-select">
          <option value="all">All Statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s | titlecase }}</option>
          }
        </select>

        <!-- View toggle -->
        <div class="view-toggle">
          <button class="view-btn" [class.active]="viewMode === 'list'"   (click)="setView('list')">≡</button>
          <button class="view-btn" [class.active]="viewMode === 'grid'"   (click)="setView('grid')">⊞</button>
        </div>
      </div>

      <!-- Active filters summary -->
      @if (hasActiveFilters()) {
        <div class="active-filters">
          <span class="filter-tag-label">FILTERS:</span>
          @if (filterForm.value.search) {
            <span class="filter-tag">search: "{{ filterForm.value.search }}" <button (click)="filterForm.patchValue({search:''})">✕</button></span>
          }
          @if (filterForm.value.role !== 'all') {
            <span class="filter-tag">role: {{ filterForm.value.role }} <button (click)="filterForm.patchValue({role:'all'})">✕</button></span>
          }
          @if (filterForm.value.status !== 'all') {
            <span class="filter-tag">status: {{ filterForm.value.status }} <button (click)="filterForm.patchValue({status:'all'})">✕</button></span>
          }
          <button class="clear-all-btn" (click)="clearFilters()">Clear all</button>
        </div>
      }

      <!-- User list / grid -->
      @if (filteredUsers().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">◻</span>
          <p class="empty-title">No users match your filters</p>
          <button class="cta-btn-outline" (click)="clearFilters()">Clear filters</button>
        </div>
      } @else {
        <!-- List view -->
        @if (viewMode === 'list') {
          <div class="user-list">
            @for (user of filteredUsers(); track user.id; let i = $index) {
              <div class="list-row" [style.animation-delay]="i * 0.04 + 's'">
                <app-user-card [user]="user" (deleteClicked)="onDelete($event)"></app-user-card>
              </div>
            }
          </div>
        }

        <!-- Grid view -->
        @if (viewMode === 'grid') {
          <div class="user-grid">
            @for (user of filteredUsers(); track user.id; let i = $index) {
              <div class="grid-card" [style.animation-delay]="i * 0.05 + 's'">
                <!-- Avatar -->
                <div class="gc-avatar" [style.border-color]="user.avatarColor + '55'">
                  <span [style.color]="user.avatarColor">{{ user.avatarInitials }}</span>
                  <span class="gc-status" [class]="'gc-status--' + user.status"></span>
                </div>
                <div class="gc-name">{{ user.firstName }} {{ user.lastName }}</div>
                <div class="gc-email">{{ user.email }}</div>
                <div class="gc-dept">{{ user.department }}</div>
                <div class="gc-badges">
                  <app-role-badge [role]="user.role" type="role"></app-role-badge>
                  <app-role-badge [status]="user.status" type="status"></app-role-badge>
                </div>
                <div class="gc-actions">
                  <button class="action-btn" [routerLink]="['/users/profile', user.id]">View</button>
                  <button class="action-btn" [routerLink]="['/users/edit', user.id]">Edit</button>
                  <button class="action-btn action-btn--danger" (click)="onDelete(user.id)">Del</button>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Delete confirmation modal -->
    @if (deleteTargetId) {
      <div class="modal-overlay" (click)="deleteTargetId = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-icon">⊗</div>
          <h3 class="modal-title">Delete User</h3>
          <p class="modal-msg">This action cannot be undone. The user and all their data will be permanently removed.</p>
          <div class="modal-actions">
            <button class="modal-cancel" (click)="deleteTargetId = null">Cancel</button>
            <button class="modal-confirm" (click)="confirmDelete()">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  userSvc = inject(UserService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  viewMode: 'list' | 'grid' = 'list';
  deleteTargetId: string | null = null;

  roles: UserRole[]     = ['admin', 'developer', 'designer', 'manager', 'viewer'];
  statuses: UserStatus[] = ['active', 'inactive', 'pending', 'suspended'];

  filterForm = this.fb.group({
    search: [''],
    role:   ['all'],
    status: ['all'],
  });

  ngOnInit() {
    // Restore filters from query params
    const p = this.route.snapshot.queryParams;
    if (p['search'] || p['role'] || p['status']) {
      this.filterForm.patchValue({
        search: p['search'] || '',
        role:   p['role']   || 'all',
        status: p['status'] || 'all',
      });
    }

    // Sync query params on change
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(v => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          search: v.search || null,
          role:   v.role !== 'all'    ? v.role   : null,
          status: v.status !== 'all'  ? v.status : null,
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  filteredUsers(): User[] {
    const { search, role, status } = this.filterForm.value;
    return this.userSvc.getFilteredUsers(search ?? '', role ?? 'all', status ?? 'all');
  }

  hasActiveFilters(): boolean {
    const v = this.filterForm.value;
    return !!(v.search || (v.role && v.role !== 'all') || (v.status && v.status !== 'all'));
  }

  clearFilters() {
    this.filterForm.reset({ search: '', role: 'all', status: 'all' });
  }

  setView(mode: 'list' | 'grid') {
    this.viewMode = mode;
  }

  onDelete(id: string) {
    this.deleteTargetId = id;
  }

  confirmDelete() {
    if (this.deleteTargetId) {
      this.userSvc.deleteUser(this.deleteTargetId);
      this.deleteTargetId = null;
    }
  }
}
