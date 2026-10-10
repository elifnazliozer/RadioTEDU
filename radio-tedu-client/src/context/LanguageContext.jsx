import React, { createContext, useContext, useState, useEffect } from 'react';

// tüm uygulama genelinde türkçe ve ingilizce dil desteği çeviri sözlüğü
export const translations = {
  tr: {
    // header
    slogan: "Farkı Dinle, Farklı Hisset!",
    themeLight: "Açık",
    themeDark: "Koyu",
    liveBadge: "CANLI YAYIN",
    
    // hero
    heroSubtitle: "● TED Üniversitesi'nin Sesi",
    heroTitle1: "Farkı dinle.",
    heroTitle2: "Farklı hisset.",
    heroDesc: "Ders arasında, kütüphanede veya gecenin tam ortasında: 6 farklı radyo kanalı ve RadioTEDU stüdyolarından çıkan özgün podcastler burada.",
    heroListenLive: "Canlı Dinle",
    heroPause: "Duraklat",
    heroFrequency: "108.0 FM · STEREO HD",
    heroQuality: "320 KBPS HD",
    heroOnAirNow: "CANLI STÜDYO YAYINI",
    heroQuickStations: "Radyo Frekansları",
    heroCampusBadge: "ANKARA · TEDÜ KAMPÜSÜ",
    heroVintageTube: "CANLI YAYINDA",
    heroAnalogDial: "ANALOG KADRAN",
    
    // tabs
    tabAll: "Tüm İçerikler",
    tabRadios: "Radyolar (5)",
    tabPodcasts: "Podcastler (6)",
    tabEpisodes: "Son Bölümler",
    
    // stations
    stationsHeaderSmall: "01 / Canlı Kanallar",
    stationsHeaderBig: "Bugün ne dinliyoruz?",
    stationsCount: "6 Radyo Kanalı",
    listen: "Dinle",
    playingPause: "Çalıyor (Duraklat)",
    
    // podcasts
    podcastsHeaderSmall: "02 / Stüdyodan Çıkanlar",
    podcastsHeaderBig: "RadioTEDU Podcastleri",
    podcastsAllLink: "Tüm seriler →",
    podcastExploreLink: "Seriyi incele →",
    
    // latest episodes
    episodesHeaderSmall: "03 / Yeni Bölümler",
    episodesHeaderBig: "Şimdi Dinle",
    episodesSubtitle: "Tıklayıp Anında Başlatın",
    episodePlay: "Bölümü Dinle",
    episodePause: "Durdur",
    
    // schedule widget
    scheduleTitle: "Yayın Akışı",
    scheduleLiveNow: "Şu An Yayında",
    scheduleNext: "Sıradaki",
    scheduleCompleted: "Tamamlandı",
    scheduleFullDay: "Günün Yayın Akışı",
    scheduleHide: "Akışı Gizle",
    scheduleShow: "Akışı Göster",
    today: "Bugün",
    weekdays: "Hafta İçi",
    weekends: "Hafta Sonu",
    activeShow: "ŞU AN YAYINDA",
    broadcastProgress: "Yayın İlerlemesi",
    dailyPrograms: "Günün Programları",
    clickForDetails: "detay görmek için tıkla",
    hostTeam: "Sunucu/Ekip",
    
    // ai director
    aiTitle: "AI Müzik Direktörü",
    aiSubtitle: "Ruh haline veya yaptığın aktiviteye göre içerik önerelem.",
    aiEmptyTitle: "Şu an ne yapıyorsun? Ruh halini yaz, RadioTEDU DJ'i sana özel çalsın!",
    aiEmptyHint: "Örn: \"Finallere çalışıyorum\", \"Kahve molası\"",
    aiPlaceholder: "...",
    aiLoading: "DJ parçayı seçiyor...",
    aiPreparing: "Hazırlanıyor...",
    aiDefaultSong: "RadioTEDU Canlı",
    aiSend: "Gönder",
    aiError: "Bağlantı kurulamadı. Sunucunun çalıştığından emin olun.",
    
    // campus wall
    wallBadge: "KAMPÜS DUVARI",
    wallLeaveNote: "Not Bırak",
    wallModalTitle: "Kampüs Duvarına Not Bırak",
    wallModalSubtitle: "Mesajın canlı yayın bandında tüm dinleyicilere akacak.",
    wallYourName: "İsmin / Takma Adın",
    wallNamePlaceholder: "Örn: Selin (İsteğe bağlı)",
    wallLocation: "Neredesin?",
    wallLocPlaceholder: "Örn: Kütüphane Kat 2",
    wallMessage: "Mesajın / Şarkı İsteğin",
    wallMsgPlaceholder: "Örn: Mimarlık stüdyosunda sabahlarken ses ver! Çizimler bitmiyor...",
    wallCharsLeft: "karakter kaldı",
    wallCancel: "Vazgeç",
    wallSubmit: "Duvara Gönder",
    
    // player
    onAir: "ON AIR",
    standby: "BEKLEMEDE",
    liveTrack: "CANLI PARÇA",
    quality: "320 KBPS · STEREO",
    prevStation: "Önceki İstasyon",
    nextStation: "Sonraki İstasyon",
    play: "Oynat (Space)",
    pause: "Duraklat (Space)",
    unmute: "Sesi Aç",
    mute: "Sesi Kapat",
    volumeLevel: "Ses Seviyesi",
    ankara: "ANKARA",
    citySub: "TEDÜ Kampüsü",
    defaultSubtitle: "TED Üniversitesi Radyosu",
    lyricsTitle: "Şarkı Sözleri",
    lyricsLoading: "Şarkı sözleri yükleniyor...",
    lyricsNotFound: "Bu parça için söz bulunamadı veya enstrümantal yayın.",
    lyricsButton: "Şarkı Sözleri (Lyrics)",
    closeLyrics: "Sözleri Kapat",
    lyricsRetry: "Tekrar Dene",
    lyricsSource: "KAYNAK",
    miniPlayerButton: "Mini Oyuncu (Mini Player)",
    miniPlayerTitle: "RadioTEDU Mini Player",
    miniPlay: "Oynat",
    miniPause: "Duraklat",
    listenOnSpotify: "Spotify'da Dinle"
  },
  en: {
    // header
    slogan: "Listen to the Difference, Feel Different!",
    themeLight: "Light",
    themeDark: "Dark",
    liveBadge: "LIVE ON AIR",
    
    // hero
    heroSubtitle: "● Voice of TED University",
    heroTitle1: "Listen to the difference.",
    heroTitle2: "Feel different.",
    heroDesc: "Between lectures, in the library, or in the dead of night: 6 live radio channels and original podcasts straight from RadioTEDU studios.",
    heroListenLive: "Listen Live",
    heroPause: "Pause",
    heroFrequency: "108.0 FM · STEREO HD",
    heroQuality: "320 KBPS HD",
    heroOnAirNow: "LIVE STUDIO BROADCAST",
    heroQuickStations: "Radio Frequencies",
    heroCampusBadge: "ANKARA · TEDU CAMPUS",
    heroVintageTube: "LIVE ON AIR",
    heroAnalogDial: "ANALOG DIAL",
    
    // tabs
    tabAll: "All Content",
    tabRadios: "Radios (5)",
    tabPodcasts: "Podcasts (6)",
    tabEpisodes: "Latest Episodes",
    
    // stations
    stationsHeaderSmall: "01 / Live Channels",
    stationsHeaderBig: "What are we playing today?",
    stationsCount: "6 Radio Channels",
    listen: "Listen",
    playingPause: "Playing (Pause)",
    
    // podcasts
    podcastsHeaderSmall: "02 / Studio Originals",
    podcastsHeaderBig: "RadioTEDU Podcasts",
    podcastsAllLink: "All series →",
    podcastExploreLink: "Explore series →",
    
    // latest episodes
    episodesHeaderSmall: "03 / New Releases",
    episodesHeaderBig: "Listen Now",
    episodesSubtitle: "Click & Play Instantly",
    episodePlay: "Play Episode",
    episodePause: "Pause",
    
    // schedule widget
    scheduleTitle: "On-Air Schedule",
    scheduleLiveNow: "Live Now",
    scheduleNext: "Up Next",
    scheduleCompleted: "Completed",
    scheduleFullDay: "Today's Schedule",
    scheduleHide: "Hide Schedule",
    scheduleShow: "Show Schedule",
    today: "Today",
    weekdays: "Weekdays",
    weekends: "Weekend",
    activeShow: "LIVE ON AIR",
    broadcastProgress: "Broadcast Progress",
    dailyPrograms: "Today's Programs",
    clickForDetails: "click for details",
    hostTeam: "Host/Team",
    
    // ai director
    aiTitle: "AI Music Director",
    aiSubtitle: "Let us curate content tailored to your mood or activity.",
    aiEmptyTitle: "What are you doing right now? Share your mood, let RadioTEDU DJ play for you!",
    aiEmptyHint: "E.g.: \"Studying for finals\", \"Coffee break\"",
    aiPlaceholder: "...",
    aiLoading: "DJ is picking a track...",
    aiPreparing: "Preparing...",
    aiDefaultSong: "RadioTEDU Live",
    aiSend: "Send",
    aiError: "Could not connect. Ensure the server is running.",
    
    // campus wall
    wallBadge: "CAMPUS WALL",
    wallLeaveNote: "Post Shout",
    wallModalTitle: "Post to Campus Wall",
    wallModalSubtitle: "Your message will stream across the live ticker for all listeners.",
    wallYourName: "Your Name / Nickname",
    wallNamePlaceholder: "E.g.: Selin (Optional)",
    wallLocation: "Where are you?",
    wallLocPlaceholder: "E.g.: Library 2nd Floor",
    wallMessage: "Your Message / Song Request",
    wallMsgPlaceholder: "E.g.: Pulling an all-nighter in the architecture studio! Drawings never end...",
    wallCharsLeft: "characters left",
    wallCancel: "Cancel",
    wallSubmit: "Post to Wall",
    
    // player
    onAir: "ON AIR",
    standby: "STANDBY",
    liveTrack: "NOW PLAYING",
    quality: "320 KBPS · STEREO",
    prevStation: "Previous Station",
    nextStation: "Next Station",
    play: "Play (Space)",
    pause: "Pause (Space)",
    unmute: "Unmute",
    mute: "Mute",
    volumeLevel: "Volume",
    ankara: "ANKARA",
    citySub: "TEDU Campus",
    defaultSubtitle: "TED University Radio",
    lyricsTitle: "Song Lyrics",
    lyricsLoading: "Loading lyrics...",
    lyricsNotFound: "No lyrics found for this track or instrumental broadcast.",
    lyricsButton: "Song Lyrics",
    closeLyrics: "Close Lyrics",
    lyricsRetry: "Try Again",
    lyricsSource: "SOURCE",
    miniPlayerButton: "Mini Player (Picture-in-Picture)",
    miniPlayerTitle: "RadioTEDU Mini Player",
    miniPlay: "Play",
    miniPause: "Pause",
    listenOnSpotify: "Listen on Spotify"
  }
};

const LanguageContext = createContext();

// kullanıcının tercih ettiği dili localStorage üzerinde tutan ve uygulamanın html lang özniteliğini güncelleyen provider
export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('radiotedu_lang');
      return saved === 'en' ? 'en' : 'tr';
    } catch {
      return 'tr';
    }
  });

  const setLanguage = (lang) => {
    const nextLang = lang === 'en' ? 'en' : 'tr';
    setLanguageState(nextLang);
    try {
      localStorage.setItem('radiotedu_lang', nextLang);
      document.documentElement.lang = nextLang;
    } catch {
      // ignore yapacak
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // verilen key değerine göre aktif dildeki karşılık metni döndüren çeviri yardımcısı
  const t = (key) => {
    return translations[language]?.[key] || translations.tr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// languageContext erişimi sağlayan custom hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
