import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

/**
 * Kayan Yazı (Marquee) Şarkı Başlık Bileşeni.
 */
function ScrollableTitle({ title, artist, fontSize = '15px', fontWeight = 600, color = '#ffffff' }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState('0.5s');

  const handleMouseEnter = () => {
    if (containerRef.current && contentRef.current) {
      const overflow = contentRef.current.scrollWidth - containerRef.current.clientWidth;
      if (overflow > 0) {
        setTransitionDuration(`${Math.max(1.8, overflow / 35)}s`);
        setTranslateX(-overflow - 6);
      }
    }
  };

  const handleMouseLeave = () => {
    setTransitionDuration('0.5s');
    setTranslateX(0);
  };

  const maskImage = translateX < 0
    ? 'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 22px), transparent 100%)'
    : 'linear-gradient(to right, black 0%, black calc(100% - 22px), transparent 100%)';

  return (
    <div
      ref={containerRef}
      className="overflow-hidden whitespace-nowrap min-w-0 w-full relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${title} • ${artist}`}
      style={{
        maskImage,
        WebkitMaskImage: maskImage
      }}
    >
      <h3
        ref={contentRef}
        className="song-title inline-block whitespace-nowrap will-change-transform drop-shadow-xs"
        style={{
          fontFamily: "'Circular Std', 'Poppins', 'Plus Jakarta Sans', sans-serif",
          fontSize,
          fontWeight,
          color,
          letterSpacing: '-0.4px',
          transform: `translateX(${translateX}px)`,
          transition: `transform ${transitionDuration} linear`
        }}
      >
        {title} <span className="mx-1 font-extrabold opacity-75">•</span> {artist}
      </h3>
    </div>
  );
}

/**
 * Spotify Bağlantı İkonu.
 */
function SpotifyLink({ url, className = "w-4 h-4", isLight = false }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`no-drag shrink-0 p-0.5 rounded-full transition-all cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 ${
        isLight ? 'text-zinc-900 hover:text-black hover:bg-black/10' : 'text-[#1db954] hover:text-[#1ed760] hover:bg-white/10'
      }`}
      title="Spotify'da Dinle"
    >
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-.1.2-1.02-.42-.18-.6.42-1.2.96-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/>
      </svg>
    </a>
  );
}

/**
 * Önceki İstasyon İkonu (|◀).
 */
function PrevIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2.5v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
    </svg>
  );
}

/**
 * Sonraki İstasyon İkonu (▶|).
 */
function NextIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 6H18v12h-2.5V6zM5.5 18l8.5-6-8.5-6v12z" />
    </svg>
  );
}

/**
 * Picture-in-Picture Mini Player Bileşeni.
 */
export default function MiniPlayer({
  isOpen,
  onClose,
  currentTrack,
  nowPlaying,
  isPlaying,
  togglePlay,
  prevStation,
  nextStation,
  rgb = [229, 9, 20],
  avgRgb = [150, 15, 15]
}) {
  const [pipWindow, setPipWindow] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({ width: 420, height: 500 });

  const displayTitle = nowPlaying?.song || currentTrack?.title || "RadioTEDU";
  const displayArtist = nowPlaying?.artist || currentTrack?.subtitle || currentTrack?.artist || "TEDU Radio";
  const coverArtwork = nowPlaying?.artwork || currentTrack?.artwork;
  const spotifyUrl = nowPlaying?.spotify_url || nowPlaying?.spotify || `https://open.spotify.com/search/${encodeURIComponent(`${displayTitle} ${displayArtist}`)}`;

  // PiP Penceresini Başlat / Kapat
  useEffect(() => {
    if (!('documentPictureInPicture' in window)) {
      setIsSupported(false);
      return;
    }

    if (isOpen && !pipWindow) {
      const openPip = async () => {
        try {
          const win = await window.documentPictureInPicture.requestWindow({
            width: 420,
            height: 500,
            disallowReturnToOpener: true,
          });

          win.document.title = `🎛️ ${displayTitle} • RadioTEDU`;

          Array.from(document.styleSheets).forEach((styleSheet) => {
            try {
              const cssRules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
              const style = win.document.createElement('style');
              style.textContent = cssRules;
              win.document.head.appendChild(style);
            } catch (e) {
              if (styleSheet.href) {
                const link = win.document.createElement('link');
                link.rel = 'stylesheet';
                link.type = styleSheet.type || 'text/css';
                link.href = styleSheet.href;
                win.document.head.appendChild(link);
              }
            }
          });

          const customStyle = win.document.createElement('style');
          customStyle.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Poppins:wght@700;800&display=swap');
            html, body {
              margin: 0; padding: 0; width: 100%; height: 100%;
              background-color: transparent; color: #ffffff;
              font-family: 'Circular Std', 'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif;
              overflow: hidden; user-select: none;
              -webkit-app-region: drag;
            }
            button, input, a, .no-drag { -webkit-app-region: no-drag; }
            * { box-sizing: border-box; }
          `;
          win.document.head.appendChild(customStyle);

          const updateBounds = () => {
            setWindowDimensions({ width: win.innerWidth, height: win.innerHeight });
          };
          win.addEventListener('resize', updateBounds);
          updateBounds();

          win.addEventListener('pagehide', () => {
            setPipWindow(null);
            if (onClose) onClose();
          });
          setPipWindow(win);
        } catch (err) {
          console.error("Document Picture-in-Picture hatası:", err);
          setPipWindow(null);
          if (onClose) onClose();
        }
      };
      openPip();
    } else if (!isOpen && pipWindow) {
      try { pipWindow.close(); } catch (e) {}
      setPipWindow(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (pipWindow) {
        try { pipWindow.close(); } catch (e) {}
      }
    };
  }, [pipWindow]);

  // Renk ve Parlaklık (Luminance) Hesabı
  const palette = nowPlaying?.palette;
  const safeRgb = palette?.rgb || (Array.isArray(rgb) ? rgb : [229, 9, 20]);
  const safeAvgRgb = palette?.avg_rgb || (Array.isArray(avgRgb) ? avgRgb : safeRgb);

  // Parlaklık testi (ITU-R BT.601 YIQ)
  const brightness = (safeRgb[0] * 299 + safeRgb[1] * 587 + safeRgb[2] * 114) / 1000;
  const isLight = brightness > 145;

  const bgRgb = isLight ? safeRgb : [Math.floor(safeRgb[0] * 0.55), Math.floor(safeRgb[1] * 0.55), Math.floor(safeRgb[2] * 0.55)];
  const bgAvgRgb = isLight ? safeAvgRgb : [Math.floor(safeAvgRgb[0] * 0.35), Math.floor(safeAvgRgb[1] * 0.35), Math.floor(safeAvgRgb[2] * 0.35)];

  const textColor = isLight ? '#000000' : '#ffffff';
  const navBtnColor = isLight ? 'text-zinc-900 hover:text-black hover:bg-black/10' : 'text-zinc-300 hover:text-white hover:bg-white/10';
  const playBtnStyle = isLight ? 'bg-zinc-900 text-white hover:bg-black shadow-md' : 'bg-white text-black hover:bg-zinc-200 shadow-md';
  const iconFillColor = isLight ? '#ffffff' : '#000000';

  useEffect(() => {
    if (pipWindow?.document) {
      pipWindow.document.title = `🎛️ ${displayTitle} • RadioTEDU`;
    }
  }, [displayTitle, pipWindow]);

  const containerBgStyle = {
    background: isLight
      ? `linear-gradient(180deg, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, 0.88) 0%, rgba(${bgAvgRgb[0]}, ${bgAvgRgb[1]}, ${bgAvgRgb[2]}, 0.85) 100%)`
      : `linear-gradient(180deg, rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, 0.82) 0%, rgba(${bgAvgRgb[0]}, ${bgAvgRgb[1]}, ${bgAvgRgb[2]}, 0.75) 100%)`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)'
  };

  const ambientLayer = coverArtwork && (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <img
        src={coverArtwork}
        alt=""
        className="w-full h-full object-cover scale-150 transition-all duration-1000 transform-gpu"
        style={{
          filter: 'blur(45px) saturate(240%) brightness(0.65)',
          opacity: isPlaying ? 0.8 : 0.5
        }}
      />
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `linear-gradient(180deg, rgba(${safeRgb[0]},${safeRgb[1]},${safeRgb[2]},0.35) 0%, rgba(${safeAvgRgb[0]},${safeAvgRgb[1]},${safeAvgRgb[2]},0.5) 100%)`,
          backdropFilter: 'blur(20px)'
        }}
      />
    </div>
  );

  const height = windowDimensions.height;
  let phase = 1;
  if (height < 110) phase = 3;
  else if (height < 170) phase = 2;
  else phase = 1;

  let playerContent = null;

  if (phase === 3) {
    const subTextColor = isLight ? 'text-zinc-900 font-medium' : 'text-[#1db954] font-normal';
    playerContent = (
      <div className="group w-full h-full flex items-center justify-between px-3 py-1.5 select-none relative overflow-hidden font-sans box-border" style={containerBgStyle}>
        {ambientLayer}
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0 relative z-10 shadow-sm">
          {coverArtwork ? (
            <img src={coverArtwork} alt={displayTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs">📻</div>
          )}
        </div>

        <div className="min-w-0 flex-1 px-3 z-10">
          <ScrollableTitle title={displayTitle} artist={displayArtist} fontSize="12px" fontWeight={400} color={textColor} />
          <div className={`flex items-center gap-1.5 text-[10.5px] tracking-wide truncate mt-0.5 ${subTextColor}`}>
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5A2.25 2.25 0 0 0 4.5 16.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
            </svg>
            <span className="truncate">{currentTrack?.title || "RadioTEDU"}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 z-10 shrink-0">
          {prevStation && (
            <button
              onClick={prevStation}
              className={`no-drag p-1 rounded-full transition-all active:scale-90 cursor-pointer ${navBtnColor}`}
              title="Önceki İstasyon"
            >
              <PrevIcon className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={togglePlay}
            className={`no-drag w-8 h-8 shrink-0 aspect-square rounded-full flex items-center justify-center font-bold transition-transform cursor-pointer hover:scale-105 active:scale-95 ${playBtnStyle}`}
            title={isPlaying ? "Duraklat" : "Oynat"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={iconFillColor}><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill={iconFillColor}><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {nextStation && (
            <button
              onClick={nextStation}
              className={`no-drag p-1 shrink-0 aspect-square rounded-full transition-all active:scale-90 cursor-pointer ${navBtnColor}`}
              title="Sonraki İstasyon"
            >
              <NextIcon className="w-3.5 h-3.5" />
            </button>
          )}

          <SpotifyLink url={spotifyUrl} className="w-4 h-4 ml-0.5" isLight={isLight} />
        </div>
      </div>
    );
  } else if (phase === 2) {
    const subTextColor = isLight ? 'text-zinc-900 font-semibold' : 'text-[#1db954] font-medium';
    playerContent = (
      <div className="group w-full h-full flex flex-col justify-center gap-2 p-3 select-none relative overflow-hidden font-sans box-border" style={containerBgStyle}>
        {ambientLayer}
        <div className="flex items-center gap-3 z-10 min-w-0 px-0.5">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0 relative shadow-md">
            {coverArtwork ? (
              <img src={coverArtwork} alt={displayTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">📻</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <ScrollableTitle title={displayTitle} artist={displayArtist} fontSize="13.5px" fontWeight={500} color={textColor} />
            <div className="flex items-center justify-between gap-1.5 text-[11px] tracking-wide truncate mt-0.5">
              <div className={`flex items-center gap-1.5 min-w-0 truncate ${subTextColor}`}>
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5A2.25 2.25 0 0 0 4.5 16.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                </svg>
                <span className="truncate">{currentTrack?.title || "RadioTEDU"}</span>
              </div>
              <SpotifyLink url={spotifyUrl} className="w-4 h-4" isLight={isLight} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 z-10 pt-0.5">
          {prevStation && (
            <button
              onClick={prevStation}
              className={`no-drag p-1 shrink-0 aspect-square rounded-full transition-all active:scale-90 cursor-pointer ${navBtnColor}`}
              title="Önceki İstasyon"
            >
              <PrevIcon className="w-4.5 h-4.5" />
            </button>
          )}

          <button
            onClick={togglePlay}
            className={`no-drag w-9 h-9 shrink-0 aspect-square rounded-full flex items-center justify-center font-bold transition-transform cursor-pointer hover:scale-105 active:scale-95 ${playBtnStyle}`}
            title={isPlaying ? "Duraklat" : "Oynat"}
          >
            {isPlaying ? (
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill={iconFillColor}><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
            ) : (
              <svg className="w-4.5 h-4.5 ml-0.5" viewBox="0 0 24 24" fill={iconFillColor}><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {nextStation && (
            <button
              onClick={nextStation}
              className={`no-drag p-1 shrink-0 aspect-square rounded-full transition-all active:scale-90 cursor-pointer ${navBtnColor}`}
              title="Sonraki İstasyon"
            >
              <NextIcon className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    );
  } else {
    const subTextColor = isLight ? 'text-zinc-900 font-bold' : 'text-[#1db954] font-semibold';
    playerContent = (
      <div className="group w-full h-full flex flex-col justify-between p-3 select-none relative overflow-hidden font-sans box-border" style={containerBgStyle}>
        {ambientLayer}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center relative my-1 z-10 p-1">
          <div
            className="group/cover rounded-2xl overflow-hidden relative flex items-center justify-center transition-all duration-300 h-full max-h-full aspect-square"
            style={{
              boxShadow: isPlaying ? '0 8px 20px rgba(0, 0, 0, 0.45)' : '0 4px 12px rgba(0, 0, 0, 0.35)',
              backgroundColor: '#121216'
            }}
          >
            {coverArtwork ? (
              <img src={coverArtwork} alt={displayTitle} className="w-full h-full object-cover transition-all duration-700 group-hover/cover:scale-105" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-3xl">📻</div>
            )}

            <div
              className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover/cover:opacity-100 transition-all duration-300 z-20"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}
            >
              {prevStation && (
                <button
                  onClick={prevStation}
                  className="no-drag p-1.5 shrink-0 aspect-square rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
                  title="Önceki İstasyon"
                >
                  <PrevIcon className="w-4.5 h-4.5" />
                </button>
              )}

              <button
                onClick={togglePlay}
                className="no-drag w-11 h-11 shrink-0 aspect-square rounded-full bg-white text-black flex items-center justify-center font-bold shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title={isPlaying ? "Duraklat" : "Oynat"}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="#000000"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>

              {nextStation && (
                <button
                  onClick={nextStation}
                  className="no-drag p-1.5 shrink-0 aspect-square rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
                  title="Sonraki İstasyon"
                >
                  <NextIcon className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="z-10 px-2 pb-2.5 pt-1 shrink-0">
          <div className="min-w-0 w-full">
            <ScrollableTitle title={displayTitle} artist={displayArtist} fontSize={height > 300 ? "16px" : "14.5px"} fontWeight={height > 300 ? 700 : 600} color={textColor} />
            <div className="flex items-center justify-between gap-1.5 text-xs tracking-wide mt-1">
              <div className={`flex items-center gap-1.5 min-w-0 truncate ${subTextColor}`}>
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5A2.25 2.25 0 0 0 4.5 16.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                </svg>
                <span className="truncate">{currentTrack?.title || "RadioTEDU"}</span>
              </div>
              <SpotifyLink url={spotifyUrl} className="w-4 h-4" isLight={isLight} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isOpen && pipWindow) return ReactDOM.createPortal(playerContent, pipWindow.document.body);
  if (isOpen && !isSupported) return <div className="fixed bottom-28 right-6 w-80 h-96 bg-[#09090b] border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">{playerContent}</div>;
  return null;
}
