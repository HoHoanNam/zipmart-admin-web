import { DatePipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RealtimeService } from '../../core/realtime/realtime.service';
import type { SupportConversation, SupportMessage } from '../../core/models/support.model';
import { SupportAdminService } from './support-admin.service';

@Component({
  selector: 'app-support-admin',
  imports: [FormsModule, DatePipe],
  templateUrl: './support-admin.html',
})
export class SupportAdmin implements OnDestroy {
  private readonly supportService = inject(SupportAdminService);
  private readonly realtime = inject(RealtimeService);

  readonly conversations = signal<SupportConversation[]>([]);
  readonly loadingList = signal(true);
  readonly selectedId = signal<string | null>(null);
  readonly messages = signal<SupportMessage[]>([]);
  readonly loadingMessages = signal(false);
  readonly sending = signal(false);
  readonly busy = signal(false);

  messageInput = '';
  statusFilter: 'open' | 'closed' | '' = 'open';

  readonly filteredConversations = computed(() => {
    const filter = this.statusFilter;
    const list = this.conversations();
    return filter ? list.filter((c) => c.status === filter) : list;
  });

  readonly selectedConversation = computed(() =>
    this.conversations().find((c) => c.id === this.selectedId()) ?? null,
  );

  private readonly onMessage = (message: SupportMessage): void => {
    if (message.conversationId === this.selectedId()) {
      this.messages.update((list) =>
        list.some((m) => m.id === message.id) ? list : [...list, message],
      );
    }
    void this.refreshList();
  };

  private readonly onConversationChanged = (): void => {
    void this.refreshList();
  };

  constructor() {
    this.realtime.connect();
    this.realtime.on<SupportMessage>('support:message', this.onMessage);
    this.realtime.on('support:conversation-updated', this.onConversationChanged);
    this.realtime.on('support:conversation-closed', this.onConversationChanged);
    void this.refreshList();
  }

  ngOnDestroy(): void {
    const current = this.selectedId();
    if (current) this.realtime.emit('support:leave', { conversationId: current });
    this.realtime.off('support:message', this.onMessage as (...args: unknown[]) => void);
    this.realtime.off('support:conversation-updated', this.onConversationChanged);
    this.realtime.off('support:conversation-closed', this.onConversationChanged);
  }

  private async refreshList(): Promise<void> {
    this.loadingList.set(true);
    try {
      this.conversations.set(await this.supportService.findAll());
    } finally {
      this.loadingList.set(false);
    }
  }

  async select(conversation: SupportConversation): Promise<void> {
    const previous = this.selectedId();
    if (previous === conversation.id) return;
    if (previous) this.realtime.emit('support:leave', { conversationId: previous });

    this.selectedId.set(conversation.id);
    this.realtime.emit('support:join', { conversationId: conversation.id });

    this.loadingMessages.set(true);
    try {
      this.messages.set(await this.supportService.findMessages(conversation.id));
    } finally {
      this.loadingMessages.set(false);
    }
  }

  async send(): Promise<void> {
    const conversationId = this.selectedId();
    const body = this.messageInput.trim();
    if (!conversationId || !body) return;

    this.sending.set(true);
    try {
      const message = await this.supportService.postMessage(conversationId, body);
      this.messages.update((list) =>
        list.some((m) => m.id === message.id) ? list : [...list, message],
      );
      this.messageInput = '';
    } finally {
      this.sending.set(false);
    }
  }

  async assignToMe(): Promise<void> {
    const conversationId = this.selectedId();
    if (!conversationId) return;
    this.busy.set(true);
    try {
      await this.supportService.assign(conversationId);
      await this.refreshList();
    } finally {
      this.busy.set(false);
    }
  }

  async closeConversation(): Promise<void> {
    const conversationId = this.selectedId();
    if (!conversationId) return;
    if (!confirm('Đóng cuộc trò chuyện này?')) return;
    this.busy.set(true);
    try {
      await this.supportService.close(conversationId);
      await this.refreshList();
    } finally {
      this.busy.set(false);
    }
  }
}
