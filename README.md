# Join Raw Stream

A technical demo showing how to connect to a [Daily.co](https://daily.co) / [Tavus](https://tavus.io) video call room and directly subscribe to participant video and audio streams, bypassing the standard join screen UI.

[LIVE DEMO](https://andy-tavus.github.io/join_raw_stream/)


## Implementation Overview

This demo leverages the [Daily.js](https://docs.daily.co/reference/daily-js) library to directly consume media streams from a Daily.co/Tavus room. The core functionality is implemented in vanilla JavaScript without additional frameworks.

### Key Components

#### 1. Initializing the Daily Call Object

```javascript
callObject = DailyIframe.createCallObject();

await callObject.join({ 
  url: roomUrl,
  userName: "Local" // Name of the joining participant
});
```

#### 2. Participant Discovery

The app waits for existing participants to be detected after joining:

```javascript
const participants = callObject.participants();
const existingParticipant = Object.values(participants).find(
  (participant) => participant.local === false
);
```

#### 3. Direct Stream Subscription

Instead of using Daily's standard UI components, this demo directly accesses the WebRTC media tracks:

```javascript
// For video
if (existingParticipant.tracks.video.state === 'playable') {
  const videoElement = document.getElementById('participant-video');
  videoElement.srcObject = new MediaStream([existingParticipant.tracks.video.persistentTrack]);
}

// For audio
if (existingParticipant.tracks.audio.state === 'playable') {
  const audioStream = new MediaStream([existingParticipant.tracks.audio.persistentTrack]);
  const audio = new Audio();
  audio.srcObject = audioStream;
  audio.autoplay = true;
}
```

## Technical Details

- Uses `DailyIframe.createCallObject()` instead of embedding a Daily iframe
- Accesses raw `persistentTrack` properties to get WebRTC MediaStreamTracks
- Creates new MediaStream objects to assign to standard HTML5 media elements
- No complex UI state management - focuses purely on demonstrating the streaming capabilities

## Use Cases

- Integration with custom UIs where Daily's built-in interface isn't desired
- Headless connection to Daily/Tavus rooms for specialized applications
- Technical demonstrations of Daily.js API capabilities

## Getting Started

1. Clone this repository
2. Open `index.html` in a browser
3. Enter a valid Daily.co/Tavus room URL
4. Examine the console logs to see participant data
