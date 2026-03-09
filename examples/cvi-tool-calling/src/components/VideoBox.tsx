/**
 * VideoBox Component - Core Tavus CVI Integration
 * 
 * This component is responsible for:
 * 1. Rendering the Tavus video avatar using Daily.js
 * 2. Receiving and processing tool call events from the AI
 * 3. Sending tool call responses back to the AI
 * 4. Providing a draggable, resizable video interface
 * 
 * TOOL CALLING FLOW:
 * 1. User speaks to AI: "Add bananas to my cart"
 * 2. Tavus AI processes speech and decides to call 'add_to_cart' tool
 * 3. Tavus sends 'conversation.tool_call' event via Daily.js app-message
 * 4. This component receives the event and executes the function
 * 5. This component sends 'conversation.echo' response back to Tavus
 * 6. AI speaks the result: "I added bananas to your cart!"
 */
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { User, Video, Move, Loader2, Plus, Minus } from 'lucide-react'
import DailyIframe from '@daily-co/daily-js'
import { ShoppingItem } from '@/types/shopping'
import { shoppingItems } from '@/data/shopping-items'

// Extend window type to include our Daily call object
declare global {
  interface Window {
    _dailyCallObject?: any
  }
}

/**
 * Singleton pattern for Daily.js call object.
 * We reuse the same call object to avoid creating multiple connections.
 */
const getOrCreateCallObject = () => {
  if (typeof window !== 'undefined' && !window._dailyCallObject) {
    window._dailyCallObject = DailyIframe.createCallObject()
  }
  return window._dailyCallObject
}

// Video box size presets for the resizable interface
const VIDEO_SIZES = {
  small: { width: 120, height: 120 },
  medium: { width: 176, height: 176 },
  large: { width: 240, height: 240 },
  xlarge: { width: 320, height: 320 }
} as const

type VideoSize = keyof typeof VIDEO_SIZES

interface VideoBoxProps {
  /** The Daily.js room URL returned by Tavus API when creating a conversation */
  conversationUrl?: string | null
  /** Whether the conversation is still being created */
  isLoading?: boolean
  /** Callback to add items to cart - called by tool call handler */
  onAddToCart: (item: ShoppingItem, quantity: number) => void
}

export function VideoBox({ conversationUrl, isLoading = false, onAddToCart }: VideoBoxProps) {
  // ============================================
  // STATE
  // ============================================
  
  // UI state for the draggable/resizable video box
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [videoSize, setVideoSize] = useState<VideoSize>('medium')
  
  // Daily.js state
  const [remoteParticipants, setRemoteParticipants] = useState<Record<string, any>>({})
  const [isConnected, setIsConnected] = useState(false)
  
  // Refs for drag handling and Daily.js call object
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const callRef = useRef<any>(null)
  const handleToolCallRef = useRef<any>(null)

  // ============================================
  // TOOL CALL HANDLER - THE CORE OF THIS DEMO
  // ============================================
  
  /**
   * Handles tool call events from Tavus AI.
   * 
   * When the AI decides to call a tool (based on user speech), Tavus sends
   * a 'conversation.tool_call' event with:
   * - conversation_id: To identify which conversation to respond to
   * - properties.name: The tool name (e.g., 'add_to_cart')
   * - properties.arguments: JSON string with the tool parameters
   * 
   * After processing, we MUST send a 'conversation.echo' response so the
   * AI knows what happened and can speak the result to the user.
   */
  const handleToolCall = useCallback(async (event: any) => {
    // Extract data from the tool call event
    const { conversation_id, properties } = event.data
    const { name, arguments: args } = properties
    
    console.log('🔄 Processing tool call:', { name, args, conversation_id })
    
    let result: string
    
    try {
      // Parse the JSON arguments string into an object
      const parsedArgs = JSON.parse(args)
      console.log('📝 Parsed arguments:', parsedArgs)

      // Handle different tool types - add more cases here for additional tools
      switch (name) {
        case 'add_to_cart':
          // ========================================
          // ADD TO CART TOOL IMPLEMENTATION
          // ========================================
          
          // Search for the item in our product catalog
          // Uses fuzzy matching to handle variations like "bananas" vs "Fresh Bananas"
          const foundItem = shoppingItems.find(item => 
            item.name.toLowerCase().includes(parsedArgs.item_name.toLowerCase()) ||
            parsedArgs.item_name.toLowerCase().includes(item.name.toLowerCase())
          )
          
          if (!foundItem) {
            // Item not found - let the AI know so it can tell the user
            result = `Hey, I'm not able to find "${parsedArgs.item_name}" in our store. Could you try a different item name?`
          } else {
            // Item found! Add it to cart and confirm
            onAddToCart(foundItem, parsedArgs.quantity || 1)
            const quantityText = (parsedArgs.quantity || 1) > 1 ? ` (${parsedArgs.quantity} items)` : ''
            result = `Great! I added ${foundItem.name}${quantityText} to your cart each for $${foundItem.price.toFixed(2)}.`
          }
          break
          
        default:
          // Unknown tool - this shouldn't happen if persona is configured correctly
          result = `Unknown function: ${name}`
      }
    } catch (error) {
      console.error('❌ Error handling tool call:', error)
      result = `Error processing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // ========================================
    // SEND RESPONSE BACK TO TAVUS
    // ========================================
    
    /**
     * CRITICAL: We must send a 'conversation.echo' response so the AI
     * knows the result of the tool call and can speak it to the user.
     * 
     * The response format:
     * - message_type: 'conversation'
     * - event_type: 'conversation.echo'
     * - conversation_id: Same ID from the tool call event
     * - properties.modality: 'text' (the AI will speak this text)
     * - properties.text: The result message
     * - properties.done: true (indicates the response is complete)
     */
    if (callRef.current) {
      console.log('📤 Sending echo response:', result)
      callRef.current.sendAppMessage({
        message_type: 'conversation',
        event_type: 'conversation.echo',
        conversation_id: conversation_id,
        properties: {
          modality: 'text',
          text: result,
          done: true
        }
      }, '*')
    }
  }, [onAddToCart])

  // Keep ref updated so event listener always has latest handler
  useEffect(() => {
    handleToolCallRef.current = handleToolCall
  }, [handleToolCall])

  // ============================================
  // VIDEO BOX POSITIONING & SIZING (UI Logic)
  // ============================================
  
  const currentSize = VIDEO_SIZES[videoSize]

  // Position video box in bottom-right corner on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ 
        x: window.innerWidth - VIDEO_SIZES.medium.width - 20, 
        y: window.innerHeight - VIDEO_SIZES.medium.height - 20 
      })
    }
  }, [])

  // Keep video in bounds when resized
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition(prevPosition => {
        const maxX = window.innerWidth - currentSize.width
        const maxY = window.innerHeight - currentSize.height
        
        return {
          x: Math.max(0, Math.min(maxX, prevPosition.x)),
          y: Math.max(0, Math.min(maxY, prevPosition.y))
        }
      })
    }
  }, [currentSize])

  // Size control functions
  const increaseSize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const sizes: VideoSize[] = ['small', 'medium', 'large', 'xlarge']
    const currentIndex = sizes.indexOf(videoSize)
    if (currentIndex < sizes.length - 1) {
      setVideoSize(sizes[currentIndex + 1])
    }
  }, [videoSize])

  const decreaseSize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const sizes: VideoSize[] = ['small', 'medium', 'large', 'xlarge']
    const currentIndex = sizes.indexOf(videoSize)
    if (currentIndex > 0) {
      setVideoSize(sizes[currentIndex - 1])
    }
  }, [videoSize])

  // ============================================
  // DAILY.JS CONNECTION & EVENT HANDLING
  // ============================================
  
  /**
   * Main Daily.js setup effect.
   * 
   * This connects to the Tavus conversation and sets up event listeners for:
   * 1. Participant events (to render video/audio)
   * 2. App messages (to receive tool calls from the AI)
   */
  useEffect(() => {
    if (!conversationUrl || typeof window === 'undefined') return

    // Get or create the Daily.js call object (singleton)
    const call = getOrCreateCallObject()
    callRef.current = call

    let isJoining = false

    // Join the Daily.js room (which is the Tavus conversation)
    const joinMeeting = async () => {
      if (isJoining) return
      isJoining = true

      try {
        const meetingState = call.meetingState()
        
        if (meetingState === 'joined-meeting') {
          console.log('Already connected to meeting')
          setIsConnected(true)
        } else {
          console.log('Joining Tavus conversation...')
          await call.join({ url: conversationUrl })
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to join Tavus conversation:', error)
        setIsConnected(false)
      } finally {
        isJoining = false
      }
    }

    joinMeeting()

    // Track remote participants (the Tavus avatar)
    const updateRemoteParticipants = () => {
      const participants = call.participants()
      const remotes: Record<string, any> = {}
      Object.entries(participants).forEach(([id, p]: [string, any]) => {
        if (id !== 'local') remotes[id] = p
      })
      setRemoteParticipants(remotes)
    }

    // Subscribe to participant events
    call.on('participant-joined', updateRemoteParticipants)
    call.on('participant-updated', updateRemoteParticipants)
    call.on('participant-left', updateRemoteParticipants)
    
    /**
     * APP MESSAGE LISTENER - This is where tool calls are received!
     * 
     * Tavus sends tool calls via Daily.js 'app-message' events.
     * We filter for 'conversation.tool_call' events and handle them.
     */
    const handleAppMessage = (event: any) => {
      if (event.data && event.data.event_type === 'conversation.tool_call') {
        console.log('📱 RAW TOOL CALL DATA:', event)
        // Call our tool handler (via ref to avoid stale closures)
        handleToolCallRef.current(event)
      }
    }
    
    call.on('app-message', handleAppMessage)

    // Cleanup on unmount
    return () => {
      call.off('participant-joined', updateRemoteParticipants)
      call.off('participant-updated', updateRemoteParticipants)
      call.off('participant-left', updateRemoteParticipants)
      call.off('app-message', handleAppMessage)
      setIsConnected(false)
      setRemoteParticipants({})
    }
  }, [conversationUrl])

  // ============================================
  // VIDEO/AUDIO TRACK ATTACHMENT
  // ============================================
  
  /**
   * Attach video and audio tracks from the Tavus avatar to HTML elements.
   * This runs whenever remoteParticipants changes (when tracks become available).
   */
  useEffect(() => {
    Object.entries(remoteParticipants).forEach(([id, p]) => {
      // Attach video track to <video> element
      const videoEl = document.getElementById(`remote-video-${id}`) as HTMLVideoElement
      if (videoEl && p.tracks?.video && p.tracks.video.state === 'playable' && p.tracks.video.persistentTrack) {
        videoEl.srcObject = new MediaStream([p.tracks.video.persistentTrack])
      }
      
      // Attach audio track to <audio> element (for the AI's voice)
      const audioEl = document.getElementById(`remote-audio-${id}`) as HTMLAudioElement
      if (audioEl && p.tracks?.audio && p.tracks.audio.state === 'playable' && p.tracks.audio.persistentTrack) {
        audioEl.srcObject = new MediaStream([p.tracks.audio.persistentTrack])
      }
    })
  }, [remoteParticipants])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    }
  }, [position])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return

    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY

    const newX = Math.max(0, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) - currentSize.width, dragRef.current.startPosX + deltaX))
    const newY = Math.max(0, Math.min((typeof window !== 'undefined' ? window.innerHeight : 800) - currentSize.height, dragRef.current.startPosY + deltaY))

    setPosition({ x: newX, y: newY })
  }, [isDragging, currentSize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragRef.current = null
  }, [])

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div 
      className="fixed z-50 cursor-move select-none"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="w-full h-full bg-gray-900 border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 relative"
      >
        {/* Control buttons */}
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={decreaseSize}
            disabled={videoSize === 'small'}
            className="p-1 bg-black bg-opacity-50 rounded hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Decrease size"
          >
            <Minus className="h-3 w-3 text-white" />
          </button>
          <button
            onClick={increaseSize}
            disabled={videoSize === 'xlarge'}
            className="p-1 bg-black bg-opacity-50 rounded hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Increase size"
          >
            <Plus className="h-3 w-3 text-white" />
          </button>
        </div>
        
        {/* Move handle */}
        <div className="absolute top-2 left-2 opacity-50 z-10">
          <Move className="h-4 w-4 text-gray-400" />
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white z-20">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span className="text-sm">Starting conversation...</span>
          </div>
        )}
        
        {/* Video content */}
        {Object.keys(remoteParticipants).length > 0 ? (
          <div className="relative w-full h-full">
            {Object.entries(remoteParticipants).map(([id, p]) => (
              <div key={id} className="absolute inset-0">
                <video
                  id={`remote-video-${id}`}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <audio id={`remote-audio-${id}`} autoPlay playsInline />
              </div>
            ))}
          </div>
        ) : conversationUrl && !isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white">
            <Video className="h-8 w-8 mb-2 text-gray-400" />
            <span className="text-sm text-gray-400">Connecting...</span>
          </div>
        ) : !conversationUrl && !isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
            <User className="h-12 w-12 text-gray-400 mb-3" />
            <div className="flex items-center justify-center gap-1">
              <Video className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Video</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
