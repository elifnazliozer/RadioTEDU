import React, { createContext, useState, useEffect, useRef } from 'react';
import { STATIONS } from '../data/radioData';

// html5 Audio motorunu, canlı yayın kanallarını ve oynatma durumlarını tüm uygulamaya sağlayan Context
export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  // oynatıcının durum değişkenleri (aktif radyo/podcast, oynatma, yüklenme, ses seviyesi)
  const [currentTrack, setCurrentTrack] = useState(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);

  const audioRef = useRef(null);
  const isChangingStreamRef = useRef(false);

  // emniyet zamanlayıcısı: 4 saniyeden fazla yüklemede kalırsa ve çalmaya başlamadıysa yüklemeyi kapatır
  useEffect(() => {
    let timer;
    if (isLoading && !isPlaying) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [isLoading, isPlaying]);

  // audio nesnesinin başlatılması
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume;
    audioRef.current = audio;

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handlePause = () => {
      if (isChangingStreamRef.current) return;
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleError = (e) => {
      console.warn("Audio hatası oluştu:", e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // canlı şarkı metaverisi (Now Playing) çekimi
  useEffect(() => {
    let isMounted = true;

    const fetchNowPlaying = async () => {
      if (!currentTrack || !currentTrack.id) return;
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/now-playing?station=${currentTrack.id}&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && (data.song || data.title)) {
            if (data.artwork) {
              const img = new Image();
              img.src = data.artwork;
            }
            setNowPlaying(data);
          } else if (isMounted) {
            setNowPlaying(null);
          }
        }
      } catch (err) {
        if (isMounted) setNowPlaying(null);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentTrack]);

  // oynatma motoru
  const executePlay = async (trackToPlay) => {
    const audio = audioRef.current;
    if (!audio || !trackToPlay) return;

    isChangingStreamRef.current = true;
    setIsLoading(true);
    setCurrentTrack(trackToPlay);

    const cb = `t=${Date.now()}`;
    const addCb = (u) => (u.includes('?') ? `${u}&${cb}` : `${u}?${cb}`);

    const primaryUrl = addCb(trackToPlay.src);
    const fallbackUrl = trackToPlay.fallbackSrc
      ? addCb(trackToPlay.fallbackSrc)
      : 'https://stream.zeno.fm/f3wvbbqmdg8uv';
    const universalFallback = 'https://stream.zeno.fm/f3wvbbqmdg8uv';

    const tryStream = (url) => {
      return new Promise((resolve, reject) => {
        try {
          audio.src = url;
          audio.load();
          const p = audio.play();
          if (p !== undefined) {
            p.then(resolve).catch(reject);
          } else {
            resolve();
          }
        } catch (e) {
          reject(e);
        }
      });
    };

    try {
      await tryStream(primaryUrl);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err1) {
      console.warn("Ana yayın akışı açılamadı, 1. yedek yayına geçiliyor:", primaryUrl, err1);
      try {
        await tryStream(fallbackUrl);
        setIsPlaying(true);
        setIsLoading(false);
      } catch (err2) {
        console.warn("1. yedek yayın akışı açılamadı, genel yedek yayına geçiliyor:", fallbackUrl, err2);
        try {
          await tryStream(universalFallback);
          setIsPlaying(true);
          setIsLoading(false);
        } catch (err3) {
          console.error("Tüm yayın akışları başarısız:", err3);
          setIsPlaying(false);
          setIsLoading(false);
        }
      }
    } finally {
      isChangingStreamRef.current = false;
    }
  };

  // seçilen parçayı/kanalı çalma fonksiyonu
  const playTrack = (track) => {
    if (!track) return;
    if (currentTrack?.id === track.id && isPlaying) {
      togglePlay();
      return;
    }
    executePlay(track);
  };

  // oynat/duraklat durumunu değiştiren fonksiyon
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      executePlay(currentTrack);
    }
  };

  // ses seviyesini ayarlayan fonksiyon (0.0 - 1.0)
  const setVolume = (val) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // sesi açma/kapatma (Mute/Unmute) fonksiyonu
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // sonraki radyoya geçiş fonksiyonu
  const nextStation = () => {
    const currentIndex = STATIONS.findIndex(s => s.id === currentTrack.id);
    const nextIdx = (currentIndex + 1) % STATIONS.length;
    playTrack(STATIONS[nextIdx]);
  };

  // önceki radyoya geçiş fonksiyonu
  const prevStation = () => {
    const currentIndex = STATIONS.findIndex(s => s.id === currentTrack.id);
    const prevIdx = (currentIndex - 1 + STATIONS.length) % STATIONS.length;
    playTrack(STATIONS[prevIdx]);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        nowPlaying,
        volume,
        isMuted,
        playTrack,
        togglePlay,
        setVolume,
        toggleMute,
        nextStation,
        prevStation
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};