import React from 'react';
import VideoConversation from './components/VideoConversation';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="logo-container">
        <img 
          src="https://cdn.prod.website-files.com/68c8e57d6e512b9573db146f/68c8e57e6e512b9573db1aa0_logo.svg" 
          alt="Tavus" 
          className="app-logo"
        />
      </div>
      <VideoConversation />
    </div>
  );
}

export default App;