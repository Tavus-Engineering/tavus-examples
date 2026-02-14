# Interactions Protocol Playground
### [LIVE DEMO](https://andy-tavus.github.io/interactions-protocol-playground/)


The **Interactions Protocol Playground** web app allows users to interact with a Daily video room integrated with Tavus's backend for testing replica interactions. Specifically, it utilizes Tavus's [Interactions Protocol](https://docs.tavus.io/api-reference/interactions-protocol). Here's a breakdown of its components and interactions:

## 1. Room Management & Video Display
   - **Conversation ID Input**: Users enter a Tavus `conversation_id` in the input box and press the "Join" button to connect to that specific conversation room.
   - **Join/Leave Controls**: Dedicated Join and Leave buttons with proper state management - Join is disabled while connected, Leave is disabled when not connected.
   - **Video Display**: Central video container shows the replica participant's video feed with automatic audio playback when available.
   - **Dynamic Updates**: When a new conversation ID is entered, it updates all interaction text areas with the current ID.
   - **Error Handling**: Prevents duplicate Daily.js instances and provides user-friendly error messages.

## 2. Interaction Controls & Event Types
   The app provides four main interaction types, each with editable JSON payloads:

   - **Echo** (`conversation.echo`): Makes the replica speak specific text directly without processing through the LLM.
   - **Respond** (`conversation.respond`): Simulates user input that the replica will process and respond to naturally.
   - **Interrupt** (`conversation.interrupt`): Stops the replica from speaking immediately.
   - **Context Management**: Toggle between two context operations:
     - **Overwrite** (`conversation.overwrite_llm_context`): Replaces the entire conversational context
     - **Append** (`conversation.append_llm_context`): Adds information to the existing context

   - **Message Execution**: Each interaction uses the `executeCode` function to parse JSON from text areas and send via `callObject.sendAppMessage()`.

## 3. Comprehensive Event Logging
   - **Real-time Event Log**: All events (sent and received) are captured in a detailed table format showing:
     - **Timestamp**: Precise time in HH:MM:SS format
     - **Event Type**: Abbreviated event names with color coding
     - **Direction**: "F" (From Tavus) or "T" (To Tavus) indicating message direction
     - **Role**: Speaker role (user, replica, etc.)
     - **Text**: Extracted speech, text content, or context data
     - **Inference ID**: Truncated inference identifier for tracking

   - **Event Types Tracked**:
     - Speaking events: `user.started_speaking`, `user.stopped_speaking`, `replica.started_speaking`, `replica.stopped_speaking`
     - Content events: `conversation.utterance` (transcribed speech)
     - Control events: All interaction types sent to Tavus

   - **Visual Organization**: 
     - Color-coded events (cool colors for received, warm colors for sent)
     - Interactive legend explaining all event types and colors
     - Automatic scrolling to show latest events
     - Limited to 250 entries for performance

   - **Export Functionality**: CSV export of all logged events with full timestamps and details.

## 4. Technical Implementation
   - **Daily.js Integration**: Uses Daily.js SDK for video calling with proper cleanup and error handling
   - **Participant Management**: Automatically detects and displays existing participants in the room
   - **State Management**: Robust button state management and call object lifecycle handling
   - **Responsive Design**: Fixed video positioning with responsive layout

This setup provides a comprehensive testing environment for Tavus replica interactions, with detailed logging and real-time feedback for all conversation events.
