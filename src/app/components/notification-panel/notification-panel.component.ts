// components/notification-panel/notification-panel.component.ts
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { Notification } from '../../models/dashboard.models';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-overlay" (click)="onOverlayClick($event)">
      <div class="notif-panel">
        <!-- Header -->
        <div class="notif-header">
          <div class="notif-title">
            <span>ALERTS</span>
            @if (svc.unreadCount() > 0) {
              <span class="unread-pill">{{ svc.unreadCount() }} new</span>
            }
          </div>
          <div class="notif-actions">
            @if (svc.unreadCount() > 0) {
              <button class="mark-all-btn" (click)="svc.markAllRead()">Mark all read</button>
            }
            <button class="close-btn" (click)="closed.emit()">✕</button>
          </div>
        </div>

        <!-- List -->
        <div class="notif-list">
          @if (svc.notifications().length === 0) {
            <div class="notif-empty">
              <span>⬡</span>
              <p>No notifications</p>
            </div>
          } @else {
            @for (notif of svc.notifications(); track notif.id) {
              <div
                class="notif-item"
                [class.unread]="!notif.read"
                [class]="'notif-item notif-item--' + notif.type + (!notif.read ? ' unread' : '')"
                (click)="svc.markNotificationRead(notif.id)"
              >
                <!-- Type icon via ng-template -->
                <ng-container [ngTemplateOutlet]="iconTpl"
                              [ngTemplateOutletContext]="{ type: notif.type }">
                </ng-container>

                <div class="notif-content">
                  <div class="notif-item-title">{{ notif.title }}</div>
                  <div class="notif-message">{{ notif.message }}</div>
                  <div class="notif-time">{{ getRelativeTime(notif.timestamp) }}</div>
                </div>

                @if (!notif.read) {
                  <span class="unread-dot"></span>
                }
              </div>
            }
          }
        </div>

        <!-- Footer -->
        <div class="notif-footer">
          <span class="notif-count-text">{{ svc.notifications().length }} total alerts</span>
        </div>
      </div>
    </div>

    <!-- Icon template -->
    <ng-template #iconTpl let-type="type">
      <div class="notif-icon notif-icon--{{ type }}">
        @if (type === 'error') { <span>⊘</span> }
        @else if (type === 'warning') { <span>△</span> }
        @else if (type === 'success') { <span>✓</span> }
        @else { <span>ℹ</span> }
      </div>
    </ng-template>
  `,
  styleUrls: ['./notification-panel.component.css']
})
export class NotificationPanelComponent {
  svc = inject(DashboardService);
  @Output() closed = new EventEmitter<void>();

  onOverlayClick(e: MouseEvent) {
    if ((e.target as Element).classList.contains('notif-overlay')) {
      this.closed.emit();
    }
  }

  getRelativeTime(date: Date): string {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return `${Math.round(diff)}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    return `${Math.round(diff / 3600)}h ago`;
  }
}
