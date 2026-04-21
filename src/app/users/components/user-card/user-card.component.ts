// users/components/user-card/user-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../models/user.models';
import { RoleBadgeComponent } from '../role-badge/role-badge.component';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule, RoleBadgeComponent],
  template: `
    <div class="user-card" [class.user-card--compact]="compact">
      <!-- Avatar -->
      <div class="user-card-avatar" [style.border-color]="user.avatarColor + '44'">
        <span [style.color]="user.avatarColor">{{ user.avatarInitials }}</span>
        <span class="avatar-status" [class]="'avatar-status--' + user.status"></span>
      </div>

      <!-- Info -->
      <div class="user-card-info">
        <div class="user-card-name">{{ user.firstName }} {{ user.lastName }}</div>
        <div class="user-card-email">{{ user.email }}</div>

        @if (!compact) {
          <div class="user-card-meta">
            <span class="meta-item">{{ user.department }}</span>
            <span class="meta-sep">·</span>
            <span class="meta-item">{{ user.location }}</span>
          </div>
        }
      </div>

      <!-- Badges -->
      <div class="user-card-badges">
        <app-role-badge [role]="user.role" type="role"></app-role-badge>
        @if (!compact) {
          <app-role-badge [status]="user.status" type="status"></app-role-badge>
        }
      </div>

      <!-- Stats (full view only) -->
      @if (!compact) {
        <div class="user-card-stats">
          <div class="user-stat">
            <span class="user-stat-val">{{ user.tasksCompleted }}</span>
            <span class="user-stat-lbl">Done</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-val">{{ user.tasksAssigned }}</span>
            <span class="user-stat-lbl">Total</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-val">{{ getCompletionRate() }}%</span>
            <span class="user-stat-lbl">Rate</span>
          </div>
        </div>
      }

      <!-- Actions -->
      <div class="user-card-actions">
        <button class="action-btn" [routerLink]="['/users/profile', user.id]" title="View profile">⊙</button>
        <button class="action-btn" [routerLink]="['/users/edit', user.id]" title="Edit user">✎</button>
        <button class="action-btn action-btn--danger" (click)="deleteClicked.emit(user.id)" title="Delete">⊗</button>
      </div>
    </div>
  `,
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() compact = false;
  @Output() deleteClicked = new EventEmitter<string>();

  getCompletionRate(): number {
    if (!this.user.tasksAssigned) return 0;
    return Math.round((this.user.tasksCompleted / this.user.tasksAssigned) * 100);
  }
}
