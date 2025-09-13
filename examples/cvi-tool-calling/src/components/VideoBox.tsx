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

const getOrCreateCallObject = () => {
  // Use a property on window to store the singleton
  if (typeof window !== 'undefined' && !window._dailyCallObject) {
    window._dailyCallObject = DailyIframe.createCallObject()
  }
  return window._dailyCallObject
}

// Define video box sizes
const VIDEO_SIZES = {
  small: { width: 120, height: 120 },
  medium: { width: 176, height: 176 }, // 44 * 4 = 176 (original size)
  large: { width: 240, height: 240 },
  xlarge: { width: 320, height: 320 }
} as const

type VideoSize = keyof typeof VIDEO_SIZES

interface VideoBoxProps {
  conversationUrl?: string | null
  isLoading?: boolean
  onAddToCart: (item: ShoppingItem, quantity: number) => void
}

export function VideoBox({ conversationUrl, isLoading = false, onAddToCart }: VideoBoxProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [remoteParticipants, setRemoteParticipants] = useState<Record<string, any>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [videoSize, setVideoSize] = useState<VideoSize>('medium')
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const callRef = useRef<any>(null)
  const handleToolCallRef = useRef<any>(null)

  // Handle tool calls directly in component
  const handleToolCall = useCallback(async (event: any) => {
    const { conversation_id, properties } = event.data
    const { name, arguments: args } = properties
    
    console.log('🔄 Processing tool call:', { name, args, conversation_id })
    
    let result: string
    
    try {
      const parsedArgs = JSON.parse(args)
      console.log('📝 Parsed arguments:', parsedArgs)

      switch (name) {
        case 'add_to_cart':
          // Search for the item
          const foundItem = shoppingItems.find(item => 
            item.name.toLowerCase().includes(parsedArgs.item_name.toLowerCase()) ||
            parsedArgs.item_name.toLowerCase().includes(item.name.toLowerCase())
          )
          
          if (!foundItem) {
            result = `Hey, I'm not able to find "${parsedArgs.item_name}" in our store. Could you try a different item name?`
          } else {
            // Add to cart
            onAddToCart(foundItem, parsedArgs.quantity || 1)
            const quantityText = (parsedArgs.quantity || 1) > 1 ? ` (${parsedArgs.quantity} items)` : ''
            result = `Great! I added ${foundItem.name}${quantityText} to your cart each for $${foundItem.price.toFixed(2)}.`
          }
          break
        default:
          result = `Unknown function: ${name}`
      }
    } catch (error) {
      console.error('❌ Error handling tool call:', error)
      result = `Error processing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // Send response back to Tavus
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

  // Update the ref when handleToolCall changes
  useEffect(() => {
    handleToolCallRef.current = handleToolCall
  }, [handleToolCall])

  // Get current video dimensions
  const currentSize = VIDEO_SIZES[videoSize]

  // Initialize position on client side (right side by default) - only once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ 
        x: window.innerWidth - VIDEO_SIZES.medium.width - 20, 
        y: window.innerHeight - VIDEO_SIZES.medium.height - 20 
      })
    }
  }, []) // Remove currentSize dependency to prevent position reset

  // Adjust position when size changes to keep video in bounds
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

  // Resize functions
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

  // Daily.js integration for Tavus conversation
  useEffect(() => {
    if (!conversationUrl || typeof window === 'undefined') return

    const call = getOrCreateCallObject()
    callRef.current = call

    let isJoining = false

    // Join meeting
    const joinMeeting = async () => {
      if (isJoining) return
      isJoining = true

      try {
        const meetingState = call.meetingState()
        
        if (meetingState === 'joined-meeting') {
          // Already connected, just update state
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

    // Handle remote participants
    const updateRemoteParticipants = () => {
      const participants = call.participants()
      const remotes: Record<string, any> = {}
      Object.entries(participants).forEach(([id, p]: [string, any]) => {
        if (id !== 'local') remotes[id] = p
      })
      setRemoteParticipants(remotes)
    }

    call.on('participant-joined', updateRemoteParticipants)
    call.on('participant-updated', updateRemoteParticipants)
    call.on('participant-left', updateRemoteParticipants)
    
    // Listen for app messages and handle tool calls directly
    const handleAppMessage = (event: any) => {
      // Handle tool calls directly
      if (event.data && event.data.event_type === 'conversation.tool_call') {
        console.log('📱 RAW TOOL CALL DATA:', event)
        handleToolCallRef.current(event)
      }
    }
    
    call.on('app-message', handleAppMessage)

    // Cleanup
    return () => {
      call.off('participant-joined', updateRemoteParticipants)
      call.off('participant-updated', updateRemoteParticipants)
      call.off('participant-left', updateRemoteParticipants)
      call.off('app-message', handleAppMessage)
      // Don't leave the call since we're using a singleton
      setIsConnected(false)
      setRemoteParticipants({})
    }
  }, [conversationUrl]) // Removed handleToolCall from dependencies

  // Attach remote video and audio tracks
  useEffect(() => {
    Object.entries(remoteParticipants).forEach(([id, p]) => {
      // Video
      const videoEl = document.getElementById(`remote-video-${id}`) as HTMLVideoElement
      if (videoEl && p.tracks?.video && p.tracks.video.state === 'playable' && p.tracks.video.persistentTrack) {
        videoEl.srcObject = new MediaStream([p.tracks.video.persistentTrack])
      }
      // Audio
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
