// components/sidebar/sidebar.component.ts
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { NavItem } from '../../models/dashboard.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <span class="logo-mark">N</span>
        <span class="logo-text">NEXUS</span>
        <span class="logo-tag">v2.4</span>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <span class="nav-section-label">WORKSPACE</span>
        <ul>
          @for (item of navItems; track item.id) {
            <li
              class="nav-item"
              [class.active]="item.id === activeView()"
              (click)="onNavClick(item)"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
              @if (item.badge && item.badge > 0) {
                <span class="nav-badge">{{ item.badge }}</span>
              }
            </li>
          }
        </ul>

        <span class="nav-section-label" style="margin-top:20px">MODULES</span>
        <ul>
          <li class="nav-item nav-item--module">
            <a routerLink="/users/dashboard" class="nav-module-link">
              <span class="nav-icon">◈</span>
              <span class="nav-label">User Mgmt</span>
              <span class="nav-module-arrow">→</span>
            </a>
          </li>
        </ul>

        <span class="nav-section-label" style="margin-top:20px">SYSTEM</span>
        <ul>
          @for (item of systemItems; track item.id) {
            <li class="nav-item" (click)="onNavClick(item)">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </li>
          }
        </ul>
      </nav>

      <!-- User -->
      <div class="sidebar-user">
        <div class="user-avatar">AR</div>
        <div class="user-info">
          <div class="user-name">Junaid</div>
          <div class="user-role">Admin</div>
        </div>
        <span class="user-status-dot"></span>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private svc = inject(DashboardService);
  activeView = this.svc.activeView;

  @Output() viewChanged = new EventEmitter<string>();

  navItems: NavItem[] = [
    { id: 'overview',    label: 'Overview',    icon: '⬡', active: true  },
    { id: 'tasks',       label: 'Tasks',       icon: '◫', active: false, badge: 3 },
    { id: 'analytics',   label: 'Analytics',   icon: '∿', active: false },
    { id: 'deployments', label: 'Deployments', icon: '⬆', active: false },
  ];

  systemItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: '⚙', active: false },
    { id: 'docs',     label: 'Docs',     icon: '⊞', active: false },
  ];

  onNavClick(item: NavItem) {
    this.svc.setActiveView(item.id);
    this.viewChanged.emit(item.id);
  }
}
