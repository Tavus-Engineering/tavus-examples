# Tavus Custom Meeting End Message Demo

This demo shows how to implement custom end messages for Tavus video meetings using Daily.co's JavaScript SDK.

[LIVE DEMO](https://andy-tavus.github.io/custom_ending_message/)

## Overview

When a video meeting ends, Daily.co shows default messages like these:

![Default "You've left the call" message](https://cdn.zappy.app/37bf5d70c064b3b9a0da837dfe4a9f33.png)
![Default "Have a nice day!" message](https://cdn.zappy.app/1a1aaf1a8b1fe0b32d854d1da3696ac1.png)

This demo replaces these default messages with custom ones for different end scenarios:

1. User voluntarily leaving the meeting
2. Meeting ending due to an error
3. Host ending the meeting

## Implementation Details

The implementation uses Daily.co's JavaScript SDK to:
- Create and manage the video meeting iframe
- Listen for meeting end events
- Replace the default end messages with custom ones based on the end scenario

### How It Works

The key to replacing Daily.co's default end messages is timing and DOM manipulation:

1. We set up event listeners that fire before Daily.co shows their default messages
2. When an end event occurs, we immediately:
   - Clear the Daily.co iframe from the DOM (`meetingArea.innerHTML = ''`)
   - Show our own message div instead
   - This prevents Daily.co's default UI from appearing

### Key Components

1. **HTML Structure**
   ```html
   <!-- Container for Daily.co's iframe -->
   <div id="meetingArea"></div>
   <!-- Our custom message div (hidden by default) -->
   <div id="endMessage" style="display:none;"></div>
   ```

2. **Event Listeners**
   - `left-meeting`: Triggered when user leaves the meeting
   - `error`: Triggered when an error ends the meeting
   - `nonfatal-error`: Triggered when host ends the meeting (check for `action === 'end-meeting'`)

3. **Message Display**
   - Uses a dedicated div that's hidden by default
   - Shows different messages based on the end scenario
   - Clears the meeting iframe when showing the end message

## How to Use

1. Clone this repository
2. Open `index.html` in a web browser
3. Enter a valid Daily.co room URL
4. Click "Join" to start the meeting
5. Test different end scenarios to see custom messages

## Customization

To customize the end messages, modify the text in the event listeners in `index.html`:

```javascript
callFrame.on('left-meeting', () => {
  showEndMessage('You left the meeting.');
});

callFrame.on('error', (e) => {
  showEndMessage('The meeting ended due to an error.');
});

callFrame.on('nonfatal-error', (e) => {
  if (e?.action === 'end-meeting') {
    showEndMessage('The meeting was ended by the host.');
  }
});
```

## Resources

- [Tavus Documentation](https://docs.tavus.io)
- [Daily.co JavaScript SDK Documentation](https://docs.daily.co/reference/daily-js)
- [Source Code](https://github.com/andy-tavus/custom_ending_message) 
