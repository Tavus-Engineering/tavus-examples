import { useEffect, useState } from 'react'
import { WelcomeScreen } from './components/WelcomeScreen'
import { createConversation, endConversation } from './api'
import type { IConversation } from './types'
import { HairCheck } from './components/cvi/components/hair-check'
import { Conversation } from './components/cvi/components/conversation'

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [screen, setScreen] = useState<'welcome' | 'hairCheck' | 'call'>('welcome')
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (conversation && apiKey) {
        void endConversation(conversation.conversation_id, apiKey)
      }
    }
  }, [conversation, apiKey])

  const handleStart = (key: string) => {
    setApiKey(key)
    localStorage.setItem('token', key);
    setScreen('hairCheck')
  }

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

  const handleJoin = async () => {
    try {
      if (!apiKey) return
      setLoading(true)
      const conversation = await createConversation(apiKey)
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
      {screen === 'welcome' && <WelcomeScreen onStart={handleStart} loading={loading} />}
      <div>
        {screen === 'hairCheck' && <HairCheck isJoinBtnLoading={loading} onJoin={handleJoin} onCancel={() => setScreen('welcome')} />}
        {screen === 'call' && conversation && <Conversation conversationUrl={conversation.conversation_url} onLeave={handleEnd} />}
      </div>
    </main>
  )
}

export default App
