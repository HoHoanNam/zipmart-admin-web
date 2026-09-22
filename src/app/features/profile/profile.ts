import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { AdminUser, UserRole } from '../../core/models/user.model';
import { ProfileService } from './profile.service';
import { UploadsService } from './uploads.service';

const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Khách hàng',
  admin: 'Quản trị viên',
};

const MESSAGE_AUTO_DISMISS_MS = 3000;

@Component({
  selector: 'app-profile',
  imports: [FormsModule, DatePipe],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly profileService = inject(ProfileService);
  private readonly uploadsService = inject(UploadsService);

  readonly profile = signal<AdminUser | null>(null);
  readonly loading = signal(true);
  readonly uploading = signal(false);

  phoneNumber = '';
  readonly savingPhone = signal(false);
  readonly phoneError = signal<string | null>(null);
  readonly phoneMessage = signal<string | null>(null);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  readonly savingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordMessage = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const profile = await this.profileService.getMe();
      this.profile.set(profile);
      this.phoneNumber = profile.phoneNumber ?? '';
    } finally {
      this.loading.set(false);
    }
  }

  roleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploading.set(true);
    try {
      const { url } = await this.uploadsService.uploadAvatar(file);
      const updated = await this.profileService.updateMe({ avatarUrl: url });
      this.profile.set(updated);
    } catch (err) {
      this.phoneError.set(this.extractErrorMessage(err));
    } finally {
      this.uploading.set(false);
    }
  }

  async onSubmitPhone(): Promise<void> {
    this.savingPhone.set(true);
    this.phoneError.set(null);
    this.phoneMessage.set(null);
    try {
      const updated = await this.profileService.updateMe({ phoneNumber: this.phoneNumber });
      this.profile.set(updated);
      this.showMessage(this.phoneMessage, 'Đã lưu thay đổi');
    } catch (err) {
      this.phoneError.set(this.extractErrorMessage(err));
    } finally {
      this.savingPhone.set(false);
    }
  }

  async onSubmitPassword(): Promise<void> {
    this.passwordError.set(null);
    this.passwordMessage.set(null);

    if (this.newPassword.length < 8) {
      this.passwordError.set('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    this.savingPassword.set(true);
    try {
      await this.profileService.changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      });
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.showMessage(this.passwordMessage, 'Đã đổi mật khẩu thành công');
    } catch (err) {
      this.passwordError.set(this.extractErrorMessage(err));
    } finally {
      this.savingPassword.set(false);
    }
  }

  private showMessage(target: typeof this.phoneMessage, text: string): void {
    target.set(text);
    setTimeout(() => target.set(null), MESSAGE_AUTO_DISMISS_MS);
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: unknown } | undefined;
      const flattened = this.flattenErrorMessage(body?.message);
      if (flattened) return flattened;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  private flattenErrorMessage(message: unknown): string | null {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('; ');
    if (message && typeof message === 'object' && 'message' in message) {
      return this.flattenErrorMessage((message as { message?: unknown }).message);
    }
    return null;
  }
}
