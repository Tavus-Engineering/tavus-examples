export interface TavusConversationRequest {
  replica_id: string
  persona_id: string
  conversational_context?: string
  custom_greeting?: string
  properties?: {
    participant_left_timeout?: number
    participant_absent_timeout?: number
    max_call_duration?: number
  }
}

export interface TavusConversationResponse {
  conversation_id: string
  conversation_name: string
  status: string
  conversation_url: string
  replica_id: string
  persona_id: string
  created_at: string
}

export interface TavusError {
  error: string
  message?: string
}

export interface ConversationState {
  conversationId: string | null
  conversationUrl: string | null
  status: 'idle' | 'loading' | 'connected' | 'error'
  error: string | null
}
