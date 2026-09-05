import React, { createContext, useState } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Kampüs Gündemi",
    artist: "RadioTEDU Canlı"
  });

  const togglePlay = () => {  // oynat ve durdru işlemi
    setIsPlaying(!isPlaying);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, currentTrack, togglePlay }}>
      {children}
    </AudioContext.Provider>
  );
};