import { useEffect, useRef, useState } from "react";
import {
  useDaily,
  useParticipantIds,
  useLocalSessionId,
  useAudioTrack,
  DailyAudio,
  useAppMessage,
} from "@daily-co/daily-react";
import { Video } from "./Video";
import { PulsingBackground } from "./PulsingBackground";

interface CallProps {
  onLeave: () => void;
}

export const Call: React.FC<CallProps> = ({ onLeave }) => {
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const localParticipantId = useLocalSessionId();
  const localAudio = useAudioTrack(localParticipantId);
  const daily = useDaily();
  const isMicEnabled = !localAudio.isOff;
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  // Set up audio analysis for user's speech detection
  useEffect(() => {
    if (!localAudio.track || !isMicEnabled) {
      setIsUserSpeaking(false);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(new MediaStream([localAudio.track]));
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    audioAnalyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setIsUserSpeaking(average > 30); // Adjust threshold as needed
      animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContext.close();
    };
  }, [localAudio.track, isMicEnabled]);

  // Add app message handler
  useAppMessage({
    onAppMessage: (event) => {
      const data = event.data;
      console.log(data)

      // Handle AI speaking state
      if (data?.event_type === 'conversation.replica.started_speaking') {
        setIsAISpeaking(true);
      } else if (data?.event_type === 'conversation.replica.stopped_speaking') {
        setIsAISpeaking(false);
      }
      
      // Log all tool calls
      if (data?.event_type === 'conversation.tool_call') {
        console.log('Tool call received:', {
          fromId: event.fromId,
          type: data.type,
          tool: data.tool,
          timestamp: new Date().toISOString()
        });
      }

      // Handle click tool calls specifically
      if (data?.event_type === 'conversation.tool_call' && data?.properties?.name === 'clickElement') {
        let args = JSON.parse(data.properties.arguments)
        console.log('Click tool call received:', {
          fromId: event.fromId,
          selector: args.selector,
          elementType: args.elementType,
          timestamp: new Date().toISOString()
        });

        // Try to find and click the element
        try {
          const iframe = document.querySelector('iframe');
          if (iframe && iframe.contentDocument) {
            const element = iframe.contentDocument.querySelector(data.tool.function.arguments.selector);
            if (element) {
              (element as HTMLElement).click();
              console.log('Successfully clicked element:', data.tool.function.arguments.selector);
            } else {
              console.warn('Element not found:', data.tool.function.arguments.selector);
            }
          }
        } catch (error) {
          console.error('Error executing click:', error);
        }
      }

      // Log tool call responses
      if (data?.type === 'tool_call_response') {
        console.log('Tool call response:', {
          fromId: event.fromId,
          type: data.type,
          response: data.response,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  const toggleMicrophone = () => {
    daily?.setLocalAudio(!isMicEnabled);
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await daily?.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        // Request screen sharing permission first
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'browser',
            frameRate: 30
          }
        });
        
        await daily?.startScreenShare({
          mediaStream: stream
        });
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      alert('Failed to toggle screen sharing. Please make sure you have granted screen sharing permissions.');
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "0px",
        right: "0px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        width: "280px"  // Fixed width for the video container
      }}
    >
      <div style={{ 
        position: "relative",
        width: "100%",
        marginBottom: "-0.5rem"  // Negative margin to overlap with button container
      }}>
        {remoteParticipantIds.length > 0 ? (
          <>
            <Video id={remoteParticipantIds[0]} />
            <PulsingBackground isActive={isAISpeaking} />
          </>
        ) : (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "10rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "spin 1s linear infinite" }}
              aria-label="Loading spinner"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              <title>Loading spinner</title>
            </svg>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "0.5rem",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "0.5rem",
          borderRadius: "0.5rem",
          width: "100%",
          boxSizing: "border-box",
          justifyContent: "space-between",
          zIndex: 10
        }}
      >
        <button
          type="button"
          onClick={toggleMicrophone}
          style={{
            flex: 1,
            padding: "0.5rem",
            backgroundColor: isMicEnabled ? "#4CAF50" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
            animation: isMicEnabled && isUserSpeaking ? "buttonPulse 1.5s ease-in-out infinite" : "none",
            transform: isUserSpeaking ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.2s ease-in-out",
          }}
        >
          <style>
            {`
              @keyframes buttonPulse {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
              }
            `}
          </style>
          {!isMicEnabled ? "Mic is Off" : isUserSpeaking ? "Speaking..." : "Mic is On"}
        </button>
        <button
          type="button"
          onClick={toggleScreenShare}
          style={{
            flex: 1,
            padding: "0.5rem",
            backgroundColor: isScreenSharing ? "#4CAF50" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
          }}
        >
          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
        <button
          type="button"
          onClick={onLeave}
          style={{
            flex: 1,
            padding: "0.5rem",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
          }}
        >
          Leave
        </button>
      </div>
      <DailyAudio />
    </div>
  );
}; 