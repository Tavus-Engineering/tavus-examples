import { useState, useEffect, useRef, useMemo } from "react";
import {
  useDaily,
  DailyVideo,
  useParticipantIds,
  useLocalSessionId,
  useAudioTrack,
  DailyAudio,
  useAppMessage,
} from "@daily-co/daily-react";
import {
  createConversation,
  endConversation,
  overwriteConversationContext,
  createPersona,
} from "./api";
import type { IConversation } from "./types";

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
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const applyChromaKey = (currentTime: number) => {
      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(applyChromaKey);
        return;
      }

      lastFrameTime = currentTime;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        );

        gl.uniform1i(imageLocation, 0);
        gl.uniform3f(keyColorLocation, 3 / 255, 255 / 255, 156 / 255); // Standard chroma key green
        gl.uniform1f(thresholdLocation, 0.4); // Increased threshold for better keying

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      animationFrameId = requestAnimationFrame(applyChromaKey);
    };

    applyChromaKey(0);

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
      style={{ height: "800px", position: "relative", aspectRatio: "9 / 16" }}
    >
      <DailyVideo
        sessionId={id}
        type="video"
        ref={videoRef}
        style={{ height: "100%", display: "none" }}
        automirror
      />
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

// Pulsing Orb Component for user's speech
const PulsingOrb = ({ isActive }: { isActive: boolean }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "80px",
        right: "20px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: "#4CAF50",
        opacity: isActive ? 1 : 0.3,
        transform: isActive ? "scale(1.2)" : "scale(1)",
        transition: "all 0.2s ease-in-out",
        animation: isActive ? "pulse 1.5s ease-in-out infinite" : "none",
        zIndex: 30,
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

// Pulsing Background Component for AI's speech
const PulsingBackground = ({ isActive }: { isActive: boolean }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "25%", // Position at 1/4 from the top (so center is at 3/4 up)
        left: "50%",
        transform: `translate(-50%, -50%) scale(${isActive ? 1.1 : 1})`,
        width: "100px",
        height: "100px",
        backgroundColor: "#4CAF50",
        opacity: isActive ? 0.2 : 0,
        transition: "all 0.3s ease-in-out",
        animation: isActive
          ? "backgroundPulse 2s ease-in-out infinite"
          : "none",
        zIndex: -1,
        borderRadius: "50%", // Make it perfectly circular
      }}
    >
      <style>
        {`
          @keyframes backgroundPulse {
            0% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.3); }
            100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          }
        `}
      </style>
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
    const source = audioContext.createMediaStreamSource(
      new MediaStream([localAudio.track]),
    );
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
      console.log(data);

      // Handle AI speaking state
      if (data?.event_type === "conversation.replica.started_speaking") {
        setIsAISpeaking(true);
      } else if (data?.event_type === "conversation.replica.stopped_speaking") {
        setIsAISpeaking(false);
      }

      // Log all tool calls
      if (data?.event_type === "conversation.tool_call") {
        console.log("Tool call received:", {
          fromId: event.fromId,
          type: data.type,
          tool: data.tool,
          timestamp: new Date().toISOString(),
        });
      }

      // Handle click tool calls specifically
      if (
        data?.event_type === "conversation.tool_call" &&
        data?.properties?.name === "clickElement"
      ) {
        let args = JSON.parse(data.properties.arguments);
        console.log("Click tool call received:", {
          fromId: event.fromId,
          selector: args.selector,
          elementType: args.elementType,
          timestamp: new Date().toISOString(),
        });

        // Try to find and click the element
        try {
          const iframe = document.querySelector("iframe");
          if (iframe && iframe.contentDocument) {
            const element = iframe.contentDocument.querySelector(
              data.tool.function.arguments.selector,
            );
            if (element) {
              (element as HTMLElement).click();
              console.log(
                "Successfully clicked element:",
                data.tool.function.arguments.selector,
              );
            } else {
              console.warn(
                "Element not found:",
                data.tool.function.arguments.selector,
              );
            }
          }
        } catch (error) {
          console.error("Error executing click:", error);
        }
      }

      // Log tool call responses
      if (data?.type === "tool_call_response") {
        console.log("Tool call response:", {
          fromId: event.fromId,
          type: data.type,
          response: data.response,
          timestamp: new Date().toISOString(),
        });
      }
    },
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
            displaySurface: "browser",
            frameRate: 30,
          },
        });

        await daily?.startScreenShare({
          mediaStream: stream,
        });
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error("Screen sharing error:", error);
      alert(
        "Failed to toggle screen sharing. Please make sure you have granted screen sharing permissions.",
      );
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
        width: "280px", // Fixed width for the video container
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          marginBottom: "-0.5rem", // Negative margin to overlap with button container
        }}
      >
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
          zIndex: 10,
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
            animation:
              isMicEnabled && isUserSpeaking
                ? "buttonPulse 1.5s ease-in-out infinite"
                : "none",
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
          {!isMicEnabled
            ? "Mic is Off"
            : isUserSpeaking
              ? "Speaking..."
              : "Mic is On"}
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

/**
 * Main App component that manages the application state and UI
 * Handles:
 * - API token input and validation
 * - Starting/ending video calls
 * - Connection to Daily.co video service
 */
function App() {
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [personaId, setPersonaId] = useState<string | null>(() => {
    return localStorage.getItem("lastPersonaId");
  });
  const [url, setUrl] = useState("https://www.aerbits.ai");
  const DailyCall = useDaily();
  const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Function to create a new persona
  const handleCreatePersona = async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const persona = await createPersona(apiKey, {
        persona_name: "Interactive Web Assistant",
        system_prompt:
          "You are an AI assistant that helps users interact with webpages through screen sharing.",
        context:
          "You can interpret screen shares to provide guidance and assistance.",
        layers: {
          llm: {
            model: "tavus-gpt-4o",
          },
          perception: {
            enabled: true,
            screen_share: {
              enabled: true,
              interval_ms: 5000,
              quality: "high",
            },
          },
        },
      });

      setPersonaId(persona.persona_id);
      localStorage.setItem("lastPersonaId", persona.persona_id);
      alert("New persona created successfully!");
    } catch (error) {
      console.error("Failed to create persona:", error);
      alert(`Failed to create persona: ${error}`);
    }
    setLoading(false);
  };

  // Start a new video call session
  const handleStartCall = async () => {
    if (apiKey && DailyCall) {
      setLoading(true);
      try {
        const conversation = await createConversation(
          apiKey,
          personaId || undefined,
        );
        setConversation(conversation);
        console.log("conversation", conversation);
        await DailyCall.join({ url: conversation.conversation_url });
      } catch (error) {
        alert(`Failed to join the call. ${error}`);
      }
      setLoading(false);
    }
  };

  // Clean up and end the current call
  const handleLeaveCall = () => {
    DailyCall?.leave();
    if (conversation && apiKey) {
      endConversation(conversation.conversation_id, apiKey);
    }
    setConversation(null);
  };

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* URL Control Bar - Always visible */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "0.5rem",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "0.25rem",
            border: "1px solid #ccc",
            marginLeft: "1rem",
          }}
          placeholder="Enter URL to browse"
        />
        <button
          onClick={() => {
            const iframe = iframeRef.current;
            if (iframe) {
              iframe.src = url;
            }
          }}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
            marginRight: "1rem",
          }}
        >
          Load Page
        </button>
      </div>

      <iframe
        ref={iframeRef}
        src={url}
        style={{
          position: "absolute",
          top: "40px", // Add space for the URL bar
          left: 0,
          width: "100%",
          height: "calc(100% - 40px)", // Adjust height to account for URL bar
          border: "none",
          zIndex: 0,
        }}
        title="Background Content"
      />

      {!apiKey && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            padding: "20px",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
          }}
        >
          <p>
            Error: Tavus API key not found. Please add VITE_TAVUS_API_KEY to
            your .env file.
          </p>
        </div>
      )}

      {!conversation && !loading && apiKey && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "2rem",
            borderRadius: "1rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <button
            onClick={handleStartCall}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "25px",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              width: "100%",
              maxWidth: "400px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            Start Video Call
          </button>

          <button
            onClick={handleCreatePersona}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              width: "100%",
              maxWidth: "400px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
            }}
          >
            Create New Persona
          </button>

          {personaId && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "10px",
                fontSize: "14px",
                width: "100%",
                maxWidth: "400px",
                textAlign: "center",
              }}
            >
              Using Persona: {personaId}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p>Loading...</p>
        </div>
      )}

      {conversation && <Call onLeave={handleLeaveCall} />}
    </main>
  );
}

export default App;
