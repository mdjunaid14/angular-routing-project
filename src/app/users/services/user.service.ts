// users/services/user.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole, UserStatus } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {

  private _users = signal<User[]>([
    {
      id: 'u1', firstName: 'Andrés', lastName: 'Reyes', email: 'a.reyes@nexus.io',
      role: 'admin', status: 'active', department: 'Engineering', location: 'Madrid, ES',
      phone: '+34 612 345 678', bio: 'Full-stack engineer and platform lead. Obsessed with clean architecture and observability.',
      avatarInitials: 'AR', avatarColor: '#00e5ff', joinedDate: '2022-03-14',
      lastActive: '2026-04-20', tasksAssigned: 24, tasksCompleted: 18,
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: 'u2', firstName: 'Priya', lastName: 'Chen', email: 'p.chen@nexus.io',
      role: 'designer', status: 'active', department: 'Design', location: 'Singapore, SG',
      phone: '+65 8123 4567', bio: 'Product designer with a background in cognitive psychology. Loves design systems.',
      avatarInitials: 'PC', avatarColor: '#bf5af2', joinedDate: '2022-07-01',
      lastActive: '2026-04-19', tasksAssigned: 15, tasksCompleted: 15,
      permissions: ['read', 'write']
    },
    {
      id: 'u3', firstName: 'Jonas', lastName: 'Müller', email: 'j.muller@nexus.io',
      role: 'developer', status: 'active', department: 'Security', location: 'Berlin, DE',
      phone: '+49 170 1234567', bio: 'Security-focused backend engineer. Former pentester, now building defences.',
      avatarInitials: 'JM', avatarColor: '#39ff14', joinedDate: '2023-01-09',
      lastActive: '2026-04-18', tasksAssigned: 19, tasksCompleted: 11,
      permissions: ['read', 'write']
    },
    {
      id: 'u4', firstName: 'Sana', lastName: 'Patel', email: 's.patel@nexus.io',
      role: 'developer', status: 'active', department: 'Data', location: 'Mumbai, IN',
      phone: '+91 98765 43210', bio: 'Data pipeline architect. Kafka enthusiast and ClickHouse advocate.',
      avatarInitials: 'SP', avatarColor: '#ffb700', joinedDate: '2023-04-17',
      lastActive: '2026-04-20', tasksAssigned: 12, tasksCompleted: 6,
      permissions: ['read', 'write']
    },
    {
      id: 'u5', firstName: 'Lena', lastName: 'Nakamura', email: 'l.nakamura@nexus.io',
      role: 'developer', status: 'inactive', department: 'Frontend', location: 'Tokyo, JP',
      phone: '+81 90 1234 5678', bio: 'Frontend engineer specialising in performance and accessibility audits.',
      avatarInitials: 'LN', avatarColor: '#00e5ff', joinedDate: '2023-08-22',
      lastActive: '2026-04-10', tasksAssigned: 8, tasksCompleted: 2,
      permissions: ['read', 'write']
    },
    {
      id: 'u6', firstName: 'Marcus', lastName: 'Webb', email: 'm.webb@nexus.io',
      role: 'manager', status: 'active', department: 'Product', location: 'London, UK',
      phone: '+44 7700 900123', bio: 'Product manager driving roadmap and cross-team alignment across three squads.',
      avatarInitials: 'MW', avatarColor: '#ff3860', joinedDate: '2021-11-03',
      lastActive: '2026-04-20', tasksAssigned: 5, tasksCompleted: 5,
      permissions: ['read', 'write', 'delete']
    },
    {
      id: 'u7', firstName: 'Fatima', lastName: 'Al-Hassan', email: 'f.alhassan@nexus.io',
      role: 'viewer', status: 'pending', department: 'Legal', location: 'Dubai, AE',
      phone: '+971 50 123 4567', bio: 'Legal counsel reviewing data-processing agreements and compliance reports.',
      avatarInitials: 'FA', avatarColor: '#bf5af2', joinedDate: '2026-04-01',
      lastActive: '2026-04-15', tasksAssigned: 0, tasksCompleted: 0,
      permissions: ['read']
    },
    {
      id: 'u8', firstName: 'Derek', lastName: 'Chang', email: 'd.chang@nexus.io',
      role: 'developer', status: 'suspended', department: 'Infrastructure', location: 'Toronto, CA',
      phone: '+1 416 555 0199', bio: 'DevOps engineer handling Terraform and cloud cost optimisation.',
      avatarInitials: 'DC', avatarColor: '#ffb700', joinedDate: '2022-12-05',
      lastActive: '2026-03-01', tasksAssigned: 6, tasksCompleted: 0,
      permissions: ['read']
    }
  ]);

  private _authUser = signal<User | null>(null);

  // Public readonly signals
  users = this._users.asReadonly();
  authUser = this._authUser.asReadonly();
  isAuthenticated = computed(() => this._authUser() !== null);

  // Stats computed
  userStats = computed(() => {
    const u = this._users();
    return {
      total:     u.length,
      active:    u.filter(x => x.status === 'active').length,
      pending:   u.filter(x => x.status === 'pending').length,
      suspended: u.filter(x => x.status === 'suspended').length,
      admins:    u.filter(x => x.role === 'admin').length,
      devs:      u.filter(x => x.role === 'developer').length,
    };
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  login(email: string, password: string): boolean {
    const user = this._users().find(u => u.email === email);
    if (user && password === 'nexus123') {
      this._authUser.set(user);
      return true;
    }
    // Demo: allow admin login
    if (email === 'admin@nexus.io' && password === 'nexus123') {
      this._authUser.set(this._users()[0]);
      return true;
    }
    return false;
  }

  logout() {
    this._authUser.set(null);
  }

  getUserById(id: string): User | undefined {
    return this._users().find(u => u.id === id);
  }

  getFilteredUsers(search: string, role: string, status: string): User[] {
    return this._users().filter(u => {
      const matchSearch = !search ||
        `${u.firstName} ${u.lastName} ${u.email} ${u.department}`.toLowerCase().includes(search.toLowerCase());
      const matchRole   = !role   || role   === 'all' || u.role   === role;
      const matchStatus = !status || status === 'all' || u.status === status;
      return matchSearch && matchRole && matchStatus;
    });
  }

  createUser(data: Partial<User>): User {
    const newUser: User = {
      id: 'u' + Date.now(),
      firstName: data.firstName || '',
      lastName:  data.lastName  || '',
      email:     data.email     || '',
      role:      data.role      || 'viewer',
      status:    'pending',
      department: data.department || '',
      location:  data.location  || '',
      phone:     data.phone     || '',
      bio:       data.bio       || '',
      avatarInitials: ((data.firstName?.[0] || '') + (data.lastName?.[0] || '')).toUpperCase(),
      avatarColor: ['#00e5ff','#39ff14','#ffb700','#bf5af2','#ff3860'][Math.floor(Math.random()*5)],
      joinedDate:    new Date().toISOString().split('T')[0],
      lastActive:    new Date().toISOString().split('T')[0],
      tasksAssigned: 0,
      tasksCompleted: 0,
      permissions:   data.permissions || ['read'],
    };
    this._users.update(list => [newUser, ...list]);
    return newUser;
  }

  updateUser(id: string, data: Partial<User>): void {
    this._users.update(list =>
      list.map(u => u.id === id ? { ...u, ...data } : u)
    );
  }

  deleteUser(id: string): void {
    this._users.update(list => list.filter(u => u.id !== id));
  }

  updateStatus(id: string, status: UserStatus): void {
    this._users.update(list =>
      list.map(u => u.id === id ? { ...u, status } : u)
    );
  }
}
