export type IConversation = {
  conversation_id: string;
  conversation_name: string;
  status: 'active' | 'ended' | 'error';
  conversation_url: string;
  replica_id: string | null;
  persona_id: string | null;
  created_at: string;
};
