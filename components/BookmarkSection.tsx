
import React, { useState, useMemo } from 'react';
import { Bookmark, BookmarkCategory } from '../types';

interface Props {
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
}

const CATEGORIES: BookmarkCategory[] = ['e-book', 'Video', 'Foto', 'www', 'Zdrowie', 'Edukacja AI'];

const CATEGORY_STYLES: Record<BookmarkCategory, { icon: React.ReactElement, gradient: string, color: string, bgColor: string }> = {
  'e-book': { 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    gradient: 'from-orange-400 to-red-500',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  'Video': { 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    gradient: 'from-red-500 to-rose-600',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'Foto': { 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    gradient: 'from-purple-400 to-indigo-500',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  'www': { 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    gradient: 'from-blue-400 to-cyan-500',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  'Zdrowie': { 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    gradient: 'from-emerald-400 to-teal-500',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  'Edukacja AI': { 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    gradient: 'from-indigo-500 to-violet-600',
    color: 'text-violet-600',
    bgColor: 'bg-indigo-50'
  },
};

const BookmarkSection: React.FC<Props> = ({ bookmarks, setBookmarks }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [formData, setFormData] = useState<{ title: string; url: string; category: BookmarkCategory }>({ title: '', url: '', category: 'www' });
  const [activeTab, setActiveTab] = useState<BookmarkCategory | 'Wszystkie' | 'Ulubione'>('Wszystkie');
  const [isGrouped, setIsGrouped] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<BookmarkCategory>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const favorites = useMemo(() => {
    return [...bookmarks]
      .filter(b => b.clickCount > 0)
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 6);
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    if (activeTab === 'Wszystkie') return bookmarks;
    if (activeTab === 'Ulubione') return favorites;
    return bookmarks.filter(b => b.category === activeTab);
  }, [bookmarks, activeTab, favorites]);

  const handleOpenAllInCategory = (cat: BookmarkCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    const catBookmarks = bookmarks.filter(b => b.category === cat);
    catBookmarks.forEach(b => {
      window.open(b.url.startsWith('http') ? b.url : `https://${b.url}`, '_blank');
    });
  };

  const toggleCategoryCollapse = (cat: BookmarkCategory) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(cat)) {
      newCollapsed.delete(cat);
    } else {
      newCollapsed.add(cat);
    }
    setCollapsedCategories(newCollapsed);
  };

  const getThumbnail = (url: string) => {
    try {
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      return `https://image.thum.io/get/width/240/crop/600/noanimate/${cleanUrl}`;
    } catch {
      return '';
    }
  };

  const getFavicon = (url: string, size: number = 64) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`;
    } catch {
      return '';
    }
  };

  const handleClick = (id: string) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, clickCount: b.clickCount + 1 } : b));
  };

  const handleOpenForm = (bookmark?: Bookmark) => {
    if (bookmark) {
      setEditingBookmark(bookmark);
      setFormData({ title: bookmark.title, url: bookmark.url, category: bookmark.category });
    } else {
      setEditingBookmark(null);
      setFormData({ title: '', url: '', category: 'www' });
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBookmark) {
      setBookmarks(bookmarks.map(b => b.id === editingBookmark.id ? { ...b, ...formData } : b));
    } else {
      setBookmarks([...bookmarks, { ...formData, id: Date.now().toString(), clickCount: 0 }]);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || activeTab !== 'Wszystkie' || isGrouped) return;
    const newBookmarks = [...bookmarks];
    const [draggedItem] = newBookmarks.splice(draggedIndex, 1);
    newBookmarks.splice(index, 0, draggedItem);
    setBookmarks(newBookmarks);
    setDraggedIndex(null);
  };

  const renderBookmarkCard = (bookmark: Bookmark, index: number) => {
    const style = CATEGORY_STYLES[bookmark.category];
    return (
      <div 
        key={bookmark.id} 
        draggable={activeTab === 'Wszystkie' && !isGrouped}
        onDragStart={() => handleDragStart(index)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(index)}
        onMouseEnter={() => setHoveredId(bookmark.id)}
        onMouseLeave={() => setHoveredId(null)}
        className={`group relative ${activeTab === 'Wszystkie' && !isGrouped ? 'cursor-move' : 'cursor-default'} ${draggedIndex === index ? 'opacity-30' : ''}`}
      >
        <a 
          href={bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`}
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => { 
            if(draggedIndex !== null) e.preventDefault(); 
            else handleClick(bookmark.id);
          }}
          className="flex flex-col rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
        >
          <div className="relative h-24 overflow-hidden bg-slate-200 border-b border-slate-100 group-hover:h-28 transition-all duration-500">
            <img 
              src={getThumbnail(bookmark.url)} 
              alt="" 
              className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f8fafc/cbd5e1?text=${bookmark.title.substring(0, 1)}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Kategorie Card Icon */}
            <div className="absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur rounded-lg shadow-sm">
                <span className={style.color}>{style.icon}</span>
            </div>

            <div className="absolute -bottom-3 left-3 w-8 h-8 rounded-lg bg-white shadow-md p-1.5 z-10 border border-slate-50">
              <img src={getFavicon(bookmark.url)} alt="" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="p-4 pt-5">
            <span className="text-[10px] font-black text-slate-800 line-clamp-1 uppercase tracking-tight mb-1">
              {bookmark.title}
            </span>
            <div className="flex items-center justify-between">
               <span className={`text-[8px] font-black px-1.5 py-0.5 rounded bg-white ${style.color} uppercase border border-slate-50 flex items-center gap-1`}>
                {style.icon} {bookmark.category}
              </span>
              <span className="text-[8px] text-slate-300 font-bold uppercase">{bookmark.clickCount} klików</span>
            </div>
          </div>
        </a>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1.5 transition-all duration-300 z-20">
          <button onClick={(e) => { e.preventDefault(); handleOpenForm(bookmark); }} className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-slate-100 text-slate-500 hover:text-indigo-600 hover:scale-110 transition-all">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={(e) => { e.preventDefault(); handleDelete(bookmark.id); }} className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-slate-100 text-slate-500 hover:text-red-500 hover:scale-110 transition-all">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 relative overflow-visible">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Twoje Zakładki</h2>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'Wszystkie' && (
            <button 
              onClick={() => setIsGrouped(!isGrouped)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border ${
                isGrouped 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              {isGrouped ? 'Widok grupowy' : 'Siatka'}
            </button>
          )}
          <button 
            onClick={() => handleOpenForm()}
            className="group flex items-center gap-2 text-xs font-black bg-slate-900 text-white px-4 py-2.5 rounded-2xl hover:bg-indigo-600 transition-all shadow-md active:scale-95"
          >
            <span>DODAJ NOWĄ</span>
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 flex-1">
          {['Wszystkie', 'Ulubione', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === cat 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat !== 'Wszystkie' && cat !== 'Ulubione' && (
                <span className={CATEGORY_STYLES[cat as BookmarkCategory].color}>
                  {CATEGORY_STYLES[cat as BookmarkCategory].icon}
                </span>
              )}
              {cat}
            </button>
          ))}
        </div>
        
        {favorites.length > 0 && activeTab !== 'Ulubione' && (
           <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">TOP:</span>
              <div className="flex -space-x-2">
                {favorites.slice(0, 4).map(fav => (
                  <div key={fav.id} className="w-7 h-7 rounded-full bg-white border-2 border-amber-50 p-1 shadow-sm flex items-center justify-center" title={fav.title}>
                    <img src={getFavicon(fav.url, 32)} alt="" className="w-4 h-4 object-contain" />
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>

      <div className="flex flex-col gap-8 min-h-[140px]">
        {activeTab === 'Wszystkie' && isGrouped ? (
          CATEGORIES.map(cat => {
            const catBookmarks = bookmarks.filter(b => b.category === cat);
            if (catBookmarks.length === 0) return null;
            const isCollapsed = collapsedCategories.has(cat);
            const style = CATEGORY_STYLES[cat];

            return (
              <div key={cat} className="flex flex-col gap-4">
                <div 
                  className={`flex items-center justify-between w-full px-5 py-3 rounded-2xl border transition-all ${style.bgColor} ${isCollapsed ? 'opacity-70' : ''} border-slate-100`}
                >
                  <button 
                    onClick={() => toggleCategoryCollapse(cat)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <span className={style.color}>{style.icon}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700">{cat}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-400 shadow-sm">{catBookmarks.length}</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {!isCollapsed && (
                    <button 
                      onClick={(e) => handleOpenAllInCategory(cat, e)}
                      className="ml-4 px-3 py-1.5 bg-white text-[9px] font-black uppercase tracking-tight text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Otwórz wszystkie
                    </button>
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {catBookmarks.map((bookmark, idx) => renderBookmarkCard(bookmark, bookmarks.indexOf(bookmark)))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredBookmarks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-sm bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                Brak zakładek w tej sekcji
              </div>
            ) : (
              filteredBookmarks.map((bookmark, index) => renderBookmarkCard(bookmark, index))
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 transform animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{editingBookmark ? 'Edycja Linku' : 'Nowy Link'}</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nazwa Zakładki</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800 transition-all shadow-inner"
                  placeholder="np. Moja Ulubiona Strona"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adres URL</label>
                <input 
                  type="text" 
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800 transition-all shadow-inner"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategoria</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: c })}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all tracking-tighter ${
                        formData.category === c 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                          : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <span className={formData.category === c ? 'text-white' : CATEGORY_STYLES[c].color}>
                        {CATEGORY_STYLES[c].icon}
                      </span>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-xs hover:bg-slate-200 transition-all">Anuluj</button>
                <button type="submit" className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">Zapisz Zakładkę</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkSection;
