
import React, { useState, useEffect } from 'react';
import BookmarkSection from './components/BookmarkSection.tsx';
import TodoSection from './components/TodoSection.tsx';
import CalendarSection from './components/CalendarSection.tsx';
import { Bookmark, Todo, CalendarEvent, TodoCategory, GoogleSession } from './types.ts';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const initialBookmarks: Bookmark[] = [
    { id: '1', title: 'Google', url: 'https://google.com', category: 'www', clickCount: 42 },
    { id: '2', title: 'YouTube', url: 'https://youtube.com', category: 'Video', clickCount: 38 },
    { id: '3', title: 'GitHub', url: 'https://github.com', category: 'Edukacja AI', clickCount: 25 },
    { id: '4', title: 'Unsplash', url: 'https://unsplash.com', category: 'Foto', clickCount: 12 },
    { id: '5', title: 'Amazon', url: 'https://read.amazon.com', category: 'e-book', clickCount: 15 },
    { id: '6', title: 'Medonet', url: 'https://medonet.pl', category: 'Zdrowie', clickCount: 9 },
    { id: '7', title: 'ChatGPT', url: 'https://chat.openai.com', category: 'Edukacja AI', clickCount: 55 },
    { id: '8', title: 'Netflix', url: 'https://netflix.com', category: 'Video', clickCount: 21 },
    { id: '9', title: 'Pinterest', url: 'https://pinterest.com', category: 'Foto', clickCount: 14 },
    { id: '10', title: 'Legimi', url: 'https://legimi.pl', category: 'e-book', clickCount: 7 },
    { id: '12', title: 'Claude', url: 'https://claude.ai', category: 'Edukacja AI', clickCount: 33 },
    { id: '14', title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'www', clickCount: 29 }
  ];

  const initialTodos: Todo[] = [
    { id: 't1', text: 'Zintegrować Gemini API z projektem', category: TodoCategory.TODAY, completed: false, createdAt: Date.now() },
    { id: 't4', text: 'Wieczorny trening cardio', category: TodoCategory.TODAY, completed: false, remindMe: true, reminderTime: '19:30', createdAt: Date.now() }
  ];

  const getInitialEvents = (): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: 'e1', title: 'Analiza Hub', date: today, time: '11:00', person: 'Własne', link: '', phone: '', location: 'Biuro' }
    ];
  };

  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.warn(`Błąd odczytu ${key} z localStorage`, e);
      return defaultValue;
    }
  };

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadFromStorage('hub_bookmarks_v4', initialBookmarks));
  const [todos, setTodos] = useState<Todo[]>(() => loadFromStorage('hub_todos_v4', initialTodos));
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadFromStorage('hub_events_v4', getInitialEvents()));
  const [googleSession, setGoogleSession] = useState<GoogleSession>(() => loadFromStorage('hub_google_session_v4', { isConnected: false }));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('hub_bookmarks_v4', JSON.stringify(bookmarks));
      localStorage.setItem('hub_todos_v4', JSON.stringify(todos));
      localStorage.setItem('hub_events_v4', JSON.stringify(events));
      localStorage.setItem('hub_google_session_v4', JSON.stringify(googleSession));
    } catch (e) {
      console.error("Błąd zapisu do localStorage", e);
    }
  }, [bookmarks, todos, events, googleSession]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between border-b border-slate-100 pb-8 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">My Hub</h1>
          <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-[0.4em] mt-3">Produktywność • Archiwum • Kalendarz</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-8 py-4 rounded-[32px] shadow-sm border border-slate-50 flex flex-col items-center md:items-end min-w-[180px]">
            <div className="text-xl text-slate-800 font-black tracking-tight">
              {currentTime.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
              {currentTime.toLocaleDateString('pl-PL', { weekday: 'long' })}
            </div>
          </div>
          
          <div className="bg-slate-900 px-8 py-4 rounded-[32px] shadow-xl border border-slate-800 flex flex-col items-center justify-center min-w-[140px]">
            <div className="text-2xl text-white font-black tracking-tighter tabular-nums leading-none">
              {currentTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-1">
              Czas rzeczywisty
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
        <BookmarkSection bookmarks={bookmarks} setBookmarks={setBookmarks} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <TodoSection todos={todos} setTodos={setTodos} />
          <CalendarSection events={events} setEvents={setEvents} googleSession={googleSession} setGoogleSession={setGoogleSession} />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 pb-12 text-center border-t border-slate-50 pt-12">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">System Dashboard v5.1 • ESM Native Build</p>
      </footer>
    </div>
  );
};

export default App;
