import React from 'react';

interface PulsingBackgroundProps {
  isActive: boolean;
}

export const PulsingBackground: React.FC<PulsingBackgroundProps> = ({ isActive }) => {
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
        animation: isActive ? "backgroundPulse 2s ease-in-out infinite" : "none",
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