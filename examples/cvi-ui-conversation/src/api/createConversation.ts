import type { IConversation } from '@/types';

export const createConversation = async (
  apiKey: string
): Promise<IConversation> => {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        persona_id: 'p48fdf065d6b', // Stock Demo Persona
      }),
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
