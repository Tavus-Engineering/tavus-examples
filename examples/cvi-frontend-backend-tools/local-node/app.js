const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = 3000;

// Import the REPLICATE_API_TOKEN from your config file
const { REPLICATE_API_TOKEN } = require('./config');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS middleware
app.use(cors());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create conversation endpoint
app.post('/api/conversations', async (req, res, next) => {
  try {
    const DEPLOYMENT = 'cvi-nikita';
    const response = await fetch(
      `https://api.replicate.com/v1/deployments/tavus-engineering/${DEPLOYMENT}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            bucket: 'ai-avatar-training-prod',
            user_id: 1,
            room_url: 'https://tavus.daily.co/greenscreen',
            voice_id: 'db32682b-6ddc-4df8-9db6-c041ef21d575',
            avatar_id: '4967',
            tts_engine: 'cartesia',
            persona_name: 'Demo-Persona',
            conversation_id: 'manual',
            train_pipeline_id: '1c24934d',
            enable_transcription: true,
            apply_greenscreen: true,
            max_call_duration: 3600,
            participant_absent_timeout: 3600,
            participant_left_timeout: 3600,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Prediction ID:', data);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// End conversation endpoint
app.post(
  '/api/conversations/:conversationId/cancel',
  async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${conversationId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to end conversation: ${response.status}`);
      }

      res.status(200).json({ message: 'Conversation ended successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An error occurred', message: err.message });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
