
import React, { useState } from 'react';
import { Bookmark } from '../types';

interface Props {
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
}

const BookmarkSection: React.FC<Props> = ({ bookmarks, setBookmarks }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch {
      return 'https://picsum.photos/64/64';
    }
  };

  const handleOpenForm = (bookmark?: Bookmark) => {
    if (bookmark) {
      setEditingBookmark(bookmark);
      setFormData({ title: bookmark.title, url: bookmark.url });
    } else {
      setEditingBookmark(null);
      setFormData({ title: '', url: '' });
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBookmark) {
      setBookmarks(bookmarks.map(b => b.id === editingBookmark.id ? { ...b, ...formData } : b));
    } else {
      setBookmarks([...bookmarks, { ...formData, id: Date.now().toString() }]);
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
    if (draggedIndex === null) return;
    const newBookmarks = [...bookmarks];
    const [draggedItem] = newBookmarks.splice(draggedIndex, 1);
    newBookmarks.splice(index, 0, draggedItem);
    setBookmarks(newBookmarks);
    setDraggedIndex(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Zakładki</h2>
        <button 
          onClick={() => handleOpenForm()}
          className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Dodaj +
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {bookmarks.map((bookmark, index) => (
          <div 
            key={bookmark.id} 
            draggable 
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className={`group relative cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <a 
              href={bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => { if(draggedIndex !== null) e.preventDefault(); }}
              className="flex flex-col items-center p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden mb-2 border border-slate-100">
                <img src={getFavicon(bookmark.url)} alt={bookmark.title} className="w-8 h-8 object-contain" />
              </div>
              <span className="text-xs font-medium text-slate-700 truncate w-full text-center">{bookmark.title}</span>
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
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingBookmark ? 'Edytuj zakładkę' : 'Dodaj zakładkę'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adres URL</label>
                <input 
                  type="text" 
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 font-medium">Anuluj</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkSection;
