import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { SupportConversation, SupportMessage } from '../../core/models/support.model';

@Injectable({ providedIn: 'root' })
export class SupportAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<SupportConversation[]> {
    return firstValueFrom(
      this.http.get<SupportConversation[]>(`${environment.apiUrl}/support/conversations`),
    );
  }

  findMessages(id: string): Promise<SupportMessage[]> {
    return firstValueFrom(
      this.http.get<SupportMessage[]>(`${environment.apiUrl}/support/conversations/${id}/messages`),
    );
  }

  postMessage(id: string, body: string): Promise<SupportMessage> {
    return firstValueFrom(
      this.http.post<SupportMessage>(`${environment.apiUrl}/support/conversations/${id}/messages`, {
        body,
      }),
    );
  }

  assign(id: string): Promise<SupportConversation> {
    return firstValueFrom(
      this.http.patch<SupportConversation>(
        `${environment.apiUrl}/support/conversations/${id}/assign`,
        {},
      ),
    );
  }

  close(id: string): Promise<SupportConversation> {
    return firstValueFrom(
      this.http.patch<SupportConversation>(
        `${environment.apiUrl}/support/conversations/${id}/close`,
        {},
      ),
    );
  }
}
