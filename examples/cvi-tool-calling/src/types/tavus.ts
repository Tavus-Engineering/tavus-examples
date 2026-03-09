/**
 * Tavus API Type Definitions
 * 
 * These types define the shape of requests and responses when interacting
 * with the Tavus Conversations API.
 * 
 * @see https://docs.tavus.io/api-reference/conversations/create-conversation
 */

/**
 * Request body for creating a Tavus conversation.
 * Sent to POST /api/tavus/conversation (our API route)
 */
export interface TavusConversationRequest {
  /** The replica (avatar) to use - get this from Tavus platform */
  replica_id: string
  
  /** The persona to use (defines system prompt, tools, etc.) - get this from Tavus platform */
  persona_id: string
  
  /** Optional context the AI should know about (e.g., product catalog, user info) */
  conversational_context?: string
  
  /** What the AI says when the conversation starts */
  custom_greeting?: string
  
  /** Conversation timeout settings */
  properties?: {
    /** Seconds to wait before ending call after participant leaves */
    participant_left_timeout?: number
    /** Seconds to wait before ending call if participant never joins */
    participant_absent_timeout?: number
    /** Maximum call duration in seconds */
    max_call_duration?: number
  }
}

/**
 * Response from Tavus API when creating a conversation.
 * The key field is `conversation_url` - this is the Daily.js room URL
 * that the client uses to connect to the video call.
 */
export interface TavusConversationResponse {
  /** Unique identifier for this conversation */
  conversation_id: string
  
  /** Human-readable conversation name */
  conversation_name: string
  
  /** Current status of the conversation */
  status: string
  
  /** 
   * IMPORTANT: This is the Daily.js room URL!
   * Pass this to Daily.js to connect to the video call with the AI avatar.
   */
  conversation_url: string
  
  /** The replica used for this conversation */
  replica_id: string
  
  /** The persona used for this conversation */
  persona_id: string
  
  /** ISO timestamp of when the conversation was created */
  created_at: string
}

/**
 * Error response format from Tavus API or our API route
 */
export interface TavusError {
  error: string
  message?: string
}

/**
 * Local state for tracking conversation status.
 * Used by the useTavusConversation hook.
 */
export interface ConversationState {
  /** The conversation ID (if connected) */
  conversationId: string | null
  
  /** The Daily.js room URL (if connected) */
  conversationUrl: string | null
  
  /** 
   * Current status:
   * - idle: No conversation started
   * - loading: Creating conversation via API
   * - connected: Conversation created, URL available
   * - error: Something went wrong
   */
  status: 'idle' | 'loading' | 'connected' | 'error'
  
  /** Error message if status is 'error' */
  error: string | null
}
