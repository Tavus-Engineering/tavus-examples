# Tavus CVI Text Chat Example

A minimal text-only chat interface for Tavus Conversational Video Interface (CVI) that demonstrates sending user messages through the `conversation-respond` event.

[LIVE DEMO](https://andy-tavus.github.io/text_chat_only_cvi/)

## How It Works

This app uses the [conversation-respond](https://docs.tavus.io/api-reference/event-schemas/conversation-respond) event to send text messages to Tavus Replicas:

```javascript
const payload = {
  message_type: "conversation",
  event_type: "conversation.respond",
  conversation_id: currentConversationId,
  properties: {
    text: message
  }
};

callObject.sendAppMessage(payload);
```

When a user types a message and presses Enter, the app:
1. Captures the text input
2. Wraps it in a `conversation-respond` event payload
3. Sends it via Daily's `sendAppMessage()` method
4. The Tavus Replica receives and responds to the message

## Quick Start

1. Generate a conversation using the [Create Conversation API](https://docs.tavus.io/api-reference/conversations/create-conversation) or [Tavus Platform](https://platform.tavus.io)
2. Open `index.html` in your browser
3. Enter your conversation ID
4. Click "Start Chat" and begin typing messages

## Key Features

- Text-only interface (no microphone required)
- Real-time video streaming from Tavus Replica
- URL parameter support (`?conversation_id=YOUR_ID`)

Built with vanilla HTML/CSS/JavaScript and Daily.co SDK.
