import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  tr: {
    // Header
    slogan: "Farkı Dinle, Farklı Hisset!",
    themeLight: "Açık",
    themeDark: "Koyu",
    liveBadge: "CANLI YAYIN",
    
    // Hero
    heroSubtitle: "● TED Üniversitesi'nin Sesi",
    heroTitle1: "Farkı dinle.",
    heroTitle2: "Farklı hisset.",
    heroDesc: "Ders arasında, kütüphanede veya gecenin tam ortasında: 6 farklı radyo kanalı ve RadioTEDU stüdyolarından çıkan özgün podcastler burada.",
    heroListenLive: "Canlı Dinle",
    heroPause: "Duraklat",
    
    // Tabs
    tabAll: "Tüm İçerikler",
    tabRadios: "Radyolar (5)",
    tabPodcasts: "Podcastler (6)",
    tabEpisodes: "Son Bölümler",
    
    // Stations
    stationsHeaderSmall: "01 / Canlı Kanallar",
    stationsHeaderBig: "Bugün ne dinliyoruz?",
    stationsCount: "6 Radyo Kanalı",
    listen: "Dinle",
    playingPause: "Çalıyor (Duraklat)",
    
    // Podcasts
    podcastsHeaderSmall: "02 / Stüdyodan Çıkanlar",
    podcastsHeaderBig: "RadioTEDU Podcastleri",
    podcastsAllLink: "Tüm seriler →",
    podcastExploreLink: "Seriyi incele →",
    
    // Latest Episodes
    episodesHeaderSmall: "03 / Yeni Bölümler",
    episodesHeaderBig: "Şimdi Dinle",
    episodesSubtitle: "Tıklayıp Anında Başlatın",
    episodePlay: "Bölümü Dinle",
    episodePause: "Durdur",
    
    // Schedule Widget
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
    clickForDetails: "tıkla ve detay gör",
    hostTeam: "Sunucu/Ekip",
    
    // AI Director
    aiTitle: "AI Müzik Direktörü",
    aiSubtitle: "Ruh haline veya yaptığın aktiviteye göre içerik önerelim.",
    aiEmptyTitle: "Şu an ne yapıyorsun? Ruh halini yaz, RadioTEDU DJ'i sana özel çalsın!",
    aiEmptyHint: "Örn: \"Finallere çalışıyorum\", \"Kahve molası\"",
    aiPlaceholder: "Örn: Kütüphanede ders çalışıyorum...",
    aiLoading: "DJ parçayı seçiyor...",
    aiPreparing: "Hazırlanıyor...",
    aiDefaultSong: "RadioTEDU Canlı",
    aiSend: "Gönder",
    aiError: "Bağlantı kurulamadı. Sunucunun çalıştığından emin olun.",
    
    // Campus Wall
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
    
    // Player
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
    defaultSubtitle: "TED Üniversitesi Radyosu"
  },
  en: {
    // Header
    slogan: "Listen to the Difference, Feel Different!",
    themeLight: "Light",
    themeDark: "Dark",
    liveBadge: "LIVE ON AIR",
    
    // Hero
    heroSubtitle: "● Voice of TED University",
    heroTitle1: "Listen to the difference.",
    heroTitle2: "Feel different.",
    heroDesc: "Between lectures, in the library, or in the dead of night: 6 live radio channels and original podcasts straight from RadioTEDU studios.",
    heroListenLive: "Listen Live",
    heroPause: "Pause",
    
    // Tabs
    tabAll: "All Content",
    tabRadios: "Radios (5)",
    tabPodcasts: "Podcasts (6)",
    tabEpisodes: "Latest Episodes",
    
    // Stations
    stationsHeaderSmall: "01 / Live Channels",
    stationsHeaderBig: "What are we playing today?",
    stationsCount: "6 Radio Channels",
    listen: "Listen",
    playingPause: "Playing (Pause)",
    
    // Podcasts
    podcastsHeaderSmall: "02 / Studio Originals",
    podcastsHeaderBig: "RadioTEDU Podcasts",
    podcastsAllLink: "All series →",
    podcastExploreLink: "Explore series →",
    
    // Latest Episodes
    episodesHeaderSmall: "03 / New Releases",
    episodesHeaderBig: "Listen Now",
    episodesSubtitle: "Click & Play Instantly",
    episodePlay: "Play Episode",
    episodePause: "Pause",
    
    // Schedule Widget
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
    
    // AI Director
    aiTitle: "AI Music Director",
    aiSubtitle: "Let us curate content tailored to your mood or activity.",
    aiEmptyTitle: "What are you doing right now? Share your mood, let RadioTEDU DJ play for you!",
    aiEmptyHint: "E.g.: \"Studying for finals\", \"Coffee break\"",
    aiPlaceholder: "E.g.: Studying at the campus library...",
    aiLoading: "DJ is picking a track...",
    aiPreparing: "Preparing...",
    aiDefaultSong: "RadioTEDU Live",
    aiSend: "Send",
    aiError: "Could not connect. Ensure the server is running.",
    
    // Campus Wall
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
    
    // Player
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
    defaultSubtitle: "TED University Radio"
  }
};

const LanguageContext = createContext();

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
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.tr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
