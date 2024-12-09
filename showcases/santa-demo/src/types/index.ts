export enum ConversationStatus {
  ACTIVE = "active",
  ENDED = "ended",
  ERROR = "error",
}

export type IConversation = {
  conversation_id: string;
  conversation_name: string;
  status: ConversationStatus;
  conversation_url: string;
  created_at: string;
};
