import React, { memo, useMemo } from "react";
import "./SnowAnimation.css";

const SnowAnimation: React.FC = memo(() => {
  // Generate random properties for each snowflake
  const snowflakes = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      opacity: Math.random(),
      scale: Math.random() * 0.4 + 0.1,
      x: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: -Math.random() * 10,
    }));
  }, []);

  return (
    <div className="snow-container">
      {snowflakes.map((flake) => (
        <div key={flake.id} className="snow" />
      ))}
    </div>
  );
});

export default SnowAnimation;
