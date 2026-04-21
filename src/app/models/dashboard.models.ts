// models/dashboard.models.ts

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tags: string[];
  progress: number; // 0-100
}

export interface StatWidget {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  change: number; // percent change
  trend: 'up' | 'down' | 'flat';
  color: 'cyan' | 'green' | 'amber' | 'red' | 'purple';
  icon: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
}
