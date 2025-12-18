
import React, { useState, useEffect } from 'react';
import BookmarkSection from './components/BookmarkSection';
import TodoSection from './components/TodoSection';
import CalendarSection from './components/CalendarSection';
import { Bookmark, Todo, CalendarEvent } from './types';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('hub_bookmarks');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((b: any) => ({
        ...b,
        category: b.category || 'www',
        clickCount: b.clickCount || 0
      }));
    }
    return [
      { id: '1', title: 'Google', url: 'https://google.com', category: 'www', clickCount: 0 },
      { id: '2', title: 'YouTube', url: 'https://youtube.com', category: 'Video', clickCount: 0 },
      { id: '3', title: 'GitHub', url: 'https://github.com', category: 'Edukacja AI', clickCount: 0 },
      { id: '4', title: 'Unsplash', url: 'https://unsplash.com', category: 'Foto', clickCount: 0 },
      { id: '5', title: 'Kindle', url: 'https://read.amazon.com', category: 'e-book', clickCount: 0 },
      { id: '6', title: 'Medonet', url: 'https://medonet.pl', category: 'Zdrowie', clickCount: 0 }
    ];
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('hub_todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('hub_events');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hub_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('hub_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('hub_events', JSON.stringify(events));
  }, [events]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex items-baseline justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">My Hub</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Personal Productivity Dashboard</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-800 font-bold">
            {new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long' })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Row 1: Bookmarks Horizontal - Full Width */}
        <section className="w-full">
          <BookmarkSection 
            bookmarks={bookmarks} 
            setBookmarks={setBookmarks} 
          />
        </section>

        {/* Row 2: Todo and Calendar - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <TodoSection 
              todos={todos} 
              setTodos={setTodos} 
            />
          </section>

          <section>
            <CalendarSection 
              events={events} 
              setEvents={setEvents} 
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
