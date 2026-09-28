import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationsAdminService } from './notifications-admin.service';

@Component({
  selector: 'app-notifications-admin',
  imports: [FormsModule],
  templateUrl: './notifications-admin.html',
})
export class NotificationsAdmin {
  private readonly notificationsService = inject(NotificationsAdminService);

  title = '';
  body = '';

  readonly sending = signal(false);
  readonly error = signal<string | null>(null);
  readonly lastRecipientCount = signal<number | null>(null);

  async send(): Promise<void> {
    this.sending.set(true);
    this.error.set(null);
    this.lastRecipientCount.set(null);
    try {
      const { recipientCount } = await this.notificationsService.broadcast({
        title: this.title.trim(),
        body: this.body.trim(),
      });
      this.lastRecipientCount.set(recipientCount);
      this.title = '';
      this.body = '';
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.sending.set(false);
    }
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const flattened = this.flattenMessage((err.error as { message?: unknown } | undefined)?.message);
      if (flattened) return flattened;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  private flattenMessage(message: unknown): string | null {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('; ');
    if (message && typeof message === 'object' && 'message' in message) {
      return this.flattenMessage((message as { message?: unknown }).message);
    }
    return null;
  }
}
