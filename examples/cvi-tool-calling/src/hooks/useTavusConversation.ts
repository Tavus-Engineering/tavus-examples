/**
 * useTavusConversation Hook
 * 
 * Custom React hook for managing Tavus conversation state.
 * 
 * This hook:
 * 1. Calls our API route to create a Tavus conversation
 * 2. Tracks the conversation state (loading, connected, error)
 * 3. Provides the conversation URL needed by Daily.js to connect
 * 
 * Usage:
 * ```tsx
 * const { conversationState, startConversation } = useTavusConversation()
 * 
 * // Start a conversation
 * await startConversation({
 *   replica_id: 'your-replica-id',
 *   persona_id: 'your-persona-id',
 *   conversational_context: 'Product catalog info...',
 *   custom_greeting: 'Hello! How can I help?'
 * })
 * 
 * // Use the conversation URL
 * <VideoBox conversationUrl={conversationState.conversationUrl} />
 * ```
 */
'use client'

import { useState, useCallback } from 'react'
import { ConversationState, TavusConversationRequest, TavusConversationResponse } from '@/types/tavus'

export function useTavusConversation() {
  // Track the conversation state
  const [conversationState, setConversationState] = useState<ConversationState>({
    conversationId: null,
    conversationUrl: null,     // This URL is used by Daily.js to connect
    status: 'idle',            // idle | loading | connected | error
    error: null,
  })

  /**
   * Start a new Tavus conversation.
   * 
   * This calls our API route which then calls the Tavus API to create
   * a conversation. The response includes a conversation_url that
   * Daily.js uses to connect to the video call with the AI avatar.
   */
  const startConversation = useCallback(async (request: TavusConversationRequest) => {
    // Set loading state
    setConversationState(prev => ({
      ...prev,
      status: 'loading',
      error: null,
    }))

    try {
      // Call our API route (which proxies to Tavus API)
      const response = await fetch('/api/tavus/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start conversation')
      }

      const conversationData: TavusConversationResponse = await response.json()

      // Update state with conversation details
      // The conversation_url is what Daily.js needs to connect
      setConversationState({
        conversationId: conversationData.conversation_id,
        conversationUrl: conversationData.conversation_url,
        status: 'connected',
        error: null,
      })

      return conversationData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      setConversationState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }))

      throw error
    }
  }, [])

  /** Reset conversation state (useful for starting a new conversation) */
  const resetConversation = useCallback(() => {
    setConversationState({
      conversationId: null,
      conversationUrl: null,
      status: 'idle',
      error: null,
    })
  }, [])

  return {
    conversationState,
    startConversation,
    resetConversation,
  }
}
