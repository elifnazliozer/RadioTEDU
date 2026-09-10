import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// kampüs duvarı başlangıç mesajları
const INITIAL_SHOUTS = [
  { id: 1, author: "Mimarlık '25", loc: "Aksu Blokları DB20", text: "Stüdyoda sabahlarken ses ver! Çizimler bitmiyor...", type: "🏛️" },
  { id: 2, author: "Selin K.", loc: "Kütüphane Kat 3", text: "Kahve molası verenlere selam, Lo-Fi akışı harika gidiyor.", type: "☕" },
  { id: 3, author: "Mühendislik", loc: "Blok A Lab", text: "Finallere son 3 gün, enerjimiz yüksek!", type: "⚡" },
  { id: 4, author: "Deniz & Arda", loc: "Çimler", text: "Güneş açtı, çimlerdeyiz! Rock kanalına geçin 🎸", type: "☀️" },
  { id: 5, author: "DJ RadioTEDU", loc: "Ana Stüdyo", text: "Sağ alttaki AI Direktör'e ruh halini yaz, sana özel çalsın!", type: "🎙️" },
  { id: 6, author: "Mert B.", loc: "Kolej Kafe", text: "Beach House çalan direktöre teşekkürler, günümü kurtardı.", type: "🎧" }
];

// kampüs duvarı canlı kayan yazı bandı ve not bırakma modalı
export default function CampusWallTicker({ onOpenShoutModal }) {
  const { t } = useLanguage();
  const [shouts, setShouts] = useState(INITIAL_SHOUTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newText, setNewText] = useState('');

  // kullanıcının bıraktığı yeni kampüs notunu kayan banda ekleyen form işleyici
  const handleAddShout = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newShout = {
      id: Date.now(),
      author: newAuthor.trim() || 'Anonim Dinleyici',
      loc: newLoc.trim() || 'Kampüs',
      text: newText.trim(),
      type: '💬'
    };

    setShouts([newShout, ...shouts]);
    setNewAuthor('');
    setNewLoc('');
    setNewText('');
    setIsModalOpen(false);
  };

  // esc tuşuna basıldığında modalı kapat
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // sonsuz döngü için listeyi çoğaltıyoruz
  const marqueeItems = [...shouts, ...shouts];

  return (
    <>
      {/* kayan bant barı */}
      <div className="w-full h-8 shrink-0 z-40 bg-[#f3eee6] dark:bg-[#0e0b0a] border-y border-stone-300 dark:border-stone-800 backdrop-blur-md flex items-center select-none overflow-hidden transition-colors duration-300 relative">
        
        {/* sol kırmızı rozet */}
        <div className="bg-red-700 text-white font-black text-[10px] uppercase tracking-widest px-3 h-full flex items-center gap-1.5 shrink-0 shadow-md z-10 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-red-200 animate-ping"></span>
          <span>{t('wallBadge')}</span>
        </div>

        {/* kayan yazı alanı */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker flex items-center whitespace-nowrap py-1 font-mono">
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-2 text-[11px] text-stone-700 dark:text-stone-300 px-6 cursor-default transition-colors"
              >
                <span className="text-xs">{item.type}</span>
                <span className="font-semibold text-red-700 dark:text-red-400">[{item.author}]</span>
                <span className="text-stone-500 dark:text-stone-400 text-[10px]">({item.loc}):</span>
                <span className="font-normal text-stone-800 dark:text-stone-100">"{item.text}"</span>
                <span className="text-red-700/40 dark:text-red-500/40 font-mono text-[10px] ml-4">//</span>
              </div>
            ))}
          </div>
        </div>

        {/* sağ buton: not bırak */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-full px-3 bg-stone-200 hover:bg-red-700 text-stone-800 hover:text-white dark:bg-stone-800 dark:hover:bg-red-600 dark:text-stone-200 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 shrink-0 border-l border-stone-300 dark:border-stone-800 z-10 cursor-pointer shadow-sm font-mono"
          title={t('wallModalTitle')}
        >
          <span>+</span>
          <span className="hidden sm:inline">{t('wallLeaveNote')}</span>
        </button>
      </div>

      {/* mesaj bırakma modal penceresi */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#121217] border border-zinc-300 dark:border-red-500/30 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-zinc-900 dark:text-white transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📢</span>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{t('wallModalTitle')}</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{t('wallModalSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white p-1 text-lg rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddShout} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1 text-[10px] uppercase">
                    {t('wallYourName')}
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder={t('wallNamePlaceholder')}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1 text-[10px] uppercase">
                    {t('wallLocation')}
                  </label>
                  <input
                    type="text"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    placeholder={t('wallLocPlaceholder')}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1 text-[10px] uppercase">
                  {t('wallMessage')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  maxLength="120"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder={t('wallMsgPlaceholder')}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
                ></textarea>
                <div className="text-right text-[10px] text-zinc-500">
                  {120 - newText.length} {t('wallCharsLeft')}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer border border-zinc-200 dark:border-transparent transition-colors"
                >
                  {t('wallCancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 dark:bg-red-600 hover:bg-red-800 dark:hover:bg-red-500 text-white font-semibold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {t('wallSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
