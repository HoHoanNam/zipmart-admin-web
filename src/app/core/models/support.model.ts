export type SupportConversationStatus = 'open' | 'closed';

export interface SupportConversation {
  id: string;
  userId: string;
  status: SupportConversationStatus;
  assignedAdminId: string | null;
  createdAt: string;
  lastMessageAt: string;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  fromAdmin: boolean;
  body: string;
  createdAt: string;
}
