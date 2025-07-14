import React, { useEffect, useState } from 'react';

import styles from './welcome.module.css';

export const WelcomeScreen = ({ onStart, loading }: { onStart: (key: string) => void, loading: boolean }) => {
  const [apiKey, setApiKey] = useState('');
  // On initial mount, get token from localStorage if present
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setApiKey(token);
    }
  }, []);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const handleStart = (event: React.FormEvent) => {
    event.preventDefault();
    if (apiKey) {
      onStart(apiKey);
    } else {
      alert('Please enter your API key');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome to Tavus Conversational Video Interface
      </h1>
      <form className={styles.form} >
        <input
          type='text'
          className={styles.input}
          placeholder='Enter your API key'
          onChange={handleInputChange}
          value={apiKey}
        />
        <button type='submit' className={styles.button} onClick={handleStart} disabled={!apiKey || loading}>
          {loading ? 'Loading...' : 'Start Conversation'}
        </button>
      </form>
    </div >
  );
};
