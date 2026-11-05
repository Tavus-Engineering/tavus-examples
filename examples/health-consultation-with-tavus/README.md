# Talk to an AI Doctor, Anytime

Need quick advice? Start a private online consultation with an AI-trained doctor—no waiting room required.

## Overview

This application demonstrates a simple videocall with a doctor. The application uses Tavus CVI to create an interactive AI host that responds to user inputs and performs actions through tool calls.

## Why a Persona is Required

A Tavus persona is essential for this application because it defines the AI's behavior and capabilities, particularly through tool calls. The persona configuration includes:
- The system prompt that gives the AI its role as a doctor
- The tool call definition that enables the AI to detect and process user question
- The context that helps the AI understand the situation

Without a properly configured persona, the AI wouldn't know how to recognize user guesses or trigger the card drawing functionality. The persona acts as the "brain" of the game, connecting user interactions to the game mechanics through tool calls.

## Technical Implementation

### Core Technologies

- React using JS and CSS for the frontend interface
- [Daily.co API](https://docs.daily.co/) for video communication
- [Tavus API](https://docs.tavus.io/) for creating and managing the AI persona

## Tool Call Implementation - Step by Step

The central feature of this demo is the implementation of tool calls and perception tool calls that allow the Tavus AI to interact with external systems. Here's how it works:

### 1. Persona Configuration

#### General Health Doctor

The persona is configured with a tool called `get_cures` that records the user's disease:

```json
{
  "type": "function",
  "function": {
    "name": "get_cures",
    "parameters": {
      "type": "object",
      "required": ["disease"],
      "properties": {
        "disease": {
          "type": "string",
          "description": "The disease which the user wanted to know how to cure"
        }
      }
    },
    "description": "Record the user's disease"
  }
}
```

This definition is crucial as it instructs the AI on what to listen for in user utterances. When a user says "What is the cure to X" (or phrases containing these words), the AI recognizes this as a disease that matches the tool's parameters and automatically triggers the tool call. The `description` field helps the AI understand when to use this tool. The AI uses this definition to map natural language inputs to structured function calls without requiring explicit programming for each possible user utterance variation.

#### Skin & Dermatology Doctor

The persona is configured with a tool called `get_skin_cures` that records the user's skin disease:

```json
{
  "type": "function",
  "function": {
    "name": "get_skin_cures",
    "parameters": {
      "type": "object",
      "required": ["disease"],
      "properties": {
        "disease": {
          "type": "string",
          "description": "The disease which the user wanted to know how to cure"
        }
      }
    },
    "description": "Record the user's disease"
  }
}
```

This definition is crucial as it instructs the AI on what to listen for in user utterances. When a user says "What is the cure to X" or "What is the solution to X" (or phrases containing these words), the AI recognizes this as a disease that matches the tool's parameters and automatically triggers the tool call. The `description` field helps the AI understand when to use this tool. The AI uses this definition to map natural language inputs to structured function calls without requiring explicit programming for each possible user utterance variation.

The persona is also configured with a perception tool called `acne_detected` that will triggered when acne is detected in user's face :

```json
{
  "type": "function",
  "function": {
    "name": "acne_detected",
    "description": "Use this function when acne is detected in the image with high confidence",
    "parameters": {
      "type": "object",
      "properties": {
        "have_acne": {
          "type": "boolean",
          "description": "is acne detected on user's face?"
        }
      },
      "required": [
        "have_acne"
      ]
    }
  }
}
```

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
  
  if (toolCall.name === 'get_cures') {
    // Process the tool call
  }

  if (toolCall.name === 'get_skin_cures') {
    // Process the tool call
  }
}
```

### 4. Perception Tool Call Detection

When a perception tool call is initiated by the AI, the app processes it:

```javascript
if (message.message_type === 'conversation' && message.event_type === 'conversation.perception_tool_call') {
  const toolCall = message.properties;
  
  if (perceptionToolCall.name === 'acne_detected') {
      // Process the perception tool call
  }
}
```

### 5. Parameter Extraction

The application extracts the user's guess from the tool call arguments:

```javascript
const args = JSON.parse(toolCall.arguments);
const disease = args.disease;
```

### 6. Answer Logic

The app then try to search the cure based on a dictionary

```javascript
const cureFor = {
  "cold": "Paracetamol",
  "flu": "Oseltamivir",
  "asthma": "Salbutamol",
  "migraine": "Sumatriptan",
  "depression": "Fluoxetine",
  "epilepsy": "Sodium Valproate"
};

const diseaseclear = disease.trim().toLowerCase();
const cure = cureFor[diseaseclear];
```

### 7. Response to AI

The result is sent back to the AI as an echo message:

```javascript
const responseMessage = {
  message_type: "conversation",
  event_type: "conversation.echo",
  conversation_id: message.conversation_id,
  properties: {
    text: `The cure for ${disease} is ${cure}.`
  }
};

call.sendAppMessage(responseMessage, '*');
```

This message allows the AI to continue the conversation with knowledge of the result.