import { useEffect, useState } from 'react'
import { DailyProvider } from '@daily-co/daily-react'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { HairCheckScreen } from '@/components/HairCheckScreen'
import { CallScreen } from '@/components/CallScreen'
import { createConversation, endConversation } from '@/api'
import { IConversation } from '@/types'
import { useToast } from "@/hooks/use-toast"

function App() {
  const { toast } = useToast()
  const [screen, setScreen] = useState<'welcome' | 'hairCheck' | 'call'>('welcome')
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (conversation) {
        void endConversation(conversation.conversation_id)
      }
    }
  }, [conversation])

  const handleStart = async () => {
    try {
      setLoading(true)
      const conversation = await createConversation()
      setConversation(conversation)
      setScreen('hairCheck')
    } catch {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: 'Check console for details',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnd = async () => {
    try {
      if (!conversation) return
      await endConversation(conversation.conversation_id)
    } catch (error) {
      console.error(error)
    } finally {
      setConversation(null)
      setScreen('welcome')
    }
  }

  const handleJoin = () => {
    setScreen('call')
  }

  return (
    <div className="relative w-full h-screen">
      <iframe
        src="https://www.google.com"
        className="fixed inset-0 w-full h-full z-0"
        style={{ opacity: 0.3 }}
        title="Background Google"
      />
      <main className="relative z-10">
        <DailyProvider>
          {screen === 'welcome' && <WelcomeScreen onStart={handleStart} loading={loading} />}
          {screen === 'hairCheck' && <HairCheckScreen handleEnd={handleEnd} handleJoin={handleJoin} />}
          {screen === 'call' && conversation && <CallScreen conversation={conversation} handleEnd={handleEnd} />}
        </DailyProvider>
      </main>
    </div>
  )
}

export default App
