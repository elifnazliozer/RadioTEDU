import { useState, useEffect, useRef, useId } from 'react';
import ReactDOM from 'react-dom';

const SPOTIFY_GREEN = '#1db954';

/**
 * Taşan şarkı adını fare üstündeyken sağdan sola kaydıran başlık.
 * active: dışarıdan tetikleme (fare pencerenin herhangi bir yerinde). Alçak PiP
 * penceresinde Chrome'un üst çubuğu başlığın üstüne bindiği için sadece
 * başlığın kendi hover'ına güvenilemiyor.
 */
function ScrollableTitle({ title, fontSize, lineHeight, active = false }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [isSelfHovered, setIsSelfHovered] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState('0.5s');

  const shouldScroll = active || isSelfHovered;

  useEffect(() => {
    if (shouldScroll && containerRef.current && contentRef.current) {
      const overflow = contentRef.current.scrollWidth - containerRef.current.clientWidth;
      if (overflow > 0) {
        setTransitionDuration(`${Math.max(1.8, overflow / 35)}s`);
        setTranslateX(-overflow - 6);
      }
    } else {
      setTransitionDuration('0.5s');
      setTranslateX(0);
    }
  }, [shouldScroll, title]);

  const maskImage = translateX < 0
    ? 'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 22px), transparent 100%)'
    : 'linear-gradient(to right, black 0%, black calc(100% - 22px), transparent 100%)';

  return (
    <div
      ref={containerRef}
      className="overflow-hidden whitespace-nowrap min-w-0 w-full"
      onMouseEnter={() => setIsSelfHovered(true)}
      onMouseLeave={() => setIsSelfHovered(false)}
      title={title}
      style={{ maskImage, WebkitMaskImage: maskImage }}
    >
      <h3
        ref={contentRef}
        className="inline-block whitespace-nowrap will-change-transform drop-shadow-xs"
        style={{
          fontFamily: "'Circular Std', 'Poppins', 'Plus Jakarta Sans', sans-serif",
          fontSize,
          fontWeight: 700,
          lineHeight,
          color: '#ffffff',
          letterSpacing: '-0.4px',
          transform: `translateX(${translateX}px)`,
          transition: `transform ${transitionDuration} linear`
        }}
      >
        {title}
      </h3>
    </div>
  );
}

/**
 * Kapak renginden Spotify tarzı zemin rengi üretir:
 * tonu korur, rengi koyulaştırır ve doygunluğu artırır (gri kapaklar gri kalır).
 */
function toSpotifyBg([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  const newS = s < 0.08 ? s : Math.min(0.85, Math.max(s, 0.5));
  const newL = Math.max(0.14, Math.min(l, 0.3));
  if (newS === 0) {
    const v = Math.round(newL * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS;
  const p = 2 * newL - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map((v) => Math.round(v * 255));
}

/**
 * Spotify Bağlantı İkonu.
 */
function SpotifyLink({ url, title, size }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 rounded-full transition-transform cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
      style={{ color: SPOTIFY_GREEN }}
      title={title}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    </a>
  );
}

/**
 * Önceki İstasyon İkonu (|◀).
 */
function PrevIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M6.5 6.5h1.5v11H6.5zM10 12l7.5 5.25V6.75z" />
    </svg>
  );
}

/**
 * Sonraki İstasyon İkonu (▶|).
 */
function NextIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M16 6.5h1.5v11H16zM14 12L6.5 6.75v10.5z" />
    </svg>
  );
}

/**
 * Oynat/Duraklat Butonu Görseli (beyaz daire, ikon içi oyuk).
 */
function PlayPauseGlyph({ isPlaying }) {
  // ikon daireden maske ile oyulur: üçgen/çubukların içi şeffaf kalır, arkası görünür
  const maskId = `pp-mask-${useId().replace(/:/g, '')}`;
  return (
    <svg className="w-full h-full block" viewBox="0 0 24 24" shapeRendering="geometricPrecision">
      <mask id={maskId}>
        <circle cx="12" cy="12" r="11.6" fill="#ffffff" />
        {isPlaying ? (
          <path fill="#000000" stroke="#000000" strokeWidth="0.6" strokeLinejoin="round" d="M8.75 7.5h2.25v9H8.75zM13 7.5h2.25v9H13z" />
        ) : (
          <path fill="#000000" stroke="#000000" strokeWidth="1.2" strokeLinejoin="round" d="M9.75 7.5v9l7-4.5z" />
        )}
      </mask>
      {/* yarıçap 12 değil 11.6: kenar yumuşatması SVG sınırında kesilmesin */}
      <circle cx="12" cy="12" r="11.6" fill="#ffffff" mask={`url(#${maskId})`} />
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
  t = (key) => key
}) {
  const isSupported = 'documentPictureInPicture' in window;
  const [pipWindow, setPipWindow] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 420, height: 500 });

  const displayTitle = nowPlaying?.song || currentTrack?.title || "RadioTEDU";
  const displayArtist = nowPlaying?.artist || currentTrack?.subtitle || currentTrack?.artist || "TEDU Radio";
  const coverArtwork = nowPlaying?.artwork || currentTrack?.artwork;
  const spotifyUrl = nowPlaying?.spotify_url || nowPlaying?.spotify || `https://open.spotify.com/search/${encodeURIComponent(`${displayTitle} ${displayArtist}`)}`;

  // PiP Penceresini Başlat / Kapat
  useEffect(() => {
    if (!isSupported) return;

    if (isOpen && !pipWindow) {
      const openPip = async () => {
        try {
          const win = await window.documentPictureInPicture.requestWindow({
            width: 420,
            height: 500,
            disallowReturnToOpener: true,
          });

          // ana sayfanın stillerini PiP penceresine kopyala (eski kopyaları silip yeniden)
          const copyStyles = () => {
            win.document.querySelectorAll('[data-pip-copied]').forEach((node) => node.remove());
            const nodes = [];
            Array.from(document.styleSheets).forEach((styleSheet) => {
              try {
                const style = win.document.createElement('style');
                style.textContent = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
                nodes.push(style);
              } catch {
                // başka kaynaktan gelen (cross-origin) stil dosyası: kurallar okunamaz, link olarak ekle
                if (styleSheet.href) {
                  const link = win.document.createElement('link');
                  link.rel = 'stylesheet';
                  link.href = styleSheet.href;
                  nodes.push(link);
                }
              }
            });
            nodes.forEach((node) => node.setAttribute('data-pip-copied', ''));
            win.document.head.prepend(...nodes);
          };
          copyStyles();

          // geliştirme sırasında (HMR) yeni eklenen stiller de açık pencereye yansısın
          let syncFrame = null;
          const styleObserver = new MutationObserver(() => {
            if (syncFrame) return;
            syncFrame = requestAnimationFrame(() => {
              syncFrame = null;
              copyStyles();
            });
          });
          styleObserver.observe(document.head, { childList: true, subtree: true, characterData: true });

          const customStyle = win.document.createElement('style');
          customStyle.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Poppins:wght@700;800&display=swap');
            html, body {
              margin: 0; padding: 0; width: 100%; height: 100%;
              background-color: transparent; color: #ffffff;
              font-family: 'Circular Std', 'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif;
              overflow: hidden; user-select: none;
            }
          `;
          win.document.head.appendChild(customStyle);

          const updateBounds = () => {
            setWindowDimensions({ width: win.innerWidth, height: win.innerHeight });
          };
          win.addEventListener('resize', updateBounds);
          updateBounds();

          win.addEventListener('pagehide', () => {
            styleObserver.disconnect();
            if (syncFrame) cancelAnimationFrame(syncFrame);
            setPipWindow(null);
            onClose?.();
          });
          setPipWindow(win);
        } catch (err) {
          console.error("Document Picture-in-Picture hatası:", err);
          setPipWindow(null);
          onClose?.();
        }
      };
      openPip();
    } else if (!isOpen && pipWindow) {
      // state'i pencerenin 'pagehide' olayı sıfırlar
      pipWindow.close();
    }
  }, [isOpen]);

  // pencere değişince ya da bileşen kapanınca eski PiP penceresini kapat
  useEffect(() => {
    return () => {
      try { pipWindow?.close(); } catch { /* zaten kapanmış */ }
    };
  }, [pipWindow]);

  useEffect(() => {
    if (pipWindow?.document) {
      pipWindow.document.title = `🎛️ ${displayTitle} • ${t('miniPlayerTitle')}`;
    }
  }, [displayTitle, pipWindow]);

  // Spotify tarzı renk: kapağın baskın renginin koyu ve doygun hali, tek renk zemin
  const bg = toSpotifyBg(nowPlaying?.palette?.rgb || rgb);
  const containerBgStyle = { backgroundColor: `rgb(${bg.join(', ')})`, transition: 'background-color 0.6s ease' };
  // sanatçı adı: zemin renginin açık tonu (Spotify'daki gibi, beyazla %65 karışım)
  const artistColor = `rgb(${bg.map((v) => Math.round(v + (255 - v) * 0.65)).join(', ')})`;

  const { width, height } = windowDimensions;
  let phase = 1;
  if (height < 110) phase = 3;
  else if (height < 140) phase = 2;

  const hoverHandlers = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false)
  };

  const coverImage = (emojiSize) => (
    coverArtwork ? (
      <img src={coverArtwork} alt={displayTitle} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#282828', fontSize: emojiSize }}>📻</div>
    )
  );

  const navButton = (onClick, label, Icon, iconSize) => onClick && (
    <button
      onClick={onClick}
      className="shrink-0 flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-90"
      style={{ color: '#ffffff', padding: 4 }}
      title={label}
    >
      <Icon size={iconSize} />
    </button>
  );

  const playButton = (size) => (
    <button
      onClick={togglePlay}
      className="shrink-0 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95"
      style={{ width: size, height: size }}
      title={isPlaying ? t('miniPause') : t('miniPlay')}
    >
      <PlayPauseGlyph isPlaying={isPlaying} />
    </button>
  );

  const artistLine = (fontSize) => (
    <div className="truncate" style={{ fontSize, fontWeight: 500, color: artistColor, marginTop: 2 }}>
      {displayArtist}
    </div>
  );

  let playerContent;

  if (phase === 3) {
    playerContent = (
      <div className="w-full h-full flex items-center gap-3 px-3 overflow-hidden font-sans" style={containerBgStyle} {...hoverHandlers}>
        <div className="w-10 h-10 rounded overflow-hidden shrink-0 shadow-md">
          {coverImage(14)}
        </div>

        <div className="min-w-0 flex-1">
          <ScrollableTitle title={displayTitle} fontSize="13px" lineHeight={1.25} active={isHovering} />
          {artistLine(11)}
        </div>

        {/* pencere genişledikçe sırayla: önce sonraki, sonra önceki, en son Spotify logosu görünür */}
        <div className="flex items-center shrink-0">
          {width >= 400 && (
            <div className="mr-2">
              <SpotifyLink url={spotifyUrl} title={t('listenOnSpotify')} size={18} />
            </div>
          )}
          {width >= 340 && navButton(prevStation, t('prevStation'), PrevIcon, 24)}
          {playButton(32)}
          {width >= 280 && navButton(nextStation, t('nextStation'), NextIcon, 24)}
        </div>
      </div>
    );
  } else if (phase === 2) {
    playerContent = (
      <div className="w-full h-full flex flex-col justify-center gap-2 px-3 overflow-hidden font-sans" style={containerBgStyle} {...hoverHandlers}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded overflow-hidden shrink-0 shadow-md">
            {coverImage(18)}
          </div>
          <div className="min-w-0 flex-1">
            <ScrollableTitle title={displayTitle} fontSize="14px" lineHeight={1.25} active={isHovering} />
            {artistLine(12)}
          </div>
          <SpotifyLink url={spotifyUrl} title={t('listenOnSpotify')} size={20} />
        </div>

        <div className="flex items-center justify-center gap-5">
          {navButton(prevStation, t('prevStation'), PrevIcon, 20)}
          {playButton(36)}
          {navButton(nextStation, t('nextStation'), NextIcon, 20)}
        </div>
      </div>
    );
  } else {
    playerContent = (
      <div className="w-full h-full flex flex-col px-4 pt-4 pb-3 overflow-hidden font-sans" style={containerBgStyle} {...hoverHandlers}>
        {/* kapak: her pencere boyutunda kare, genişlik ve yüksekliğin küçüğü kadar */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center relative" style={{ containerType: 'size' }}>
          <div
            className="rounded-lg overflow-hidden relative"
            style={{
              width: 'min(100cqw, 100cqh)',
              height: 'min(100cqw, 100cqh)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            {coverImage(40)}
            {/* fare gelince kapağın üstüne zemin renginde %80 opak katman (Spotify gibi) */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(${bg.join(', ')}, 0.8)`,
                opacity: isHovering ? 1 : 0,
                transition: 'opacity 0.25s ease'
              }}
            />
          </div>

          {/* kontroller: pencere genişliğinde, kapağın ortasında */}
          <div
            className="absolute inset-0 flex items-center justify-center gap-2"
            style={{
              opacity: isHovering ? 1 : 0,
              pointerEvents: isHovering ? 'auto' : 'none',
              transition: 'opacity 0.25s ease'
            }}
          >
            {navButton(prevStation, t('prevStation'), PrevIcon, 28)}
            {playButton(height > 300 ? 52 : 44)}
            {navButton(nextStation, t('nextStation'), NextIcon, 28)}
          </div>
        </div>

        {/* alt bilgi: şarkı adı, altında sanatçı, sağda dikeyde ortalı Spotify */}
        <div className="flex items-center justify-between gap-3 pt-5 shrink-0">
          <div className="min-w-0 flex-1">
            <ScrollableTitle title={displayTitle} fontSize={height > 300 ? '20px' : '17px'} lineHeight={1.2} />
            {artistLine(height > 300 ? 14 : 13)}
          </div>
          <div style={{ marginRight: 6 }}>
            <SpotifyLink url={spotifyUrl} title={t('listenOnSpotify')} size={24} />
          </div>
        </div>
      </div>
    );
  }

  if (isOpen && pipWindow) return ReactDOM.createPortal(playerContent, pipWindow.document.body);
  if (isOpen && !isSupported) return <div className="fixed bottom-28 right-6 w-80 h-96 bg-[#09090b] border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">{playerContent}</div>;
  return null;
}
