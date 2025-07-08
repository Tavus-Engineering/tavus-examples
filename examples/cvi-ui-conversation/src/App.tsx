import { useEffect, useState } from 'react'
import { WelcomeScreen } from './components/WelcomeScreen'
import { createConversation, endConversation } from './api'
import type { IConversation } from './types'
import { Conversation } from './components/cvi/components/conversation'
import { useRequestPermissions } from './components/cvi/hooks/use-request-permissions';


function App() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [screen, setScreen] = useState<'welcome' | 'call'>('welcome')
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(false)

  const requestPermissions = useRequestPermissions();

  useEffect(() => {
    return () => {
      if (conversation && apiKey) {
        void endConversation(conversation.conversation_id, apiKey)
      }
    }
  }, [conversation, apiKey])

  const handleEnd = async () => {
    try {
      setScreen('welcome')
      if (!conversation || !apiKey) return
      await endConversation(conversation.conversation_id, apiKey)
    } catch (error) {
      console.error(error)
    } finally {
      setConversation(null)
    }
  }

  const handleJoin = async (token: string) => {
    try {
      setApiKey(token)
      localStorage.setItem('token', token);
      setLoading(true)
      await requestPermissions()
      if (!token) {
        alert('API key not found. Please set your API key.')
        return
      }
      const conversation = await createConversation(token)
      setConversation(conversation)
      setScreen('call')
    } catch {
      alert('Uh oh! Something went wrong. Check console for details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      {screen === 'welcome' && <WelcomeScreen onStart={handleJoin} loading={loading} />}
      <div>
        {screen === 'call' && conversation && <Conversation conversationUrl={conversation.conversation_url} onLeave={handleEnd} />}
      </div>
    </main>
  )
}

export default App
