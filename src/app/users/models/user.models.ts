// users/models/user.models.ts

export type UserRole = 'admin' | 'developer' | 'designer' | 'manager' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  location: string;
  phone: string;
  bio: string;
  avatarInitials: string;
  avatarColor: string;
  joinedDate: string;
  lastActive: string;
  tasksAssigned: number;
  tasksCompleted: number;
  permissions: string[];
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  location: string;
  phone: string;
  bio: string;
  password: string;
  confirmPassword: string;
  permissions: string[];
  sendInvite: boolean;
}

export interface UserStat {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}
