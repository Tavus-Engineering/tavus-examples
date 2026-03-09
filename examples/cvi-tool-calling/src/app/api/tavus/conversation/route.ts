/**
 * Tavus Conversation API Route
 * 
 * This Next.js API route creates a new Tavus conversation by calling the Tavus API.
 * It acts as a proxy to keep the TAVUS_API_KEY secret on the server side.
 * 
 * Endpoint: POST /api/tavus/conversation
 * 
 * The response includes a `conversation_url` which is a Daily.js room URL
 * that the client uses to connect to the video call with the AI avatar.
 * 
 * @see https://docs.tavus.io/api-reference/conversations/create-conversation
 */
import { NextRequest, NextResponse } from 'next/server'
import { TavusConversationRequest, TavusConversationResponse, TavusError } from '@/types/tavus'

export async function POST(request: NextRequest) {
  try {
    const body: TavusConversationRequest = await request.json()
    
    // ========================================
    // VALIDATION
    // ========================================
    
    // replica_id: The visual avatar (created in Tavus platform)
    // persona_id: The AI persona with system prompt and tools (created in Tavus platform)
    if (!body.replica_id || !body.persona_id) {
      return NextResponse.json(
        { error: 'replica_id and persona_id are required' } as TavusError,
        { status: 400 }
      )
    }

    // ========================================
    // BUILD TAVUS API REQUEST
    // ========================================
    
    const tavusRequestBody: any = {
      replica_id: body.replica_id,
      persona_id: body.persona_id,
    }

    // conversational_context: Background info the AI should know (e.g., product catalog)
    // This helps the AI understand what products are available
    if (body.conversational_context) {
      tavusRequestBody.conversational_context = body.conversational_context
    }

    // custom_greeting: What the AI says when the conversation starts
    if (body.custom_greeting) {
      tavusRequestBody.custom_greeting = body.custom_greeting
    }

    // Conversation properties with sensible defaults for a demo
    tavusRequestBody.properties = {
      participant_left_timeout: 10,    // End call 10s after user leaves
      participant_absent_timeout: 10,  // End call 10s if user never joins
      max_call_duration: 300,          // Max 5 minutes per conversation
      ...body.properties               // Allow override from request
    }

    // ========================================
    // CALL TAVUS API
    // ========================================
    
    // Get API key from environment (keep this secret on server side!)
    const apiKey = process.env.TAVUS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Tavus API key not configured' } as TavusError,
        { status: 500 }
      )
    }

    // Create the conversation via Tavus API
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,  // Tavus API authentication
      },
      body: JSON.stringify(tavusRequestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Tavus API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create Tavus conversation', message: errorData } as TavusError,
        { status: response.status }
      )
    }

    // Return the conversation data (includes conversation_url for Daily.js)
    const conversationData: TavusConversationResponse = await response.json()
    
    return NextResponse.json(conversationData)
  } catch (error) {
    console.error('Error creating Tavus conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' } as TavusError,
      { status: 500 }
    )
  }
}
