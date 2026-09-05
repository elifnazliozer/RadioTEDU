import React, { useContext } from 'react';
import { AudioContext } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Her kanal ve içeriğe özel dinamik renk paletleri
const THEME_MAP = {
  // Radyo İstasyonları
  'radiotedu-main': {
    accent: '#E50914', // Radyo Kırmızısı
    glow: 'rgba(229, 9, 20, 0.55)',
    ambient: 'rgba(229, 9, 20, 0.32)',
    tagBg: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  'radiotedu-classic': {
    accent: '#D97706', // Asil Amber / Altın
    glow: 'rgba(217, 119, 6, 0.55)',
    ambient: 'rgba(217, 119, 6, 0.32)',
    tagBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  'radiotedu-jazz': {
    accent: '#3B82F6', // Gece Mavisi / Caz İndigo
    glow: 'rgba(59, 130, 246, 0.55)',
    ambient: 'rgba(59, 130, 246, 0.32)',
    tagBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  'radiotedu-lofi': {
    accent: '#10B981', // Zümrüt / Sakin Nane Yeşili
    glow: 'rgba(16, 185, 129, 0.55)',
    ambient: 'rgba(16, 185, 129, 0.32)',
    tagBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  'radiotedu-rock': {
    accent: '#A855F7', // Elektrik Mor / Rock Menekşesi
    glow: 'rgba(168, 85, 247, 0.55)',
    ambient: 'rgba(168, 85, 247, 0.32)',
    tagBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  'radiotedu-energize': {
    accent: '#F97316', // Neon Turuncu / Enerji
    glow: 'rgba(249, 115, 22, 0.55)',
    ambient: 'rgba(249, 115, 22, 0.32)',
    tagBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },

  // Podcastler
  'ep-kadersel-asklar': {
    accent: '#F43F5E', // Romantik Gül Pembesi
    glow: 'rgba(244, 63, 94, 0.55)',
    ambient: 'rgba(244, 63, 94, 0.32)',
    tagBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  },
  'ep-bpw-talks-1': {
    accent: '#06B6D4', // Liderlik Camgöbeği
    glow: 'rgba(6, 182, 212, 0.55)',
    ambient: 'rgba(6, 182, 212, 0.32)',
    tagBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  'ep-makrofinans-final': {
    accent: '#14B8A6', // Finans Teali
    glow: 'rgba(20, 184, 166, 0.55)',
    ambient: 'rgba(20, 184, 166, 0.32)',
    tagBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
  }
};

export default function ArtisticPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    togglePlay,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    prevStation,
    nextStation,
    nowPlaying
  } = useContext(AudioContext);

  const { isDark } = useTheme();
  const { t, language } = useLanguage();

  // Çalan parçaya/kanala ve şarkı kapağına göre dinamik renk paleti
  const palette = nowPlaying?.palette;
  const coverArtwork = nowPlaying?.artwork || currentTrack?.artwork;
  
  // Albüm kapağından türetilen renkler (yoksa istasyonun kendi teması kullanılır)
  const activeAccent = palette?.vibrant || currentTrack?.theme?.accent || '#e50914';
  const activeGlow = palette?.vibrant ? `${palette.vibrant}88` : (currentTrack?.theme?.glow || 'rgba(229, 9, 20, 0.45)');
  
  const rgb = palette?.rgb || (currentTrack?.theme?.accent === '#e50914' ? [229, 9, 20] : [200, 30, 30]);
  const avgRgb = palette?.avg_rgb || rgb;

  // Çalan şarkı ve sanatçı hesaplaması
  const hasLiveSong = Boolean(nowPlaying?.song && nowPlaying.song !== currentTrack?.title);
  const displayTitle = nowPlaying?.song || currentTrack?.title || "RadioTEDU";
  const displaySubtitle = (() => {
    if (nowPlaying?.artist) {
      if (currentTrack?.title && !nowPlaying.artist.includes(currentTrack.title)) {
        return `${nowPlaying.artist} · ${currentTrack.title}`;
      }
      return nowPlaying.artist;
    }
    return currentTrack?.subtitle || currentTrack?.artist || t('defaultSubtitle');
  })();

  // Dinamik arka plan stili (Kapağın rengini tüm player çubuğuna giydirir)
  const dynamicBackgroundStyle = (() => {
    if (coverArtwork) {
      if (isDark) {
        return `linear-gradient(90deg, rgba(${Math.floor(rgb[0] * 0.35)}, ${Math.floor(rgb[1] * 0.35)}, ${Math.floor(rgb[2] * 0.35)}, 0.94) 0%, rgba(${Math.floor(avgRgb[0] * 0.28)}, ${Math.floor(avgRgb[1] * 0.28)}, ${Math.floor(avgRgb[2] * 0.28)}, 0.96) 50%, rgba(${Math.floor(rgb[0] * 0.35)}, ${Math.floor(rgb[1] * 0.35)}, ${Math.floor(rgb[2] * 0.35)}, 0.94) 100%)`;
      } else {
        const lr = Math.min(255, Math.floor(rgb[0] * 0.45 + 130));
        const lg = Math.min(255, Math.floor(rgb[1] * 0.45 + 130));
        const lb = Math.min(255, Math.floor(rgb[2] * 0.45 + 130));
        const alr = Math.min(255, Math.floor(avgRgb[0] * 0.45 + 130));
        const alg = Math.min(255, Math.floor(avgRgb[1] * 0.45 + 130));
        const alb = Math.min(255, Math.floor(avgRgb[2] * 0.45 + 130));
        return `linear-gradient(90deg, rgba(${lr}, ${lg}, ${lb}, 0.92) 0%, rgba(${alr}, ${alg}, ${alb}, 0.88) 50%, rgba(${lr}, ${lg}, ${lb}, 0.92) 100%)`;
      }
    }
    return isDark
      ? 'linear-gradient(to right, #0a0a0d, #121216, #0a0a0d)'
      : 'linear-gradient(to right, #ffffff, #fafafa, #ffffff)';
  })();

  return (
    <footer
      style={{
        background: dynamicBackgroundStyle,
        transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.8s ease'
      }}
      className="h-24 shrink-0 w-full z-50 border-t border-white/20 dark:border-white/10 shadow-[0_-16px_48px_rgba(0,0,0,0.15)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.9)] backdrop-blur-3xl flex flex-col justify-between overflow-hidden transition-colors duration-300 relative"
    >
      {/* 1. KATMAN: Albüm Kapağının Renklerini Arkaya Yayan Derin Bulanık Ortam Katmanı (Apple Music / Spotify Tarzı) */}
      {coverArtwork && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img
            src={coverArtwork}
            alt=""
            className="w-full h-full object-cover scale-150 transition-all duration-1000 transform-gpu"
            style={{
              filter: isDark
                ? 'blur(45px) saturate(240%) brightness(0.6)'
                : 'blur(45px) saturate(220%) brightness(1.12)',
              opacity: isPlaying ? 0.75 : 0.45
            }}
          />
          {/* Renk derinliğini zenginleştiren yarı saydam cam katmanı */}
          <div
            className="absolute inset-0 transition-colors duration-1000"
            style={{
              background: isDark
                ? `linear-gradient(90deg, rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4) 0%, rgba(${avgRgb[0]},${avgRgb[1]},${avgRgb[2]},0.28) 50%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4) 100%)`
                : `linear-gradient(90deg, rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4) 0%, rgba(${avgRgb[0]},${avgRgb[1]},${avgRgb[2]},0.25) 50%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4) 100%)`,
              backdropFilter: 'blur(24px)'
            }}
          />
        </div>
      )}

      {/* Üst Dinamik Neon Çizgi (Kapağın en canlı renginde parlar) */}
      <div
        className="w-full h-[2px] transition-all duration-700 relative z-10"
        style={{
          background: `linear-gradient(to right, transparent, ${activeAccent}, transparent)`,
          boxShadow: `0 0 16px ${activeAccent}`,
          opacity: isPlaying ? 1 : 0.4
        }}
      />

      <div className="flex-1 grid grid-cols-3 items-center px-4 sm:px-8 md:px-10 w-full relative z-10">
        
        {/* SOL: Canlı Parça / Kanal Bilgisi & Albüm Kapağı (Sol Kenara Hizalı) */}
        <div className="flex items-center gap-3.5 min-w-0 justify-start">
          
          {/* Şarkının Gerçek Albüm Kapağı (Plak yerine modern köşeleri yuvarlatılmış albüm görseli) */}
          <div className="relative group shrink-0">
            <div
              className={`w-14 h-14 rounded-xl overflow-hidden transition-all duration-500 shadow-md border relative ${
                isPlaying ? 'scale-[1.03]' : 'scale-100 opacity-90'
              }`}
              style={{
                borderColor: isPlaying ? `${activeAccent}90` : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'),
                boxShadow: isPlaying ? `0 6px 20px ${activeGlow}` : '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {coverArtwork ? (
                <img
                  src={coverArtwork}
                  alt={displayTitle}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    if (currentTrack?.artwork && e.target.src !== currentTrack.artwork) {
                      e.target.src = currentTrack.artwork;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xl">
                  📻
                </div>
              )}

              {/* Çalma durumu mikro equalizer göstergesi */}
              {isPlaying && (
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-black/60 backdrop-blur-md flex items-center gap-0.5 shadow-sm">
                  <span className="w-0.5 h-2 bg-white rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                  <span className="w-0.5 h-3 bg-white rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                  <span className="w-0.5 h-1.5 bg-white rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-700 bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-zinc-900 dark:text-white"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isPlaying ? activeAccent : '#71717a' }}
                />
                {isPlaying ? t('onAir') : t('standby')}
              </span>
              {hasLiveSong && isPlaying && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/25 dark:bg-black/40 backdrop-blur-md border border-white/25 dark:border-white/10 text-zinc-900 dark:text-white shadow-sm"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-ping"
                    style={{ backgroundColor: activeAccent }}
                  />
                  {t('liveTrack')}
                </span>
              )}
              <span className="text-[10px] text-zinc-700 dark:text-zinc-300 hidden lg:inline tracking-widest font-mono font-medium drop-shadow-sm">
                {t('quality')}
              </span>
            </div>

            <h4
              className="font-bold text-sm text-zinc-950 dark:text-white truncate transition-colors duration-500 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
              title={displayTitle}
            >
              {displayTitle}
            </h4>
            <p
              className="text-xs text-zinc-800 dark:text-zinc-200/90 font-medium truncate transition-colors duration-500 drop-shadow-sm"
              title={displaySubtitle}
            >
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* ORTA: Konsol Kontrolleri & Canlı Frekans / Ekolayzır Dalgaları (Tam 50% Ortalanmış) */}
        <div className="flex flex-col items-center justify-center gap-1.5 justify-self-center">
          {/* Kontrol Butonları */}
          <div className="flex items-center gap-4">
            {/* Önceki İstasyon */}
            <button
              onClick={prevStation}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-800 hover:text-black dark:text-zinc-200 dark:hover:text-white bg-white/30 hover:bg-white/50 dark:bg-black/40 dark:hover:bg-black/60 border border-white/30 dark:border-white/10 backdrop-blur-md transition-all duration-150 active:scale-90 cursor-pointer shadow-sm"
              title={t('prevStation')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V7.19c0-1.44-1.555-2.343-2.805-1.628L12 9.529v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
              </svg>
            </button>

            {/* Ana Oynat / Durdur Butonu (Kapağın Rengine Göre Dinamik Işık & Parlama) */}
            <div className="relative flex items-center justify-center">
              {isPlaying && (
                <span
                  className="absolute -inset-2 rounded-full blur-lg opacity-60 animate-pulse pointer-events-none"
                  style={{ backgroundColor: activeAccent }}
                />
              )}
              <button
                onClick={togglePlay}
                style={{
                  backgroundColor: isPlaying ? activeAccent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)'),
                  boxShadow: isPlaying
                    ? `0 0 24px ${activeGlow}, 0 4px 14px rgba(0,0,0,0.35)`
                    : '0 4px 14px rgba(0,0,0,0.12)',
                  transition: 'background-color 0.35s ease, box-shadow 0.35s ease, transform 0.15s ease'
                }}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 border backdrop-blur-md ${
                  isPlaying
                    ? 'border-white/30 text-white hover:brightness-110 shadow-lg'
                    : 'border-white/40 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-white/20 shadow-md'
                }`}
                title={isPlaying ? t('pause') : t('play')}
                aria-label={isPlaying ? t('pause') : t('play')}
              >
                <div className="relative w-5 h-5 flex items-center justify-center pointer-events-none">
                  {isLoading ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      {/* Oynat İkonu */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`w-5 h-5 absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                          isPlaying
                            ? 'opacity-0 scale-50 rotate-90 pointer-events-none'
                            : 'opacity-100 scale-100 rotate-0'
                        }`}
                      >
                        <path d="M8.45 5.25C7.76 4.85 6.95 5.35 6.95 6.15v11.7c0 .8.81 1.3 1.5.9l10.25-5.85c.67-.4.67-1.4 0-1.8L8.45 5.25z" />
                      </svg>

                      {/* Duraklat İkonu */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`w-5 h-5 absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                          isPlaying
                            ? 'opacity-100 scale-100 rotate-0'
                            : 'opacity-0 scale-50 -rotate-90 pointer-events-none'
                        }`}
                      >
                        <rect x="6.25" y="5" width="3.5" height="14" rx="1.75" />
                        <rect x="14.25" y="5" width="3.5" height="14" rx="1.75" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Sonraki İstasyon */}
            <button
              onClick={nextStation}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-800 hover:text-black dark:text-zinc-200 dark:hover:text-white bg-white/30 hover:bg-white/50 dark:bg-black/40 dark:hover:bg-black/60 border border-white/30 dark:border-white/10 backdrop-blur-md transition-all duration-150 active:scale-90 cursor-pointer shadow-sm"
              title={t('nextStation')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.347 12 7.25 12 8.69v2.34L5.055 7.06Z" />
              </svg>
            </button>
          </div>

          {/* Dinamik Ekolayzır Çubukları (Kapağın Renginde Dans Eder) */}
          <div className="flex items-end justify-center gap-1 h-5 px-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <span
                key={num}
                style={{
                  backgroundColor: isPlaying ? activeAccent : (isDark ? '#3f3f46' : '#94a3b8'),
                  boxShadow: isPlaying ? `0 0 8px ${activeGlow}` : 'none',
                  transition: 'background-color 0.6s ease'
                }}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying ? `animate-eq-${num}` : 'h-1'
                }`}
              />
            ))}
          </div>
        </div>

        {/* SAĞ: Ses Kontrolü & Stüdyo Detayları (Sağ Kenara Hizalı) */}
        <div className="flex items-center justify-end gap-5 min-w-0 justify-self-end">
          {/* Stüdyo Koordinat / Canlı Frekans Damgası */}
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-zinc-700 dark:text-zinc-400 tracking-wider block font-mono font-medium drop-shadow-sm">{t('ankara')}</span>
            <span className="text-[11px] text-zinc-900 dark:text-zinc-200 font-semibold font-mono drop-shadow-sm">39.93°N / 32.85°E</span>
          </div>

          {/* Ses Ayar Çubuğu (Kapağın Rengi İle Uyumlu) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white p-1 rounded transition-colors cursor-pointer"
              title={isMuted ? t('unmute') : t('mute')}
            >
              {isMuted || volume === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 transition-colors duration-500"
                  style={{ color: activeAccent }}
                >
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5A2.25 2.25 0 0 0 4.5 16.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 0 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 0 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5A2.25 2.25 0 0 0 4.5 16.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                  <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ accentColor: activeAccent }}
              className="w-16 sm:w-24 h-1.5 bg-black/20 dark:bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-700 backdrop-blur-sm"
              title={`${t('volumeLevel')}: %${Math.round((isMuted ? 0 : volume) * 100)}`}
            />
          </div>
        </div>

      </div>
    </footer>
  );
}
