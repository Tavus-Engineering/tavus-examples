import { useState, useEffect, useRef, useMemo } from "react";
import {
  useDaily,
  DailyVideo,
  useParticipantIds,
  useLocalSessionId,
  useAudioTrack,
  DailyAudio,
} from "@daily-co/daily-react";
import { createConversation } from "./api/createConversation";
import type { IConversation } from "./types";
import { endConversation } from "./api";

/**
 * WebGL Shader Programs for Chroma Key Effect
 *
 * The vertex shader transforms vertex positions and maps texture coordinates.
 * It receives vertex positions and texture coordinates as input attributes,
 * and outputs the transformed texture coordinates to the fragment shader.
 */
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y); // Flip Y coordinate for WebGL
  }
`;

/**
 * Fragment shader that implements the chroma key (green screen) effect.
 * It samples the video texture and removes pixels matching the key color
 * within a certain threshold, making them transparent.
 *
 * @param u_image - The video texture sampler
 * @param u_keyColor - The RGB color to key out (typically green)
 * @param u_threshold - How close a pixel needs to be to the key color to be removed
 */
const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  uniform vec3 u_keyColor;
  uniform float u_threshold;
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    float diff = length(color.rgb - u_keyColor); // Calculate color difference
    gl_FragColor = diff < u_threshold ? vec4(0.0) : color; // Make matching pixels transparent
  }
`;

/**
 * Helper function to create and compile a WebGL shader
 */
const initShader = (
  gl: WebGLRenderingContext, // The WebGL context
  type: number, // The type of shader (vertex or fragment)
  source: string, // The GLSL source code for the shader
) => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

/**
 * Initializes the WebGL context with necessary buffers, attributes and uniforms
 * for the chroma key effect. Sets up:
 * - Shader program with vertex and fragment shaders
 * - Vertex position and texture coordinate buffers
 * - Texture for video frames
 */
const initWebGL = (gl: WebGLRenderingContext) => {
  // Create and link shader program
  const program = gl.createProgram()!;
  gl.attachShader(
    program,
    initShader(gl, gl.VERTEX_SHADER, vertexShaderSource),
  );
  gl.attachShader(
    program,
    initShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource),
  );
  gl.linkProgram(program);
  gl.useProgram(program);

  // Set up vertex positions for a full-screen quad
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), // Vertices for quad
    gl.STATIC_DRAW,
  );

  // Set up texture coordinates to map video to quad
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), // UV coordinates
    gl.STATIC_DRAW,
  );

  // Connect position and texture coordinate attributes
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Create and configure texture for video frames
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return {
    program,
    texture,
    imageLocation: gl.getUniformLocation(program, "u_image"),
    keyColorLocation: gl.getUniformLocation(program, "u_keyColor"),
    thresholdLocation: gl.getUniformLocation(program, "u_threshold"),
  };
};

/**
 * Video component that applies real-time chroma key effect to the video stream
 * Uses WebGL for hardware-accelerated processing
 */
export const Video: React.FC<{ id: string }> = ({ id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  // Initialize WebGL context and resources when canvas is available
  const webGLContext = useMemo(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const gl = canvas.getContext("webgl", {
        premultipliedAlpha: false, // Required for correct alpha blending
        alpha: true, // Enable transparency
      });
      if (gl) {
        glRef.current = gl;
        return initWebGL(gl);
      }
    }
    return null;
  }, [canvasRef.current]);

  // Monitor video element for when it's ready to play
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const checkVideoReady = () => {
        // readyState values:
        // 0 = HAVE_NOTHING - no data available
        // 1 = HAVE_METADATA - metadata loaded
        // 2 = HAVE_CURRENT_DATA - data for current frame available
        // 3 = HAVE_FUTURE_DATA - data for current and next frame available
        // 4 = HAVE_ENOUGH_DATA - enough data available to start playing
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          setIsVideoReady(true);
          video.removeEventListener("canplay", checkVideoReady);
        }
      };
      video.addEventListener("canplay", checkVideoReady);
      return () => video.removeEventListener("canplay", checkVideoReady);
    }
  }, []);

  // Main render loop that applies the chroma key effect
  useEffect(() => {
    if (!isVideoReady || !webGLContext) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!video || !canvas || !gl) return;

    const {
      program,
      texture,
      imageLocation,
      keyColorLocation,
      thresholdLocation,
    } = webGLContext;

    let animationFrameId: number;
    let lastFrameTime = 0;
    const targetFPS = 30; // Limit framerate to reduce CPU usage
    const frameInterval = 1000 / targetFPS;

    /**
     * Main animation loop that processes each video frame
     * Applies chroma key effect and renders to canvas
     */
    const applyChromaKey = (currentTime: number) => {
      // Throttle frame rate
      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(applyChromaKey);
        return;
      }

      lastFrameTime = currentTime;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Match canvas size to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Update texture with new video frame
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        );

        // Configure chroma key parameters
        gl.uniform1i(imageLocation, 0);
        gl.uniform3f(keyColorLocation, 3 / 255, 255 / 255, 156 / 255); // Green screen RGB color
        gl.uniform1f(thresholdLocation, 0.3); // Sensitivity of color matching

        // Render the processed frame
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      animationFrameId = requestAnimationFrame(applyChromaKey);
    };

    applyChromaKey(0);

    // Clean up WebGL resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (gl && program && texture) {
        gl.deleteProgram(program);
        gl.deleteTexture(texture);
      }
    };
  }, [isVideoReady, webGLContext]);

  return (
    <div
      style={{ height: "20rem", position: "relative", aspectRatio: "16 / 9" }}
    >
      {/* Hidden video element that provides the source frames */}
      <DailyVideo
        sessionId={id}
        type="video"
        ref={videoRef}
        style={{ height: "13rem", display: "none" }}
      />
      {/* Canvas where we render the processed video with chroma key effect */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

/**
 * Call component that manages the video call interface and controls
 * Handles participant video display and audio controls
 */
export const Call = ({ onLeave }: { onLeave: () => void }) => {
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const localParticipantId = useLocalSessionId();
  const localAudio = useAudioTrack(localParticipantId);
  const daily = useDaily();
  const isMicEnabled = !localAudio.isOff;

  const toggleMicrophone = () => {
    daily?.setLocalAudio(!isMicEnabled);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
      }}
    >
      <div style={{ position: "relative" }}>
        {remoteParticipantIds.length > 0 ? (
          <Video id={remoteParticipantIds[0]} />
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
          position: "absolute",
          top: "0",
          right: "0",
          zIndex: "10",
          minWidth: "8rem",
        }}
      >
        <button
          type="button"
          onClick={toggleMicrophone}
          style={{
            padding: "0.25rem",
          }}
        >
          {!isMicEnabled ? "Mic is Off" : "Mic is On"}
        </button>
        <button
          type="button"
          onClick={onLeave}
          style={{
            padding: "0.25rem",
          }}
        >
          Leave
        </button>
      </div>
      <DailyAudio />
    </div>
  );
};

/**
 * Main App component that manages the application state and UI
 * Handles:
 * - API token input and validation
 * - Starting/ending video calls
 * - Connection to Daily.co video service
 */
function App() {
  const [token, setToken] = useState("");
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const DailyCall = useDaily();

  // Start a new video call session
  const handleStartCall = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (token && DailyCall) {
      setLoading(true);
      try {
        const conversation = await createConversation(token);
        await DailyCall.join({ url: conversation.conversation_url });
        setConversation(conversation);
      } catch (error) {
        alert(`Failed to join the call. ${error}`);
      }
      setLoading(false);
    } else {
      console.error("Token is required to start the call");
    }
  };

  // Clean up and end the current call
  const handleLeaveCall = () => {
    DailyCall?.leave();
    endConversation(conversation!.conversation_id, token);
    setConversation(null);
  };

  // Mask API token for security
  const getDisplayToken = () => {
    return token.length > 4 ? `****${token.slice(-4)}` : token;
  };

  return (
    <main>
      <form onSubmit={handleStartCall} className="token-form">
        <label htmlFor="token">
          Enter your Tavus API token to start, or{" "}
          <a
            href="https://platform.tavus.io/api-keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            create a new one.
          </a>
        </label>
        <div>
          <input
            id="token"
            type="text"
            value={conversation ? getDisplayToken() : token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter token"
            disabled={!!conversation}
          />
          <button disabled={!token || loading || !!conversation} type="submit">
            {loading ? "Loading..." : "Start Video Call"}
          </button>
        </div>
      </form>

      {conversation && <Call onLeave={handleLeaveCall} />}
    </main>
  );
}

export default App;
