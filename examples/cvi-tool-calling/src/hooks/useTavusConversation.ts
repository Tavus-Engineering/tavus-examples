'use client'

import { useState, useCallback } from 'react'
import { ConversationState, TavusConversationRequest, TavusConversationResponse } from '@/types/tavus'

export function useTavusConversation() {
  const [conversationState, setConversationState] = useState<ConversationState>({
    conversationId: null,
    conversationUrl: null,
    status: 'idle',
    error: null,
  })

  const startConversation = useCallback(async (request: TavusConversationRequest) => {
    setConversationState(prev => ({
      ...prev,
      status: 'loading',
      error: null,
    }))

    try {
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
