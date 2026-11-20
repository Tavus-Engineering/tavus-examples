import { IConversation } from '@/types';

// Calls this app's own backend (server.js), which holds the Tavus API key.
// Never call https://tavusapi.com from the browser: the key would ship in
// the client bundle.
export const createConversation = async (): Promise<IConversation> => {
  try {
    const response = await fetch('/api/tavus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
