import React, { createContext, useState } from 'react';

// Radyonun global durumunu tutacak beyin burası
export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Kampüs Gündemi",
    artist: "RadioTEDU Canlı"
  });

  // Oynat/Durdur işlevi
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // İleride buraya HTML5 Audio elementinin .play() ve .pause() metodlarını ekleyeceğiz
  };

  return (
    <AudioContext.Provider value={{ isPlaying, currentTrack, togglePlay }}>
      {children}
    </AudioContext.Provider>
  );
};