// users/pages/user-form/user-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, Validators,
  AbstractControl, ValidationErrors, FormGroup
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleBadgeComponent } from '../../components/role-badge/role-badge.component';
import { UserRole } from '../../models/user.models';

// ── Custom Validators ─────────────────────────────────────────────────────────
function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null;
  const hasUpper = /[A-Z]/.test(v);
  const hasDigit = /\d/.test(v);
  const hasMin   = v.length >= 8;
  if (!hasUpper || !hasDigit || !hasMin) {
    return { weakPassword: { hasUpper, hasDigit, hasMin } };
  }
  return null;
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  if (cpw && pw !== cpw) return { mismatch: true };
  return null;
}

function phoneFormat(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null;
  const valid = /^[\+]?[\d\s\-\(\)]{7,15}$/.test(v);
  return valid ? null : { invalidPhone: true };
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RoleBadgeComponent],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="form-page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit User' : 'Create User' }}</h1>
          <p class="page-sub">
            {{ isEdit ? 'Update the details for ' + (originalName || 'this user') : 'Fill in all required fields to register a new team member.' }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" [routerLink]="isEdit ? ['/users/profile', userId] : '/users/list'">
            CANCEL
          </button>
          <button class="btn-primary" (click)="onSubmit()" [disabled]="isSubmitting">
            @if (isSubmitting) {
              <span class="spinner">↻</span> SAVING...
            } @else {
              {{ isEdit ? '✓ SAVE CHANGES' : '+ CREATE USER' }}
            }
          </button>
        </div>
      </div>

      <!-- Success / Error banner -->
      @if (successMsg) {
        <div class="banner banner--success">✓ {{ successMsg }}</div>
      }
      @if (errorMsg) {
        <div class="banner banner--error">⊘ {{ errorMsg }}</div>
      }

      <!-- Form body -->
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="form-layout">

          <!-- ── LEFT COLUMN ── -->
          <div class="form-col">

            <!-- Personal info card -->
            <div class="form-card">
              <div class="card-title">PERSONAL INFORMATION</div>

              <div class="field-row">
                <div class="field-group">
                  <label class="field-label">FIRST NAME <span class="required">*</span></label>
                  <input formControlName="firstName" type="text" class="field-input"
                    [class.field-error]="invalid('firstName')" placeholder="Andrés">
                  @if (invalid('firstName')) {
                    <span class="error-msg">
                      @if (fc['firstName'].errors?.['required']) { First name is required }
                      @else if (fc['firstName'].errors?.['minlength']) { At least 2 characters }
                    </span>
                  }
                </div>
                <div class="field-group">
                  <label class="field-label">LAST NAME <span class="required">*</span></label>
                  <input formControlName="lastName" type="text" class="field-input"
                    [class.field-error]="invalid('lastName')" placeholder="Reyes">
                  @if (invalid('lastName')) {
                    <span class="error-msg">Last name is required</span>
                  }
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">EMAIL ADDRESS <span class="required">*</span></label>
                <input formControlName="email" type="email" class="field-input"
                  [class.field-error]="invalid('email')" placeholder="user@nexus.io">
                @if (invalid('email')) {
                  <span class="error-msg">
                    @if (fc['email'].errors?.['required']) { Email is required }
                    @else if (fc['email'].errors?.['email']) { Enter a valid email address }
                  </span>
                }
              </div>

              <div class="field-group">
                <label class="field-label">PHONE NUMBER</label>
                <input formControlName="phone" type="tel" class="field-input"
                  [class.field-error]="invalid('phone')" placeholder="+1 555 000 1234">
                @if (invalid('phone')) {
                  <span class="error-msg">Enter a valid phone number</span>
                }
              </div>

              <div class="field-row">
                <div class="field-group">
                  <label class="field-label">DEPARTMENT <span class="required">*</span></label>
                  <select formControlName="department" class="field-input field-select"
                    [class.field-error]="invalid('department')">
                    <option value="">Select department</option>
                    @for (dept of departments; track dept) {
                      <option [value]="dept">{{ dept }}</option>
                    }
                  </select>
                  @if (invalid('department')) {
                    <span class="error-msg">Department is required</span>
                  }
                </div>
                <div class="field-group">
                  <label class="field-label">LOCATION</label>
                  <input formControlName="location" type="text" class="field-input"
                    placeholder="City, Country">
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">BIO</label>
                <textarea formControlName="bio" class="field-input field-textarea"
                  placeholder="Short bio or description of role..." rows="3"></textarea>
                <span class="char-count">{{ fc['bio'].value?.length || 0 }} / 300</span>
              </div>
            </div>

            <!-- Password card (hidden on edit unless toggled) -->
            <div class="form-card">
              <div class="card-title-row">
                <div class="card-title">{{ isEdit ? 'CHANGE PASSWORD' : 'SECURITY' }}</div>
                @if (isEdit) {
                  <button type="button" class="toggle-link" (click)="showPwFields = !showPwFields">
                    {{ showPwFields ? 'Cancel' : 'Change password' }}
                  </button>
                }
              </div>

              @if (!isEdit || showPwFields) {
                <div formGroupName="passwords">
                  <div class="field-group">
                    <label class="field-label">PASSWORD {{ !isEdit ? '*' : '' }}</label>
                    <div class="input-with-icon">
                      <input [type]="showPw ? 'text' : 'password'" formControlName="password"
                        class="field-input" [class.field-error]="invalidNested('passwords', 'password')"
                        placeholder="Min. 8 chars, 1 uppercase, 1 digit">
                      <button type="button" class="eye-btn" (click)="showPw = !showPw">
                        {{ showPw ? '⊙' : '⊚' }}
                      </button>
                    </div>

                    <!-- Strength meter -->
                    @if (fc_pw['password'].value) {
                      <div class="strength-meter">
                        <div class="strength-bars">
                          @for (bar of [1,2,3,4]; track bar) {
                            <div class="sbar" [class]="'sbar--' + getStrengthClass(bar)"></div>
                          }
                        </div>
                        <span class="strength-label" [class]="'strength-label--' + strengthLevel()">
                          {{ strengthLabel() }}
                        </span>
                      </div>
                    }

                    @if (invalidNested('passwords', 'password')) {
                      <div class="pw-hints">
                        @if (fc_pw['password'].errors?.['weakPassword']; as e) {
                          <span class="pw-hint" [class.ok]="e.hasMin">✓ 8+ characters</span>
                          <span class="pw-hint" [class.ok]="e.hasUpper">✓ Uppercase letter</span>
                          <span class="pw-hint" [class.ok]="e.hasDigit">✓ Number</span>
                        }
                      </div>
                    }
                  </div>

                  <div class="field-group">
                    <label class="field-label">CONFIRM PASSWORD {{ !isEdit ? '*' : '' }}</label>
                    <input [type]="showPw ? 'text' : 'password'" formControlName="confirmPassword"
                      class="field-input"
                      [class.field-error]="pwGroup?.errors?.['mismatch'] && fc_pw['confirmPassword'].touched"
                      placeholder="Repeat password">
                    @if (pwGroup?.errors?.['mismatch'] && fc_pw['confirmPassword'].touched) {
                      <span class="error-msg">Passwords do not match</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- ── RIGHT COLUMN ── -->
          <div class="form-col">

            <!-- Role & Status -->
            <div class="form-card">
              <div class="card-title">ROLE & ACCESS</div>

              <div class="field-group">
                <label class="field-label">ROLE <span class="required">*</span></label>
                <div class="role-selector">
                  @for (role of roles; track role.value) {
                    <button type="button"
                      class="role-option"
                      [class.selected]="fc['role'].value === role.value"
                      (click)="fc['role'].setValue(role.value)">
                      <span class="role-option-icon">{{ role.icon }}</span>
                      <span class="role-option-name">{{ role.label }}</span>
                      <span class="role-option-desc">{{ role.desc }}</span>
                    </button>
                  }
                </div>
                @if (invalid('role')) {
                  <span class="error-msg">Please select a role</span>
                }
              </div>

              <!-- Preview badge -->
              @if (fc['role'].value) {
                <div class="role-preview">
                  <span class="preview-label">Preview:</span>
                  <app-role-badge [role]="fc['role'].value" type="role"></app-role-badge>
                </div>
              }
            </div>

            <!-- Permissions -->
            <div class="form-card">
              <div class="card-title">PERMISSIONS</div>
              <p class="card-hint">Select what this user can do in the system.</p>

              <div class="permissions-grid">
                @for (perm of permissionOptions; track perm.value) {
                  <label class="perm-checkbox" [class.checked]="hasPermission(perm.value)">
                    <input type="checkbox"
                      [checked]="hasPermission(perm.value)"
                      (change)="togglePermission(perm.value)"
                      [disabled]="perm.value === 'read'">
                    <span class="perm-check-icon">{{ hasPermission(perm.value) ? '✓' : '○' }}</span>
                    <div class="perm-info">
                      <span class="perm-name">{{ perm.label }}</span>
                      <span class="perm-desc">{{ perm.desc }}</span>
                    </div>
                  </label>
                }
              </div>
            </div>

            <!-- Send invite (create only) -->
            @if (!isEdit) {
              <div class="form-card">
                <div class="card-title">ONBOARDING</div>
                <label class="toggle-row">
                  <div class="toggle-info">
                    <div class="toggle-label">Send email invitation</div>
                    <div class="toggle-sub">User will receive a setup link at their email address</div>
                  </div>
                  <div class="toggle-switch" [class.on]="fc['sendInvite'].value"
                    (click)="fc['sendInvite'].setValue(!fc['sendInvite'].value)">
                    <div class="toggle-knob"></div>
                  </div>
                </label>
              </div>
            }

            <!-- Form summary / validation status -->
            <div class="form-card form-card--summary">
              <div class="card-title">FORM STATUS</div>
              <div class="summary-items">
                @for (check of formChecks(); track check.label) {
                  <div class="summary-item" [class.ok]="check.ok">
                    <span>{{ check.ok ? '✓' : '○' }}</span>
                    <span>{{ check.label }}</span>
                  </div>
                }
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private userSvc = inject(UserService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);

  isEdit       = false;
  userId       = '';
  originalName = '';
  isSubmitting = false;
  showPwFields = false;
  showPw       = false;
  successMsg   = '';
  errorMsg     = '';

  departments = ['Engineering','Design','Data','Security','Frontend','Infrastructure','Product','Legal','DevOps','Marketing'];

  roles: { value: UserRole; label: string; icon: string; desc: string }[] = [
    { value: 'admin',     label: 'Admin',     icon: '◈', desc: 'Full system access' },
    { value: 'manager',   label: 'Manager',   icon: '⊞', desc: 'Team & task oversight' },
    { value: 'developer', label: 'Developer', icon: '◫', desc: 'Code & infrastructure' },
    { value: 'designer',  label: 'Designer',  icon: '◎', desc: 'UI/UX & assets' },
    { value: 'viewer',    label: 'Viewer',    icon: '⊙', desc: 'Read-only access' },
  ];

  permissionOptions = [
    { value: 'read',   label: 'Read',   desc: 'View all content' },
    { value: 'write',  label: 'Write',  desc: 'Create & edit records' },
    { value: 'delete', label: 'Delete', desc: 'Remove records' },
    { value: 'admin',  label: 'Admin',  desc: 'Manage users & settings' },
  ];

  userForm = this.fb.group({
    firstName:  ['', [Validators.required, Validators.minLength(2)]],
    lastName:   ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    phone:      ['', phoneFormat],
    department: ['', Validators.required],
    location:   [''],
    bio:        ['', Validators.maxLength(300)],
    role:       ['', Validators.required],
    permissions: [['read']],
    sendInvite:  [true],
    passwords: this.fb.group({
      password:        ['', [Validators.minLength(8), passwordStrength]],
      confirmPassword: [''],
    }, { validators: passwordsMatch }),
  });

  get fc()    { return this.userForm.controls; }
  get fc_pw() { return (this.userForm.get('passwords') as FormGroup).controls; }
  get pwGroup() { return this.userForm.get('passwords'); }

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'];
    this.isEdit = !!this.userId;

    if (this.isEdit) {
      const user = this.userSvc.getUserById(this.userId);
      if (user) {
        this.originalName = `${user.firstName} ${user.lastName}`;
        this.userForm.patchValue({
          firstName:   user.firstName,
          lastName:    user.lastName,
          email:       user.email,
          phone:       user.phone,
          department:  user.department,
          location:    user.location,
          bio:         user.bio,
          role:        user.role,
          permissions: user.permissions,
          sendInvite:  false,
        });
      }
      // Password not required on edit
      this.fc_pw['password'].clearValidators();
      this.fc_pw['password'].updateValueAndValidity();
    } else {
      // Password required on create
      this.fc_pw['password'].setValidators([Validators.required, Validators.minLength(8), passwordStrength]);
      this.fc_pw['password'].updateValueAndValidity();
      this.fc_pw['confirmPassword'].setValidators(Validators.required);
      this.fc_pw['confirmPassword'].updateValueAndValidity();
    }
  }

  invalid(field: string): boolean {
    const c = this.userForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  invalidNested(group: string, field: string): boolean {
    const c = (this.userForm.get(group) as FormGroup)?.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  hasPermission(p: string): boolean {
    return (this.fc['permissions'].value as string[]).includes(p);
  }

  togglePermission(p: string) {
    if (p === 'read') return; // read always on
    const perms = [...(this.fc['permissions'].value as string[])];
    const idx = perms.indexOf(p);
    idx === -1 ? perms.push(p) : perms.splice(idx, 1);
    this.fc['permissions'].setValue(perms);
  }

  strengthLevel(): number {
    const v: string = this.fc_pw['password'].value || '';
    let s = 0;
    if (v.length >= 8)         s++;
    if (/[A-Z]/.test(v))       s++;
    if (/\d/.test(v))          s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  }

  strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.strengthLevel()];
  }

  getStrengthClass(bar: number): string {
    const level = this.strengthLevel();
    if (level === 0 || bar > level) return 'empty';
    if (level === 1) return 'weak';
    if (level === 2) return 'fair';
    if (level === 3) return 'good';
    return 'strong';
  }

  formChecks() {
    const f = this.userForm;
    const pwOk = this.isEdit && !this.showPwFields
      ? true
      : !this.pwGroup?.errors?.['mismatch'] && !this.fc_pw['password'].errors;
    return [
      { label: 'Name provided',       ok: !!f.get('firstName')?.valid && !!f.get('lastName')?.valid },
      { label: 'Valid email address',  ok: !!f.get('email')?.valid },
      { label: 'Department selected',  ok: !!f.get('department')?.valid },
      { label: 'Role assigned',        ok: !!f.get('role')?.valid },
      { label: 'Password secure',      ok: pwOk },
    ];
  }

  onSubmit() {
    this.userForm.markAllAsTouched();
    (this.userForm.get('passwords') as FormGroup).markAllAsTouched();

    const pwRequired = !this.isEdit || this.showPwFields;
    const pwValid = !pwRequired || (
      !this.pwGroup?.errors?.['mismatch'] &&
      !this.fc_pw['password'].errors
    );

    if (this.userForm.invalid || !pwValid) {
      this.errorMsg = 'Please fix the errors above before submitting.';
      setTimeout(() => this.errorMsg = '', 4000);
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';

    setTimeout(() => {
      const v = this.userForm.value;

      if (this.isEdit) {
        this.userSvc.updateUser(this.userId, {
          firstName:   v.firstName!,
          lastName:    v.lastName!,
          email:       v.email!,
          phone:       v.phone!,
          department:  v.department!,
          location:    v.location!,
          bio:         v.bio!,
          role:        v.role as UserRole,
          permissions: v.permissions as string[],
          avatarInitials: ((v.firstName?.[0] || '') + (v.lastName?.[0] || '')).toUpperCase(),
        });
        this.successMsg = 'User updated successfully!';
        setTimeout(() => this.router.navigate(['/users/profile', this.userId]), 1200);
      } else {
        const newUser = this.userSvc.createUser({
          firstName:   v.firstName!,
          lastName:    v.lastName!,
          email:       v.email!,
          phone:       v.phone!,
          department:  v.department!,
          location:    v.location!,
          bio:         v.bio!,
          role:        v.role as UserRole,
          permissions: v.permissions as string[],
        });
        this.successMsg = `User ${v.firstName} ${v.lastName} created!`;
        setTimeout(() => this.router.navigate(['/users/profile', newUser.id]), 1200);
      }

      this.isSubmitting = false;
    }, 800);
  }
}
