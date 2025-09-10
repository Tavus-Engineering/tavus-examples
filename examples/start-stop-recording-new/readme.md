# Tavus Conversation Start/Stop Recording Demo

A demonstration application showcasing how to integrate the Daily.co JavaScript SDK for video calls with Tavus Conversation recording functionality.

[LIVE DEMO](https://andy-tavus.github.io/start-stop-recording/)

## Technical Overview

This demo illustrates how to:
1. Create and join a Daily.co video call (Tavus Conversation)
2. Programmatically control cloud recording via the Daily.js API
3. Configure S3 bucket storage for recordings

## Implementation Details

### Daily.co SDK Integration

The application uses the `daily-js` library loaded from CDN:

```js
<script src="https://unpkg.com/@daily-co/daily-js"></script>
```

### Call Frame Initialization

The video call is rendered within a container div using the Daily.js SDK:

```js
callFrame = DailyIframe.createFrame(videoFrame, {
  showLeaveButton: true,
});
```

### Joining a Tavus Conversation

When a user clicks the join button, the application:

```js
callFrame.join({ url: ConversationURL }).then(() => {
  statusDiv.textContent = "Joined Conversation successfully!";
  startRecordingButton.disabled = false;
  stopRecordingButton.disabled = false;
}).catch((error) => {
  statusDiv.textContent = "Failed to join Conversation: " + error.message;
});
```

### Recording Control API

Start recording with cloud storage:

```js
callFrame.startRecording({ recordingType: "cloud" });
```

Stop recording:

```js
callFrame.stopRecording();
```

## S3 Configuration Requirements

For cloud recording to work, users must configure:
- AWS S3 bucket for recording storage
- Proper IAM roles and permissions
- Recording parameters in the Tavus Conversation creation API:
  ```json
  {
    "enable_recording": true,
    "recording_s3_bucket_name": "your-bucket-name",
    "recording_s3_bucket_region": "your-bucket-region",
    "aws_assume_role_arn": "your-role-arn"
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
  ```

## Usage Flow

1. Configure S3 bucket following Daily.co documentation
2. Create a Tavus Conversation with recording enabled
3. Use this demo to join the conversation
4. ccc 
5. Recordings are stored in your configured S3 bucket

## Technical Requirements

- Modern browser with WebRTC support
- Valid Tavus Conversation URL
- Properly configured AWS S3 bucket with appropriate permissions
