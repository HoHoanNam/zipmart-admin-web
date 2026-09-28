import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BroadcastNotificationInput {
  title: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsAdminService {
  private readonly http = inject(HttpClient);

  broadcast(input: BroadcastNotificationInput): Promise<{ recipientCount: number }> {
    return firstValueFrom(
      this.http.post<{ recipientCount: number }>(
        `${environment.apiUrl}/notifications/broadcast`,
        input,
      ),
    );
  }
}
