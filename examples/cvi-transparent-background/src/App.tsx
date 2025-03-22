import { useState, useRef } from "react";
import { useDaily } from "@daily-co/daily-react";
import { Call } from "./components/Call";
import { createConversation, endConversation, createPersona } from "./api";
import type { IConversation } from "./types";

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
    return localStorage.getItem('lastPersonaId');
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
        system_prompt: "You are an AI assistant that helps users interact with webpages through screen sharing.",
        context: "You can interpret screen shares to provide guidance and assistance.",
        layers: {
          llm: {
            model: "tavus-gpt-4o"
          }
        }
      });

      setPersonaId(persona.persona_id);
      localStorage.setItem('lastPersonaId', persona.persona_id);
      alert('New persona created successfully!');
    } catch (error) {
      console.error('Failed to create persona:', error);
      alert(`Failed to create persona: ${error}`);
    }
    setLoading(false);
  };

  // Start a new video call session
  const handleStartCall = async () => {
    if (apiKey && DailyCall) {
      setLoading(true);
      try {
        const conversation = await createConversation(apiKey, personaId || undefined);
        setConversation(conversation);
        console.log('conversation', conversation);
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
    <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* URL Control Bar - Always visible */}
      <div style={{
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
        alignItems: "center"
      }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "0.25rem",
            border: "1px solid #ccc",
            marginLeft: "1rem"
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
            marginRight: "1rem"
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
        <div style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", zIndex: 10, padding: "20px", backgroundColor: "rgba(255, 0, 0, 0.1)" }}>
          <p>Error: Tavus API key not found. Please add VITE_TAVUS_API_KEY to your .env file.</p>
        </div>
      )}

      {!conversation && !loading && apiKey && (
        <div style={{
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
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
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
              maxWidth: "400px"
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
              maxWidth: "400px"
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
            <div style={{
              padding: "10px",
              backgroundColor: "white",
              borderRadius: "10px",
              fontSize: "14px",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center"
            }}>
              Using Persona: {personaId}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div style={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
          zIndex: 10, 
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <p>Loading...</p>
        </div>
      )}

      {conversation && <Call onLeave={handleLeaveCall} />}
    </main>
  );
}

export default App;
