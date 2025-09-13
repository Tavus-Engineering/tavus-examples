import { NextRequest, NextResponse } from 'next/server'
import { TavusConversationRequest, TavusConversationResponse, TavusError } from '@/types/tavus'

export async function POST(request: NextRequest) {
  try {
    const body: TavusConversationRequest = await request.json()
    
    // Validate required fields
    if (!body.replica_id || !body.persona_id) {
      return NextResponse.json(
        { error: 'replica_id and persona_id are required' } as TavusError,
        { status: 400 }
      )
    }

    // Prepare the request body for Tavus API
    const tavusRequestBody: any = {
      replica_id: body.replica_id,
      persona_id: body.persona_id,
    }

    // Add conversational_context if provided
    if (body.conversational_context) {
      tavusRequestBody.conversational_context = body.conversational_context
    }

    // Add properties if provided, with default values for the specified timeouts
    tavusRequestBody.properties = {
      participant_left_timeout: 10, // 10 seconds
      participant_absent_timeout: 10, // 10 seconds
      max_call_duration: 300, // 5 minutes (300 seconds)
      ...body.properties // Allow override from request body
    }

    // Get API key from environment variables
    const apiKey = process.env.TAVUS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Tavus API key not configured' } as TavusError,
        { status: 500 }
      )
    }

    // Make request to Tavus API
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
