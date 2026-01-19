# Red or Black Card Game

A demo application that showcases the implementation of tool calls with [Tavus Conversational Video Interface (CVI)](https://docs.tavus.io/sections/conversational-video-interface/what-is-cvi-overview) replicas.

[LIVE DEMO](https://andy-tavus.github.io/red_or_black/)

## Overview

This application demonstrates a simple card game where a virtual dealer (Tavus replica) asks the user to guess whether the next card drawn will be red or black. The application uses Tavus CVI to create an interactive AI host that responds to user inputs and performs actions through tool calls.

## Why a Persona is Required

A Tavus persona is essential for this application because it defines the AI's behavior and capabilities, particularly through tool calls. The persona configuration includes:
- The system prompt that gives the AI its role as a card game host
- The tool call definition that enables the AI to detect and process user guesses
- The context that helps the AI understand the game rules and flow

Without a properly configured persona, the AI wouldn't know how to recognize user guesses or trigger the card drawing functionality. The persona acts as the "brain" of the game, connecting user interactions to the game mechanics through tool calls.

## Technical Implementation

### Core Technologies

- HTML, CSS, and JavaScript for the frontend interface
- [Daily.co API](https://docs.daily.co/) for video communication
- [Tavus API](https://docs.tavus.io/) for creating and managing the AI persona
- [Deck of Cards API](https://deckofcardsapi.com/) for card drawing functionality

### Key Components

1. **User Interface**: A casino-themed interface with video display for the AI dealer and card display area
2. **Tavus CVI Integration**: Creates conversational AI interactions with a persona designed to host the card game
3. **Tool Call Implementation**: Enables the AI persona to detect user color guesses and trigger card draws

## Tool Call Implementation - Step by Step

The central feature of this demo is the implementation of tool calls that allow the Tavus AI to interact with external systems. Here's how it works:

### 1. Persona Configuration

The persona is configured with a tool called `detect_color` that records the user's guess:

```json
{
  "type": "function",
  "function": {
    "name": "detect_color",
    "description": "Record the user's guess of whether the next card will be red or black",
    "parameters": {
      "type": "object",
      "properties": {
        "guess": {
          "type": "string",
          "description": "The color guessed by the user (red or black)",
          "enum": ["red", "black"]
        }
      },
      "required": ["guess"]
    }
  }
}
```

This definition is crucial as it instructs the AI on what to listen for in user utterances. When a user says "red" or "black" (or phrases containing these words), the AI recognizes this as a color guess that matches the tool's parameters and automatically triggers the tool call. The `description` field helps the AI understand when to use this tool, while the `enum` array limits valid values to only "red" or "black", preventing the AI from attempting to pass invalid colors. The AI uses this definition to map natural language inputs to structured function calls without requiring explicit programming for each possible user utterance variation.

### 2. Message Handling

The application listens for app messages from the Daily call:

```javascript
call.on('app-message', handleAppMessage);
```

### 3. Tool Call Detection

When a tool call is initiated by the AI, the app processes it:

```javascript
if (message.message_type === 'conversation' && message.event_type === 'conversation.tool_call') {
    const toolCall = message.properties;
    
    if (toolCall.name === 'detect_color') {
        // Process the tool call
    }
}
```

### 4. Parameter Extraction

The application extracts the user's guess from the tool call arguments:

```javascript
const args = JSON.parse(toolCall.arguments);
const guess = args.guess; // Will be either "red" or "black"
```

### 5. External API Integration

The app then draws a card using the Deck of Cards API:

```javascript
const response = await fetch('https://deckofcardsapi.com/api/deck/new/draw/?count=1');
const data = await response.json();
const card = data.cards[0];
```

### 6. Result Processing

The application determines if the user's guess was correct:

```javascript
const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
const isCorrect = (guess === 'red' && isRed) || (guess === 'black' && !isRed);
```

### 7. Response to AI

The result is sent back to the AI as an echo message:

```javascript
const responseMessage = {
    message_type: "conversation",
    event_type: "conversation.echo",
    conversation_id: message.conversation_id,
    properties: {
        text: isCorrect ? 
            `You guessed right! The card was the ${cardValue} of ${cardSuit}.` : 
            `You guessed wrong! The card was the ${cardValue} of ${cardSuit}.`
    }
};
call.sendAppMessage(responseMessage, '*');
```

This message allows the AI to continue the conversation with knowledge of the result.

## Full Tool Call Flow

1. **User speaks**: The user says "red" or "black" to make their guess
2. **AI processes**: The AI recognizes this as a color guess and initiates a tool call
3. **Tool call triggered**: The `detect_color` function is called with the user's guess
4. **Application responds**: The app draws a card and determines if the guess was correct
5. **Echo message**: The result is sent back to the AI
6. **AI continues**: The AI uses the result to continue the conversation naturally

## Getting Started

1. Clone the repository
2. Obtain a Tavus API key from your Tavus account
3. Open `index.html` in a browser
4. Enter your Persona ID and Tavus API key
5. Click "Join the Game" to start the conversation

## Resources

- [Tavus Documentation](https://docs.tavus.io/)
- [Tavus CVI Overview](https://docs.tavus.io/sections/conversational-video-interface/what-is-cvi-overview)
- [Creating a Persona](https://docs.tavus.io/sections/conversational-video-interface/creating-a-persona)
- [Custom LLM Onboarding](https://docs.tavus.io/sections/conversational-video-interface/custom-llm-onboarding) 
