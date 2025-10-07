import React, { useEffect, useRef, useState } from 'react';
import { WebRTCClient } from '../webrtc-client';
import './VideoConversation.css';

function VideoConversation() {
  const [hasStarted, setHasStarted] = useState(false); // Track if user has clicked connect
  const [connectionState, setConnectionState] = useState('idle'); // idle, connecting, connected, error
  const [error, setError] = useState('');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  
  const webrtcClient = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (webrtcClient.current) {
        webrtcClient.current.disconnect();
      }
    };
  }, []);

  const handleConnect = async () => {
    setHasStarted(true);
    setConnectionState('connecting');
    await startConversation();
  };

  const startConversation = async () => {
    try {
      // Initialize WebRTC client
      webrtcClient.current = new WebRTCClient('http://localhost:8080');
      
      // Set up callbacks
      webrtcClient.current.on('track', (remoteStream) => {
        console.log('Remote stream received');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      webrtcClient.current.on('connectionStateChange', (state) => {
        console.log('Connection state:', state);
        if (state === 'connected') {
          setConnectionState('connected');
        } else if (state === 'failed' || state === 'disconnected') {
          setError('Connection lost');
          setConnectionState('error');
        }
      });

      webrtcClient.current.on('error', (err) => {
        console.error('WebRTC error:', err);
        setError(err.message);
        setConnectionState('error');
      });

      // Initialize media and connect
      await webrtcClient.current.initializeLocalMedia();
      
      // Show local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = webrtcClient.current.getLocalStream();
      }
      
      await webrtcClient.current.connect();
      
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError(err.message || 'Failed to start conversation');
      setConnectionState('error');
    }
  };

  const handleDisconnect = () => {
    if (webrtcClient.current) {
      webrtcClient.current.disconnect();
    }
    setHasStarted(false);
    setConnectionState('idle');
    setError('');
  };

  const toggleMic = () => {
    if (webrtcClient.current) {
      const newState = !isMicEnabled;
      webrtcClient.current.toggleMicrophone(newState);
      setIsMicEnabled(newState);
    }
  };

  const toggleCamera = () => {
    if (webrtcClient.current) {
      const newState = !isCameraEnabled;
      webrtcClient.current.toggleCamera(newState);
      setIsCameraEnabled(newState);
    }
  };

  return (
    <div className="home-box-new">
      <div className="home-box">
        <div className="support-design">
          <div className="support-design-box">
            <div className="os_line_wrap">
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
            </div>
            <p className="text-size-tiny text-type-raster hero-type">CVI Portal</p>
            <div className="os_line_wrap">
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
              <div className="os_line"></div>
            </div>
          </div>
        </div>

        <div className="hero-support-wrap">
          <div className="hero_video-wrap">
            <div className="video-container">
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                className="video-stream"
              />
              
              {/* Local video preview in corner */}
              {hasStarted && (
                <div className="local-video-preview">
                  <video 
                    ref={localVideoRef}
                    autoPlay 
                    muted 
                    playsInline
                    className="local-video"
                  />
                  <span className="local-video-label">You</span>
                </div>
              )}
              
              {connectionState === 'idle' && (
                <div className="video-overlay initial">
                  <div className="connect-prompt">
                    <svg className="phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>Ready to Connect</h3>
                    <p>Start your Conversation with Pipecat and Tavus</p>
                    <button onClick={handleConnect} className="connect-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                      </svg>
                      Connect
                    </button>
                  </div>
                </div>
              )}

              {connectionState === 'connecting' && (
                <div className="video-overlay">
                  <div className="spinner"></div>
                  <p>Connecting to AI Assistant...</p>
                </div>
              )}

              {connectionState === 'error' && (
                <div className="video-overlay error">
                  <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p>{error || 'Connection failed'}</p>
                  <button onClick={handleConnect} className="retry-btn">
                    Retry Connection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status and Controls Bar - Only show when started */}
      {hasStarted && (
        <div className="video-controls-bar">
          <div className="status-indicator">
            <span className={`status-dot ${connectionState}`}></span>
            <span className="status-text">
              {connectionState === 'connecting' && 'Connecting...'}
              {connectionState === 'connected' && 'Connected'}
              {connectionState === 'error' && 'Disconnected'}
            </span>
          </div>

          <div className="video-controls">
            <button 
              className={`control-button ${!isMicEnabled ? 'disabled' : ''}`}
              onClick={toggleMic}
              title={isMicEnabled ? 'Mute' : 'Unmute'}
              disabled={connectionState !== 'connected'}
            >
              {isMicEnabled ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                </svg>
              )}
            </button>

            <button 
              className={`control-button ${!isCameraEnabled ? 'disabled' : ''}`}
              onClick={toggleCamera}
              title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              disabled={connectionState !== 'connected'}
            >
              {isCameraEnabled ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
                </svg>
              )}
            </button>

            <button 
              className="control-button disconnect"
              onClick={handleDisconnect}
              title="Disconnect"
              disabled={connectionState === 'error'}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoConversation;