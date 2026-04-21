// services/dashboard.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Task, StatWidget, Notification, TaskStatus } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  // ── Signals (shared reactive state) ──────────────────────────────────────
  private _tasks = signal<Task[]>([
    {
      id: 't1', title: 'API Gateway Migration', description: 'Migrate legacy endpoints to new GraphQL gateway',
      status: 'in-progress', priority: 'critical', assignee: 'Junaid', dueDate: '2026-04-18',
      tags: ['backend', 'infra'], progress: 64
    },
    {
      id: 't2', title: 'Design System Tokens', description: 'Establish global color / spacing tokens in Figma',
      status: 'done', priority: 'medium', assignee: 'P. Chen', dueDate: '2026-04-10',
      tags: ['design', 'ui'], progress: 100
    },
    {
      id: 't3', title: 'Auth Service Hardening', description: 'Add MFA support and session rotation',
      status: 'todo', priority: 'high', assignee: 'J. Müller', dueDate: '2026-04-25',
      tags: ['security'], progress: 0
    },
    {
      id: 't4', title: 'Real-time Analytics Pipeline', description: 'Kafka → ClickHouse ingestion for event data',
      status: 'in-progress', priority: 'high', assignee: 'S. Patel', dueDate: '2026-04-22',
      tags: ['data', 'backend'], progress: 38
    },
    {
      id: 't5', title: 'Mobile PWA Audit', description: 'Lighthouse performance and a11y audit on all routes',
      status: 'blocked', priority: 'medium', assignee: 'L. Nakamura', dueDate: '2026-04-30',
      tags: ['frontend', 'mobile'], progress: 20
    },
    {
      id: 't6', title: 'Terraform State Refactor', description: 'Split monolithic state into per-service workspaces',
      status: 'todo', priority: 'low', assignee: 'Junaid', dueDate: '2026-05-05',
      tags: ['infra', 'devops'], progress: 0
    },
  ]);

  private _notifications = signal<Notification[]>([
    { id: 'n1', type: 'error', title: 'Deploy Failed', message: 'prod-api-v2.3.1 rollback initiated', timestamp: new Date(Date.now() - 3 * 60000), read: false },
    { id: 'n2', type: 'warning', title: 'High Memory Usage', message: 'Node cluster-04 at 91% RAM', timestamp: new Date(Date.now() - 12 * 60000), read: false },
    { id: 'n3', type: 'success', title: 'Migration Complete', message: 'DB shard rebalance finished in 4m 12s', timestamp: new Date(Date.now() - 28 * 60000), read: true },
    { id: 'n4', type: 'info', title: 'New PR Opened', message: 'J. Müller opened #841: "Add PKCE flow"', timestamp: new Date(Date.now() - 45 * 60000), read: true },
    { id: 'n5', type: 'warning', title: 'SSL Cert Expiry', message: 'api.nexus.io expires in 12 days', timestamp: new Date(Date.now() - 2 * 3600000), read: false },
  ]);

  private _activeView = signal<string>('overview');
  private _notificationPanelOpen = signal<boolean>(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  tasks = this._tasks.asReadonly();
  notifications = this._notifications.asReadonly();
  activeView = this._activeView.asReadonly();
  notificationPanelOpen = this._notificationPanelOpen.asReadonly();

  unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  stats = computed<StatWidget[]>(() => {
    const tasks = this._tasks();
    const done = tasks.filter(t => t.status === 'done').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    return [
      { id: 's1', label: 'Tasks Complete', value: done, unit: `/ ${tasks.length}`, change: 12, trend: 'up', color: 'green', icon: '✓' },
      { id: 's2', label: 'Avg. Progress', value: Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length) , unit: '%', change: 5, trend: 'up', color: 'cyan', icon: '◎' },
      { id: 's3', label: 'Blocked Tasks', value: blocked, unit: '', change: -2, trend: 'down', color: 'red', icon: '⊘' },
      { id: 's4', label: 'Unread Alerts', value: this.unreadCount(), unit: '', change: 3, trend: 'up', color: 'amber', icon: '△' },
    ];
  });

  // ── Actions ───────────────────────────────────────────────────────────────
  setActiveView(view: string) {
    this._activeView.set(view);
  }

  toggleNotificationPanel() {
    this._notificationPanelOpen.update(v => !v);
  }

  markNotificationRead(id: string) {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead() {
    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  updateTaskStatus(taskId: string, status: TaskStatus) {
    this._tasks.update(list =>
      list.map(t => t.id === taskId
        ? { ...t, status, progress: status === 'done' ? 100 : t.progress }
        : t
      )
    );
  }

  addTask(task: Task) {
    this._tasks.update(list => [task, ...list]);
  }

  getTasksByStatus(status: TaskStatus) {
    return computed(() => this._tasks().filter(t => t.status === status));
  }
}
