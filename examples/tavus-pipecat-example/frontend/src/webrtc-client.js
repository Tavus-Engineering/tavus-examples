/**
 * WebRTC Client for connecting to Pipecat bot
 */
export class WebRTCClient {
  constructor(serverUrl = 'http://localhost:8080') {
    this.serverUrl = serverUrl;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = new MediaStream();
    this.callbacks = {
      onTrack: null,
      onConnectionStateChange: null,
      onError: null
    };
  }

  /**
   * Initialize local media (camera + microphone)
   */
  async initializeLocalMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Could not access camera/microphone. Please grant permissions.');
    }
  }

  /**
   * Connect to the Pipecat bot
   */
  async connect() {
    try {
      // Ensure we have local media
      if (!this.localStream) {
        await this.initializeLocalMedia();
      }

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Add local tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle incoming tracks from bot
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        this.remoteStream.addTrack(event.track);
        if (this.callbacks.onTrack) {
          this.callbacks.onTrack(this.remoteStream);
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection.connectionState);
        if (this.callbacks.onConnectionStateChange) {
          this.callbacks.onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Create and send offer to Pipecat server
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.peerConnection.setLocalDescription(offer);

      // Wait for ICE gathering to complete
      if (this.peerConnection.iceGatheringState !== 'complete') {
        await new Promise((resolve) => {
          const checkState = () => {
            if (this.peerConnection.iceGatheringState === 'complete') {
              this.peerConnection.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          this.peerConnection.addEventListener('icegatheringstatechange', checkState);
          checkState();
          // Fallback timeout after 3 seconds
          setTimeout(resolve, 3000);
        });
      }

      console.log('Sending offer to Pipecat server...');
      
      // Send offer to Pipecat bot with the format it expects
      const response = await fetch(`${this.serverUrl}/api/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: this.peerConnection.localDescription.sdp,
          type: this.peerConnection.localDescription.type
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const answer = await response.json();
      console.log('Received answer from server:', answer);
      
      // The answer should have 'sdp' and 'type' fields
      if (!answer.sdp || !answer.type) {
        console.error('Invalid answer format:', answer);
        throw new Error('Invalid answer format from server');
      }
      
      // Set remote description
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          type: answer.type,
          sdp: answer.sdp
        })
      );

      console.log('WebRTC connection established');
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      throw error;
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Clear remote stream
    this.remoteStream.getTracks().forEach(track => track.stop());
    this.remoteStream = new MediaStream();

    console.log('Disconnected');
  }

  /**
   * Toggle microphone on/off
   */
  toggleMicrophone(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      return enabled;
    }
    return false;
  }

  /**
   * Toggle camera on/off
   */
  toggleCamera(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      return enabled;
    }
    return false;
  }

  /**
   * Get local media stream
   */
  getLocalStream() {
    return this.localStream;
  }

  /**
   * Get remote media stream
   */
  getRemoteStream() {
    return this.remoteStream;
  }

  /**
   * Set callback functions
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
    }
  }
}
