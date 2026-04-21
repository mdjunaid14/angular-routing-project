// users/pages/dashboard/user-dashboard.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { RoleBadgeComponent } from '../../components/role-badge/role-badge.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, UserCardComponent, RoleBadgeComponent],
  template: `
    <div class="page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">User Dashboard</h1>
          <p class="page-sub">Overview of all team members and activity</p>
        </div>
        <button class="cta-btn" routerLink="/users/create">+ ADD USER</button>
      </div>

      <!-- Stats Row -->
      <div class="ud-stats-grid">
        @for (stat of statCards; track stat.label) {
          <div class="ud-stat-card" [class]="'ud-stat-card--' + stat.color">
            <div class="ud-stat-icon">{{ stat.icon }}</div>
            <div class="ud-stat-val">{{ stat.value }}</div>
            <div class="ud-stat-label">{{ stat.label }}</div>
          </div>
        }
      </div>

      <!-- Two-column layout -->
      <div class="ud-grid">

        <!-- Recent users -->
        <div class="ud-panel">
          <div class="panel-header">
            <span class="panel-title">RECENT USERS</span>
            <a class="panel-link" routerLink="/users/list">View all →</a>
          </div>
          <div class="recent-list">
            @for (user of recentUsers(); track user.id) {
              <app-user-card [user]="user" [compact]="true"></app-user-card>
            } @empty {
              <div class="empty">No users found.</div>
            }
          </div>
        </div>

        <!-- Role distribution -->
        <div class="ud-panel">
          <div class="panel-header">
            <span class="panel-title">ROLE BREAKDOWN</span>
          </div>
          <div class="role-breakdown">
            @for (role of roleBreakdown(); track role.name) {
              <div class="role-row">
                <app-role-badge [role]="role.name" type="role"></app-role-badge>
                <div class="role-bar-wrap">
                  <div class="role-bar">
                    <div class="role-bar-fill" [style.width.%]="role.pct" [style.background]="role.color"></div>
                  </div>
                  <span class="role-count">{{ role.count }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Status breakdown -->
          <div class="panel-header" style="margin-top: 24px">
            <span class="panel-title">STATUS BREAKDOWN</span>
          </div>
          <div class="status-grid">
            @for (s of statusBreakdown(); track s.label) {
              <div class="status-item" [class]="'status-item--' + s.status">
                <span class="status-count">{{ s.count }}</span>
                <app-role-badge [status]="s.status" type="status"></app-role-badge>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- Department table -->
      <div class="ud-panel" style="margin-top: 16px">
        <div class="panel-header">
          <span class="panel-title">BY DEPARTMENT</span>
        </div>
        <table class="dept-table">
          <thead>
            <tr>
              <th>DEPARTMENT</th>
              <th>MEMBERS</th>
              <th>TASKS DONE</th>
              <th>COMPLETION</th>
            </tr>
          </thead>
          <tbody>
            @for (dept of deptStats(); track dept.name) {
              <tr>
                <td class="dept-name">{{ dept.name }}</td>
                <td class="dept-count">{{ dept.members }}</td>
                <td class="dept-tasks">{{ dept.done }} / {{ dept.total }}</td>
                <td>
                  <div class="mini-bar">
                    <div class="mini-bar-fill" [style.width.%]="dept.pct"></div>
                    <span class="mini-bar-pct">{{ dept.pct }}%</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `,
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent {
  private userSvc = inject(UserService);

  get stats() { return this.userSvc.userStats(); }

  statCards = [
    { label: 'Total Users',     value: this.stats.total,     icon: '◈', color: 'purple' },
    { label: 'Active',          value: this.stats.active,    icon: '◎', color: 'green'  },
    { label: 'Pending',         value: this.stats.pending,   icon: '△', color: 'amber'  },
    { label: 'Suspended',       value: this.stats.suspended, icon: '⊘', color: 'red'    },
  ];

  recentUsers() {
    return [...this.userSvc.users()].slice(0, 5);
  }

  roleBreakdown() {
    const users = this.userSvc.users();
    const roles = ['admin', 'developer', 'designer', 'manager', 'viewer'] as const;
    const colors: Record<string, string> = {
      admin: '#ff3860', developer: '#00e5ff', designer: '#bf5af2', manager: '#ffb700', viewer: '#7a8aa0'
    };
    return roles.map(r => ({
      name: r,
      count: users.filter(u => u.role === r).length,
      pct: Math.round(users.filter(u => u.role === r).length / users.length * 100),
      color: colors[r]
    })).filter(r => r.count > 0);
  }

  statusBreakdown() {
    const users = this.userSvc.users();
    return (['active','inactive','pending','suspended'] as const).map(s => ({
      status: s,
      label: s,
      count: users.filter(u => u.status === s).length
    }));
  }

  deptStats() {
    const users = this.userSvc.users();
    const depts = [...new Set(users.map(u => u.department))];
    return depts.map(d => {
      const members = users.filter(u => u.department === d);
      const done  = members.reduce((a, u) => a + u.tasksCompleted, 0);
      const total = members.reduce((a, u) => a + u.tasksAssigned, 0);
      return { name: d, members: members.length, done, total, pct: total ? Math.round(done/total*100) : 0 };
    }).sort((a,b) => b.members - a.members);
  }
}
