
import React, { useState, useMemo } from 'react';
import { Bookmark, BookmarkCategory } from '../types';

interface Props {
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
}

const CATEGORIES: BookmarkCategory[] = ['e-book', 'Video', 'Foto', 'www', 'Zdrowie', 'Edukacja AI'];

// Changed JSX.Element to React.ReactElement to fix "Cannot find namespace 'JSX'" error
const CATEGORY_ICONS: Record<BookmarkCategory, React.ReactElement> = {
  'e-book': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  'Video': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  'Foto': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  'www': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  'Zdrowie': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  'Edukacja AI': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
};

const BookmarkSection: React.FC<Props> = ({ bookmarks, setBookmarks }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [formData, setFormData] = useState<{ title: string; url: string; category: BookmarkCategory }>({ title: '', url: '', category: 'www' });
  const [activeTab, setActiveTab] = useState<BookmarkCategory | 'Wszystkie' | 'Ulubione'>('Wszystkie');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const favorites = useMemo(() => {
    return [...bookmarks]
      .filter(b => b.clickCount > 0)
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 4);
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    if (activeTab === 'Wszystkie') return bookmarks;
    if (activeTab === 'Ulubione') return favorites;
    return bookmarks.filter(b => b.category === activeTab);
  }, [bookmarks, activeTab, favorites]);

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
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
    if (draggedIndex === null || activeTab !== 'Wszystkie') return;
    const newBookmarks = [...bookmarks];
    const [draggedItem] = newBookmarks.splice(draggedIndex, 1);
    newBookmarks.splice(index, 0, draggedItem);
    setBookmarks(newBookmarks);
    setDraggedIndex(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Zakładki</h2>
        <button 
          onClick={() => handleOpenForm()}
          className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Dodaj +
        </button>
      </div>

      {/* Favorites Mini Section */}
      {favorites.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Często używane</h3>
          <div className="grid grid-cols-4 gap-2">
            {favorites.map(fav => (
              <a 
                key={fav.id}
                href={fav.url.startsWith('http') ? fav.url : `https://${fav.url}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClick(fav.id)}
                className="flex flex-col items-center group"
                title={fav.title}
              >
                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden mb-1 border border-slate-200 group-hover:border-indigo-300 transition-colors">
                  <img src={getFavicon(fav.url)} alt="" className="w-5 h-5 object-contain" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {['Wszystkie', 'Ulubione', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat as any)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
              activeTab === cat 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {cat !== 'Wszystkie' && cat !== 'Ulubione' && CATEGORY_ICONS[cat as BookmarkCategory]}
            {cat}
          </button>
        ))}
      </div>

      {/* Bookmark Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredBookmarks.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">Brak linków w tej kategorii</div>
        ) : (
          filteredBookmarks.map((bookmark, index) => (
            <div 
              key={bookmark.id} 
              draggable={activeTab === 'Wszystkie'}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`group relative ${activeTab === 'Wszystkie' ? 'cursor-move' : 'cursor-default'} ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <a 
                href={bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => { 
                  if(draggedIndex !== null) {
                    e.preventDefault(); 
                  } else {
                    handleClick(bookmark.id);
                  }
                }}
                className="flex flex-col items-center p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden mb-2 border border-slate-100 relative">
                  {getFavicon(bookmark.url) ? (
                    <img src={getFavicon(bookmark.url)} alt={bookmark.title} className="w-6 h-6 object-contain" />
                  ) : (
                    <div className="text-slate-300">{CATEGORY_ICONS[bookmark.category]}</div>
                  )}
                  <div className="absolute -top-1 -right-1 bg-slate-100 p-0.5 rounded-full border border-white shadow-sm text-slate-400">
                    {CATEGORY_ICONS[bookmark.category]}
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-700 truncate w-full text-center">{bookmark.title}</span>
              </a>
              
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                <button onClick={() => handleOpenForm(bookmark)} className="p-1 bg-white rounded-full shadow-md text-slate-400 hover:text-indigo-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => handleDelete(bookmark.id)} className="p-1 bg-white rounded-full shadow-md text-slate-400 hover:text-red-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingBookmark ? 'Edytuj zakładkę' : 'Dodaj zakładkę'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nazwa</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Adres URL</label>
                <input 
                  type="text" 
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kategoria</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as BookmarkCategory })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 font-medium text-sm">Anuluj</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkSection;
