// components/header/header.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <div class="breadcrumb">
          <span class="breadcrumb-root">nexus</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ currentView | uppercase }}</span>
        </div>
        <div class="header-time">{{ currentTime }}</div>
      </div>

      <div class="header-center">
        <div class="search-bar">
          <span class="search-icon">⌕</span>
          <input type="text" placeholder="Search tasks, deployments..." class="search-input" />
          <span class="search-kbd">⌘K</span>
        </div>
      </div>

      <div class="header-right">
        <!-- System Status Pill -->
        <div class="status-pill">
          <span class="status-dot green"></span>
          <span>ALL SYSTEMS</span>
        </div>

        <!-- Notifications Bell -->
        <button class="icon-btn" (click)="onNotifClick()" [class.has-alert]="unreadCount() > 0">
          <span class="icon-btn-symbol">⌥</span>
          @if (unreadCount() > 0) {
            <span class="notif-count">{{ unreadCount() }}</span>
          }
        </button>

        <!-- Refresh -->
        <button class="icon-btn" (click)="onRefresh()">
          <span class="icon-btn-symbol" [class.spinning]="isRefreshing">↻</span>
        </button>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private svc = inject(DashboardService);

  @Input() currentView: string = 'overview';
  @Output() notifToggled = new EventEmitter<void>();
  @Output() refreshed = new EventEmitter<void>();

  unreadCount = this.svc.unreadCount;
  isRefreshing = false;
  currentTime = '';

  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  onNotifClick() {
    this.svc.toggleNotificationPanel();
    this.notifToggled.emit();
  }

  onRefresh() {
    this.isRefreshing = true;
    this.refreshed.emit();
    setTimeout(() => this.isRefreshing = false, 1000);
  }
}
