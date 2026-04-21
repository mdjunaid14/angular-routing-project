// components/task-card/task-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/dashboard.models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-card" [class]="'task-card--' + task.status">

      <!-- Top Row -->
      <div class="task-top">
        <span class="task-id">#{{ task.id }}</span>
        <span class="badge" [class]="'badge-' + getPriorityColor(task.priority)">
          {{ task.priority }}
        </span>
      </div>

      <!-- Title & Description -->
      <h3 class="task-title">{{ task.title }}</h3>

      @if (expanded) {
        <p class="task-desc">{{ task.description }}</p>
      }

      <!-- Tags -->
      <div class="task-tags">
        @for (tag of task.tags; track tag) {
          <span class="tag">{{ tag }}</span>
        }
      </div>

      <!-- Progress -->
      @if (task.status !== 'todo') {
        <div class="task-progress">
          <div class="progress-bar">
            <div class="progress-fill"
              [style.width.%]="task.progress"
              [class]="'progress-fill--' + task.status">
            </div>
          </div>
          <span class="progress-pct">{{ task.progress }}%</span>
        </div>
      }

      <!-- Footer -->
      <div class="task-footer">
        <div class="task-meta">
          <span class="assignee-avatar">{{ getInitials(task.assignee) }}</span>
          <span class="task-due" [class.overdue]="isOverdue(task.dueDate)">
            {{ task.dueDate }}
          </span>
        </div>

        <!-- Status selector using ng-template for different states -->
        <ng-container [ngTemplateOutlet]="statusTemplate"
                      [ngTemplateOutletContext]="{ $implicit: task.status }">
        </ng-container>
      </div>
    </div>

    <!-- Status display template -->
    <ng-template #statusTemplate let-status>
      <div class="status-badge status-badge--{{ status }}" (click)="cycleStatus()">
        <span class="status-dot-sm"></span>
        {{ status | uppercase }}
      </div>
    </ng-template>
  `,
  styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() expanded = false;
  @Output() statusChanged = new EventEmitter<{ id: string; status: TaskStatus }>();
  @Output() cardClicked = new EventEmitter<Task>();

  statuses: TaskStatus[] = ['todo', 'in-progress', 'done', 'blocked'];

  getPriorityColor(p: string): string {
    return { low: 'cyan', medium: 'amber', high: 'amber', critical: 'red' }[p] ?? 'cyan';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date() && this.task.status !== 'done';
  }

  cycleStatus() {
    const i = this.statuses.indexOf(this.task.status);
    const next = this.statuses[(i + 1) % this.statuses.length];
    this.statusChanged.emit({ id: this.task.id, status: next });
  }
}
