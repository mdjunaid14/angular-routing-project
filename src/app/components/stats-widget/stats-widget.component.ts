// components/stats-widget/stats-widget.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatWidget } from '../../models/dashboard.models';

@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="'stat-card--' + stat.color" (click)="clicked.emit(stat)">
      <div class="stat-header">
        <span class="stat-icon">{{ stat.icon }}</span>
        <span class="stat-trend" [class.trend-up]="stat.trend === 'up'" [class.trend-down]="stat.trend === 'down'">
          {{ stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→' }}
          {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
        </span>
      </div>

      <div class="stat-value-row">
        <span class="stat-value">{{ stat.value }}</span>
        @if (stat.unit) {
          <span class="stat-unit">{{ stat.unit }}</span>
        }
      </div>

      <div class="stat-label">{{ stat.label | uppercase }}</div>

      <!-- Progress bar — shown only for percentage stats -->
      @if (stat.unit === '%') {
        <div class="stat-bar">
          <div class="stat-bar-fill" [style.width.%]="stat.value"></div>
        </div>
      } @else {
        <ng-container>
          <div class="stat-dots">
            @for (dot of getDots(); track $index) {
              <span class="dot" [class.dot-active]="dot"></span>
            }
          </div>
        </ng-container>
      }
    </div>
  `,
  styleUrls: ['./stats-widget.component.css']
})
export class StatsWidgetComponent {
  @Input() stat!: StatWidget;
  @Output() clicked = new EventEmitter<StatWidget>();

  getDots(): boolean[] {
    const val = typeof this.stat.value === 'number' ? this.stat.value : 0;
    return Array.from({ length: 8 }, (_, i) => i < val);
  }
}
