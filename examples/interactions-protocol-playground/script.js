let callObject = null;

// Global error handler for uncaught errors (including Daily.js errors)
window.addEventListener('error', function(event) {
  if (event.error && event.error.message && event.error.message.includes('Duplicate DailyIframe instances')) {
    event.preventDefault(); // Prevent the error from being logged to console
    alert('Error: Cannot create multiple video calls simultaneously. Please leave the current call before joining a new one.');
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.message && event.reason.message.includes('Duplicate DailyIframe instances')) {
    event.preventDefault();
    alert('Error: Cannot create multiple video calls simultaneously. Please leave the current call before joining a new one.');
  }
});

async function joinRoom(conversationId) {
  // If there's an existing call object, properly leave and destroy it first
  if (callObject) {
    try {
      console.log('Leaving existing room...');
      await callObject.leave();
      callObject.destroy();
      callObject = null;
      console.log('Successfully left and destroyed previous room');
    } catch (err) {
      console.error('Error leaving previous room:', err);
      // Force cleanup even if leave fails
      if (callObject) {
        try {
          callObject.destroy();
        } catch (destroyErr) {
          console.error('Error destroying call object:', destroyErr);
        }
        callObject = null;
      }
    }
  }

  try {
    // Create the call object
    callObject = DailyIframe.createCallObject();

    // Set up event listeners before joining
    callObject.on('app-message', (message) => {
      console.log('Received app-message:', message);
      appendToLog(message.data);
    });

    // Listen for call state changes
    callObject.on('left-meeting', () => {
      console.log('Left the meeting');
      updateButtonStates(false); // Enable Join button, disable Leave button
    });

    // Join the room
    await callObject.join({ 
      url: `https://tavus.daily.co/${conversationId}`,
      userName: "Local" // Specify the name of the joining participant
    });
    
    console.log(`Successfully joined room: ${conversationId}`);
    updateButtonStates(true); // Enable Leave button, disable Join button
    
    // Add a delay before checking for participants
    setTimeout(() => {
      checkForExistingParticipant();
    }, 1500); // Wait for 1.5 seconds before checking
    
  } catch (err) {
    console.error('Error joining the room:', err);
    alert('Failed to join the call. Please check the conversation ID.');
    updateButtonStates(false); // Keep Join enabled, Leave disabled on error
    
    // Clean up on error
    if (callObject) {
      try {
        callObject.destroy();
      } catch (destroyErr) {
        console.error('Error destroying call object after join failure:', destroyErr);
      }
      callObject = null;
    }
  }
}

function checkForExistingParticipant() {
  const participants = callObject.participants();
  console.log('Participants:', participants);

  const existingParticipant = Object.values(participants).find(
    (participant) => participant.local === false
  );

  if (existingParticipant) {
    console.log(`Existing participant found: ${existingParticipant.user_id}`);

    // Subscribe to the participant's video and audio tracks
    if (existingParticipant.tracks.video.state === 'playable') {
      const videoElement = document.getElementById('participant-video');
      videoElement.srcObject = new MediaStream([existingParticipant.tracks.video.persistentTrack]);
    } else {
      console.log('No playable video track for existing participant.');
    }

    if (existingParticipant.tracks.audio.state === 'playable') {
      const audioStream = new MediaStream([existingParticipant.tracks.audio.persistentTrack]);
      const audio = new Audio();
      audio.srcObject = audioStream;
      audio.autoplay = true;
    } else {
      console.log('No playable audio track for existing participant.');
    }
  } else {
    console.log('No existing participant found.');
  }
}

async function joinNewRoom() {
  const conversationId = document.getElementById('conversation-id').value;

  if (conversationId.trim() === "") {
    alert("Please enter a valid conversation ID.");
    return;
  }

  await joinRoom(conversationId);
  updateTextAreas();
}

function updateTextAreas() {
  const conversation_id = document.getElementById('conversation-id').value || "c123456";

  document.getElementById('echo-box').value = `sendAppMessage({
    "message_type": "conversation",
    "event_type": "conversation.echo",
    "conversation_id": "${conversation_id}",
    "properties": {
      "text": "This is the text the replica will speak."
    }
  });`;

  document.getElementById('respond-box').value = `sendAppMessage({
    "message_type": "conversation",
    "event_type": "conversation.respond",
    "conversation_id": "${conversation_id}",
    "properties": {
      "text": "This is text the replica will respond to, as if the user in the meeting spoke it."
    }
  });`;

  document.getElementById('interrupt-box').value = `sendAppMessage({
    "message_type": "conversation",
    "event_type": "conversation.interrupt",
    "conversation_id": "${conversation_id}"
  });`;

  updateContextBox();
}

function updateContextBox() {
  const conversation_id = document.getElementById('conversation-id').value || "c123456";
  const mode = document.querySelector('input[name="context-mode"]:checked').value;
  const contextBox = document.getElementById('context-box');
  const contextButton = document.getElementById('context-button');
  
  if (mode === 'overwrite') {
    contextBox.value = `sendAppMessage({
    "message_type": "conversation",
    "event_type": "conversation.overwrite_llm_context",
    "conversation_id": "${conversation_id}",
    "properties": {
    "context": "This text is the context that will be used to overwrite the existing conversational context."
  }
});`;
    contextButton.textContent = 'overwrite_llm_context';
  } else {
    contextBox.value = `sendAppMessage({
  "message_type": "conversation",
  "event_type": "conversation.append_llm_context",
  "conversation_id": "${conversation_id}",
  "properties": {
    "context": "This text is the context that will be appended to the existing conversational context."
    }
  });`;
    contextButton.textContent = 'append_llm_context';
  }
}

function executeCode(textAreaId) {
  try {
    if (!callObject) {
      console.error("callObject is not initialized. Please join a room first.");
      alert("Please join a room before sending messages.");
      return;
    }

    const code = document.getElementById(textAreaId).value;
    const match = code.match(/sendAppMessage\(\s*({[\s\S]*})\s*\);/);

    if (match && match[1]) {
      const messageData = eval(`(${match[1]})`);
      callObject.sendAppMessage(messageData);
      console.log("Message sent:", messageData);
      
      // Log the sent message
      logEvent(messageData, 'S');
    } else {
      console.error("Invalid sendAppMessage format.");
    }
  } catch (err) {
    console.error('Error executing the code:', err);
  }
}

let logEntries = [];

// Initialize button states on page load
document.addEventListener('DOMContentLoaded', function() {
  updateButtonStates(false); // Initially, Join is enabled, Leave is disabled
});

function getEventTypeAbbreviation(eventType) {
  const abbreviations = {
    'conversation.user.started_speaking': 'U-Start',
    'conversation.user.stopped_speaking': 'U-Stop',
    'conversation.replica.started_speaking': 'R-Start',
    'conversation.replica.stopped_speaking': 'R-Stop',
    'conversation.utterance': 'Utterance',
    'conversation.echo': 'Echo',
    'conversation.respond': 'Respond',
    'conversation.interrupt': 'Interrupt',
    'conversation.overwrite_llm_context': 'Overwrite',
    'conversation.append_llm_context': 'Append'
  };
  return abbreviations[eventType] || eventType;
  }

function getEventTypeColor(eventType, direction) {
  // Group similar events and use warm/cool colors based on direction
  const eventGroups = {
    // From Tavus (received events) - cooler colors
    'conversation.user.started_speaking': '#7dd3fc', // light blue
    'conversation.user.stopped_speaking': '#7dd3fc', // same as u-start
    'conversation.replica.started_speaking': '#86efac', // light green  
    'conversation.replica.stopped_speaking': '#86efac', // same as r-start
    'conversation.utterance': '#a5b4fc', // indigo
    
    // To Tavus (sent events) - warmer colors
    'conversation.echo': '#fbbf24', // amber
    'conversation.respond': '#f97316', // orange
    'conversation.interrupt': '#ef4444', // red
    'conversation.overwrite_llm_context': '#d946ef', // fuchsia
    'conversation.append_llm_context': '#ec4899' // pink
  };
  
  return eventGroups[eventType] || (direction === 'F' ? '#94a3b8' : '#fbbf24'); // default colors
}

function extractText(data) {
  if (data.properties?.speech) return data.properties.speech;
  if (data.properties?.text) return data.properties.text;
  if (data.properties?.context) return data.properties.context;
  if (data.properties?.duration) return `${data.properties.duration}s`;
  return '-';
}

function logEvent(data, direction) {
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  const eventType = getEventTypeAbbreviation(data.event_type);
  const role = data.properties?.role || '-';
  const text = extractText(data);
  const inferenceId = data.inference_id || '-';
  
  logEntries.push({
    timestamp: new Date(),
    displayTime: timestamp,
    eventType,
    originalEventType: data.event_type,
    direction,
    role,
    text,
    inferenceId
  });
  
  // Keep only last 250 entries
  if (logEntries.length > 250) {
    logEntries = logEntries.slice(-250);
  }
  
  updateLogDisplay();
}

function updateLogDisplay() {
  logEntries.sort((a, b) => a.timestamp - b.timestamp);

  const logContent = document.getElementById('log-content');
  
  // Create table HTML
  let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background: #333; color: #f1f1f1;">
          <th style="padding: 4px; border: 1px solid #df44a6; text-align: left;">Time</th>
          <th style="padding: 4px; border: 1px solid #df44a6; text-align: left;">Event</th>
          <th style="padding: 4px; border: 1px solid #df44a6; text-align: center;">F/T</th>
          <th style="padding: 4px; border: 1px solid #df44a6; text-align: left;">Role</th>
          <th style="padding: 4px; border: 1px solid #df44a6; text-align: left;">Text</th>
          <th style="padding: 4px; border: 1px solid #df44a6; text-align: left;">Inference ID</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  logEntries.forEach(entry => {
    const eventColor = getEventTypeColor(entry.originalEventType, entry.direction);
    const truncatedInferenceId = entry.inferenceId && entry.inferenceId.length > 8 ? 
      entry.inferenceId.substring(0, 8) + '...' : entry.inferenceId;
    const displayDirection = entry.direction === 'R' ? 'F' : 'T'; // R->F (From), S->T (To)
    
    tableHTML += `
      <tr style="border-bottom: 1px solid #444;">
        <td style="padding: 2px 4px; border: 1px solid #444; white-space: nowrap;">${entry.displayTime}</td>
        <td style="padding: 2px 4px; border: 1px solid #444; white-space: nowrap; color: ${eventColor};">${entry.eventType}</td>
        <td style="padding: 2px 4px; border: 1px solid #444; text-align: center;">${displayDirection}</td>
        <td style="padding: 2px 4px; border: 1px solid #444;">${entry.role}</td>
        <td style="padding: 2px 4px; border: 1px solid #444; word-wrap: break-word; max-width: 300px;">${entry.text}</td>
        <td style="padding: 2px 4px; border: 1px solid #444; white-space: nowrap; font-family: monospace; font-size: 10px;" title="${entry.inferenceId}">${truncatedInferenceId}</td>
      </tr>
    `;
  });

  tableHTML += '</tbody></table>';
  logContent.innerHTML = tableHTML;
  logContent.scrollTop = logContent.scrollHeight;
}

function appendToLog(data) {
  logEvent(data, 'R');
}

function exportLogToCSV() {
  if (logEntries.length === 0) {
    alert('No log entries to export');
    return;
  }
  
  // Create CSV content
  const headers = ['Timestamp', 'Event Type', 'From/To Tavus', 'Role', 'Text', 'Inference ID'];
  const csvContent = [
    headers.join(','),
    ...logEntries.map(entry => [
      entry.displayTime,
      `"${entry.eventType}"`,
      entry.direction === 'R' ? 'From' : 'To',
      `"${entry.role}"`,
      `"${entry.text.replace(/"/g, '""')}"`, // Escape quotes in CSV
      `"${entry.inferenceId}"`
    ].join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tavus-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showLegend() {
  document.getElementById('legend-modal').style.display = 'block';
  return false; // Prevent default link behavior
}

function hideLegend() {
  document.getElementById('legend-modal').style.display = 'none';
}

function updateButtonStates(isJoined) {
  const joinButton = document.getElementById('join-button');
  const leaveButton = document.getElementById('leave-button');
  
  if (isJoined) {
    joinButton.disabled = true;
    leaveButton.disabled = false;
  } else {
    joinButton.disabled = false;
    leaveButton.disabled = true;
  }
}

async function leaveRoom() {
  if (callObject) {
    console.log('Leaving the room...');
    try {
      await callObject.leave();
      console.log('Successfully left the room');
      
      // Destroy the call object to prevent duplicate instances
      callObject.destroy();
      callObject = null;
      
      updateButtonStates(false); // Enable Join button, disable Leave button
      
      // Clear the video element
      const videoElement = document.getElementById('participant-video');
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }
    } catch (err) {
      console.error('Error leaving the room:', err);
      
      // Force cleanup even if leave fails
      if (callObject) {
        try {
          callObject.destroy();
        } catch (destroyErr) {
          console.error('Error destroying call object:', destroyErr);
        }
        callObject = null;
      }
      
      updateButtonStates(false); // Reset button states even on error
      
      // Clear the video element even on error
      const videoElement = document.getElementById('participant-video');
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }
    }
  }
}
