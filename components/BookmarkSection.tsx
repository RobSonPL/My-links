
import React, { useState, useMemo } from 'react';
import { Bookmark, BookmarkCategory } from '../types';

interface Props {
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
}

const CATEGORIES: BookmarkCategory[] = ['e-book', 'Video', 'Foto', 'www', 'Zdrowie', 'Edukacja AI'];

const BookmarkSection: React.FC<Props> = ({ bookmarks, setBookmarks }) => {
  const [activeTab, setActiveTab] = useState<BookmarkCategory | 'Wszystkie'>('Wszystkie');
  
  const filtered = useMemo(() => 
    activeTab === 'Wszystkie' ? bookmarks : bookmarks.filter(b => b.category === activeTab)
  , [bookmarks, activeTab]);

  const getFavicon = (url: string) => `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url.startsWith('http') ? url : 'https://'+url).hostname}`;

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Twoje Linki</h2>
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-50 rounded-2xl">
          {['Wszystkie', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-6">
        {filtered.map(b => (
          <a
            key={b.id}
            href={b.url.startsWith('http') ? b.url : `https://${b.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 p-3 rounded-3xl hover:bg-slate-50 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
              <img src={getFavicon(b.url)} alt="" className="w-6 h-6 object-contain" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1243/1243933.png')} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter text-center line-clamp-1 w-full group-hover:text-slate-900">
              {b.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BookmarkSection;
