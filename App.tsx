
import React, { useState, useEffect } from 'react';
import BookmarkSection from './components/BookmarkSection';
import TodoSection from './components/TodoSection';
import CalendarSection from './components/CalendarSection';
import { Bookmark, Todo, CalendarEvent, TodoCategory, BookmarkCategory } from './types';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('hub_bookmarks');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Ensure all old bookmarks have category and clickCount
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
      <header className="max-w-7xl mx-auto mb-8 flex items-baseline justify-between">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Personal Hub</h1>
        <div className="text-sm text-slate-500 font-medium">
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bookmark Section - Left */}
        <section className="lg:col-span-3">
          <BookmarkSection 
            bookmarks={bookmarks} 
            setBookmarks={setBookmarks} 
          />
        </section>

        {/* To-Do Section - Middle */}
        <section className="lg:col-span-4">
          <TodoSection 
            todos={todos} 
            setTodos={setTodos} 
          />
        </section>

        {/* Calendar Section - Right */}
        <section className="lg:col-span-5">
          <CalendarSection 
            events={events} 
            setEvents={setEvents} 
          />
        </section>
      </main>
    </div>
  );
};

export default App;
