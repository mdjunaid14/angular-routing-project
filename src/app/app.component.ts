// app.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from './services/dashboard.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { StatsWidgetComponent } from './components/stats-widget/stats-widget.component';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { NotificationPanelComponent } from './components/notification-panel/notification-panel.component';
import { TaskStatus } from './models/dashboard.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    StatsWidgetComponent,
    TaskCardComponent,
    NotificationPanelComponent,
  ],
  template: `
    <div class="app-shell">

      <!-- ① Sidebar — emits viewChanged @Output -->
      <app-sidebar (viewChanged)="onViewChanged($event)"></app-sidebar>

      <div class="main-column">

        <!-- ② Header — receives currentView @Input, emits events -->
        <app-header
          [currentView]="svc.activeView()"
          (notifToggled)="onNotifToggled()"
          (refreshed)="onRefresh()">
        </app-header>

        <!-- Main content -->
        <main class="content">

          <!-- Overview view -->
          @if (svc.activeView() === 'overview') {
            <div class="view" style="animation: fade-up 0.3s ease">

              <!-- Welcome bar -->
              <div class="welcome-bar">
                <div>
                  <div class="welcome-title">Good morning, <span class="accent">A. Reyes</span></div>
                  <div class="welcome-sub">{{ today }} · Sprint 22 · 12 days left</div>
                </div>
                <button class="add-task-btn" (click)="showAddTask = !showAddTask">
                  + NEW TASK
                </button>
              </div>

              <!-- Add task form — conditional with @if -->
              @if (showAddTask) {
                <div class="add-task-form">
                  <div class="form-row">
                    <input #titleInput type="text" placeholder="Task title..." class="form-input" />
                    <select #assigneeInput class="form-select">
                      <option value="A. Reyes">A. Reyes</option>
                      <option value="P. Chen">P. Chen</option>
                      <option value="J. Müller">J. Müller</option>
                      <option value="S. Patel">S. Patel</option>
                    </select>
                    <button class="btn-confirm" (click)="addTask(titleInput.value, assigneeInput.value); titleInput.value=''">
                      ADD
                    </button>
                    <button class="btn-cancel" (click)="showAddTask = false">CANCEL</button>
                  </div>
                </div>
              }

              <!-- ③ Stats Grid — @for over stats array, @Input to StatsWidget -->
              <div class="stats-grid">
                @for (stat of svc.stats(); track stat.id) {
                  <app-stats-widget
                    [stat]="stat"
                    (clicked)="onStatClicked($event.label)">
                  </app-stats-widget>
                }
              </div>

              <!-- Tasks section -->
              <div class="section-header">
                <span class="section-title">ACTIVE TASKS</span>
                <div class="filter-tabs">
                  @for (f of filters; track f) {
                    <button class="filter-tab"
                      [class.active]="activeFilter === f"
                      (click)="activeFilter = f">
                      {{ f | uppercase }}
                    </button>
                  }
                </div>
              </div>

              <!-- ④ Task list — @for with filtering, TaskCard @Input/@Output -->
              <div class="tasks-grid">
                @for (task of filteredTasks(); track task.id) {
                  <app-task-card
                    [task]="task"
                    [expanded]="expandedTaskId === task.id"
                    (statusChanged)="onStatusChanged($event)"
                    (cardClicked)="onCardClicked($event.id)">
                  </app-task-card>
                } @empty {
                  <div class="empty-state">
                    <span>◻</span>
                    <p>No tasks for this filter.</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Tasks view — uses ng-container for layout switch -->
          @if (svc.activeView() === 'tasks') {
            <div class="view" style="animation: fade-up 0.3s ease">
              <div class="section-header">
                <span class="section-title">ALL TASKS — BOARD VIEW</span>
              </div>
              <div class="kanban-board">
                @for (col of kanbanCols; track col.status) {
                  <div class="kanban-col">
                    <div class="kanban-col-header" [class]="'kanban-col-header--' + col.status">
                      <span>{{ col.label }}</span>
                      <span class="col-count">{{ getTasksByStatus(col.status).length }}</span>
                    </div>
                    <div class="kanban-cards">
                      @for (task of getTasksByStatus(col.status); track task.id) {
                        <app-task-card
                          [task]="task"
                          [expanded]="false"
                          (statusChanged)="onStatusChanged($event)">
                        </app-task-card>
                      }
                      @if (getTasksByStatus(col.status).length === 0) {
                        <ng-container>
                          <div class="kanban-empty">No tasks</div>
                        </ng-container>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Analytics / Deployments placeholder views -->
          @if (svc.activeView() === 'analytics' || svc.activeView() === 'deployments') {
            <div class="view placeholder-view" style="animation: fade-up 0.3s ease">
              <div class="placeholder-icon">{{ svc.activeView() === 'analytics' ? '∿' : '⬆' }}</div>
              <div class="placeholder-title">{{ svc.activeView() | uppercase }}</div>
              <div class="placeholder-sub">This module is under construction. Use Overview or Tasks.</div>
            </div>
          }

        </main>
      </div>
    </div>

    <!-- Notification Panel — conditionally rendered with @if -->
    @if (svc.notificationPanelOpen()) {
      <app-notification-panel (closed)="svc.toggleNotificationPanel()">
      </app-notification-panel>
    }
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  svc = inject(DashboardService);

  showAddTask = false;
  expandedTaskId: string | null = null;
  activeFilter = 'all';
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  filters = ['all', 'in-progress', 'todo', 'done', 'blocked'];

  kanbanCols = [
    { status: 'todo' as TaskStatus,        label: 'TODO' },
    { status: 'in-progress' as TaskStatus, label: 'IN PROGRESS' },
    { status: 'done' as TaskStatus,        label: 'DONE' },
    { status: 'blocked' as TaskStatus,     label: 'BLOCKED' },
  ];

  filteredTasks() {
    const tasks = this.svc.tasks();
    if (this.activeFilter === 'all') return tasks;
    return tasks.filter(t => t.status === this.activeFilter);
  }

  getTasksByStatus(status: TaskStatus) {
    return this.svc.tasks().filter(t => t.status === status);
  }

  onViewChanged(view: string) {
    console.log('View changed to:', view);
  }

  onNotifToggled() {
    console.log('Notification panel toggled');
  }

  onRefresh() {
    console.log('Dashboard refreshed');
  }

  onStatClicked(label: string) {
    console.log('Stat clicked:', label);
  }

  onStatusChanged(event: { id: string; status: TaskStatus }) {
    this.svc.updateTaskStatus(event.id, event.status);
  }

  onCardClicked(id: string) {
    this.expandedTaskId = this.expandedTaskId === id ? null : id;
  }

  addTask(title: string, assignee: string) {
    if (!title.trim()) return;
    this.svc.addTask({
      id: 't' + Date.now(),
      title: title.trim(),
      description: 'Added manually from dashboard.',
      status: 'todo',
      priority: 'medium',
      assignee,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      tags: ['new'],
      progress: 0
    });
    this.showAddTask = false;
  }
}
