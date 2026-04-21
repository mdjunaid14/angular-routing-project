// users/components/role-badge/role-badge.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRole, UserStatus } from '../../models/user.models';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'role') {
      <span class="badge role-{{ role }}">
        <span class="badge-dot"></span>{{ role }}
      </span>
    } @else {
      <span class="badge status-{{ status }}">
        <span class="badge-dot"></span>{{ status }}
      </span>
    }
  `,
  styles: [`
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: 3px;
      font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase; font-family: var(--font-mono);
      border: 1px solid;
    }
    .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

    /* Roles */
    .role-admin     { color: #ff3860; background: rgba(255,56,96,.1);   border-color: rgba(255,56,96,.25); }
    .role-developer { color: #00e5ff; background: rgba(0,229,255,.08);  border-color: rgba(0,229,255,.2); }
    .role-designer  { color: #bf5af2; background: rgba(191,90,242,.1);  border-color: rgba(191,90,242,.25); }
    .role-manager   { color: #ffb700; background: rgba(255,183,0,.1);   border-color: rgba(255,183,0,.25); }
    .role-viewer    { color: #7a8aa0; background: rgba(122,138,160,.1); border-color: rgba(122,138,160,.2); }

    /* Statuses */
    .status-active    { color: #39ff14; background: rgba(57,255,20,.08);  border-color: rgba(57,255,20,.2); }
    .status-inactive  { color: #7a8aa0; background: rgba(122,138,160,.1); border-color: rgba(122,138,160,.2); }
    .status-pending   { color: #ffb700; background: rgba(255,183,0,.1);   border-color: rgba(255,183,0,.25); }
    .status-suspended { color: #ff3860; background: rgba(255,56,96,.1);   border-color: rgba(255,56,96,.25); }
  `]
})
export class RoleBadgeComponent {
  @Input() role: UserRole = 'viewer';
  @Input() status: UserStatus = 'active';
  @Input() type: 'role' | 'status' = 'role';
}
