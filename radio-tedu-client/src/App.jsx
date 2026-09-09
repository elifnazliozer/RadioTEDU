import React, { useState, useRef, useEffect } from 'react';
import ExploreSection from './components/ExploreSection';
import ArtisticPlayer from './components/ArtisticPlayer';
import ScheduleWidget from './components/ScheduleWidget';
import CampusWallTicker from './components/CampusWallTicker';
import { useLanguage } from './context/LanguageContext';

function App() {
  const { t, language } = useLanguage();
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, loading]);

  const handleAiSubmit = async (e) => {
    // enter'a basıldıysa ya da butona tıklandıysa çalışır
    if ((e.key === 'Enter' || e.type === 'click') && userInput.trim() !== '' && !loading) {
      const moodText = userInput.trim();
      setUserInput('');
      setLoading(true);

      // user'ın mesajını sohbet geçmişine ekler
      setChatMessages(prev => [...prev, { sender: 'user', text: moodText }]);

      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/ai-director`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mood: moodText, lang: language }),
        });

        if (!response.ok) {
          throw new Error('Sunucu yanıt vermedi.');
        }

        const data = await response.json();

        setChatMessages(prev => [...prev, {
          sender: 'ai',
          song: data.song,
          message: data.message
        }]);
      } catch (error) {
        console.error("AI Bağlantı Hatası:", error);
        setChatMessages(prev => [...prev, {
          sender: 'ai',
          message: t('aiError')
        }]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-radio-dark text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* Üst ana içerik (Sol: Keşfet Sayfası, Sağ: Program Takvimi & AI Direktörü) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sol sütun: RadioTEDU Keşfet Sayfası (Radyolar, Podcastler, Son Bölümler) */}
        <ExploreSection />

        {/* Sağ sütun: Takvim ve AI Direktörü Sohbeti */}
        <aside className="w-full md:w-1/3 flex flex-col overflow-y-auto custom-scrollbar bg-[#fdfbf7] dark:bg-[#120e0c] border-t md:border-t-0 md:border-l border-stone-200 dark:border-stone-800 transition-colors duration-300">
          {/* Gelişmiş Dinamik Yayın Akışı / Takvim Bileşeni */}
          <ScheduleWidget />
          
          <div className="flex-1 min-h-[320px] p-5 flex flex-col bg-[#fdfbf7] dark:bg-[#120e0c] shrink-0">
            <div className="shrink-0 mb-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-500 shadow-[0_0_12px_rgba(225,29,72,0.2)] shrink-0">
                  <svg className="w-3.5 h-3.5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 00-2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <span className="font-extrabold tracking-tight text-stone-900 dark:text-stone-100">{t('aiTitle')}</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{t('aiSubtitle')}</p>
            </div>
            
            {/* Sohbet / Mesaj Akışı */}
            <div className="flex-1 overflow-y-auto space-y-2.5 mb-3 pr-1 text-xs custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 text-center text-xs px-4">
                  <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#1a1614] border border-stone-200 dark:border-stone-800 flex items-center justify-center text-red-600 dark:text-red-500 mb-2 shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                    </svg>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 font-medium">{t('aiEmptyTitle')}</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">{t('aiEmptyHint')}</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  msg.sender === 'user' ? (
                    <div key={index} className="flex justify-end">
                      <div className="bg-red-600 text-white rounded-2xl rounded-tr-none px-3.5 py-2 max-w-[85%] text-xs shadow-sm">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="flex justify-start">
                      <div className="bg-stone-100 dark:bg-[#1a1614] border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-2xl rounded-tl-none p-3 max-w-[90%] shadow-sm">
                        {msg.song && (
                          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-stone-200 dark:border-stone-800">
                            <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 text-xs truncate">
                              <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                              <span className="truncate">{msg.song}</span>
                            </div>
                            <a
                              href={`https://open.spotify.com/search/${encodeURIComponent(msg.song)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1DB954] hover:text-[#1ed760] bg-[#1DB954]/10 hover:bg-[#1DB954]/20 px-2 py-0.5 rounded-md transition-all shrink-0 cursor-pointer"
                              title="Spotify'da Aç"
                            >
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                              <span>Spotify ↗</span>
                            </a>
                          </div>
                        )}
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-xs">{msg.message}</p>
                      </div>
                    </div>
                  )
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 dark:bg-[#1a1614] border border-stone-200 dark:border-stone-800 rounded-2xl rounded-tl-none px-3 py-2 text-xs text-stone-600 dark:text-stone-400 flex items-center gap-2 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                    <span>{t('aiLoading')}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Alanı */}
            <div className="bg-stone-100 dark:bg-[#1a1614] p-2 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2 shrink-0 shadow-sm">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleAiSubmit}
                disabled={loading}
                placeholder={loading ? t('aiPreparing') : t('aiPlaceholder')}
                className="w-full bg-transparent focus:outline-none text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 px-2 py-1"
              />
              <button 
                onClick={handleAiSubmit}
                disabled={loading || !userInput.trim()}
                className="bg-red-700 dark:bg-red-600 hover:bg-red-800 dark:hover:bg-red-500 text-white p-2 rounded-lg transition-all disabled:opacity-30 cursor-pointer flex items-center justify-center shrink-0 shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.93.75.75 0 0 0 0-1.608A60.518 60.518 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Canlı Kampüs Duvarı Kayan İstek/Mesaj Bandı (Ticker) */}
      <CampusWallTicker />

      {/* Alt Artistik Radyo Oynatıcısı (Artistic Player) */}
      <ArtisticPlayer />

    </div>
  );
}

export default App;