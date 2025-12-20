
import React, { useState, useEffect } from 'react';
import BookmarkSection from './components/BookmarkSection';
import TodoSection from './components/TodoSection';
import CalendarSection from './components/CalendarSection';
import { Bookmark, Todo, CalendarEvent, TodoCategory, GoogleSession } from './types';

const App: React.FC = () => {
  const initialBookmarks: Bookmark[] = [
    { id: '1', title: 'Google Search', url: 'https://google.com', category: 'www', clickCount: 42 },
    { id: '2', title: 'YouTube Media', url: 'https://youtube.com', category: 'Video', clickCount: 38 },
    { id: '3', title: 'GitHub Repo', url: 'https://github.com', category: 'Edukacja AI', clickCount: 25 },
    { id: '4', title: 'Unsplash Photos', url: 'https://unsplash.com', category: 'Foto', clickCount: 12 },
    { id: '5', title: 'Amazon Kindle', url: 'https://read.amazon.com', category: 'e-book', clickCount: 15 },
    { id: '6', title: 'Medonet Zdrowie', url: 'https://medonet.pl', category: 'Zdrowie', clickCount: 9 },
    { id: '7', title: 'ChatGPT AI', url: 'https://chat.openai.com', category: 'Edukacja AI', clickCount: 55 },
    { id: '8', title: 'Netflix Stream', url: 'https://netflix.com', category: 'Video', clickCount: 21 },
    { id: '9', title: 'Pinterest Boards', url: 'https://pinterest.com', category: 'Foto', clickCount: 14 },
    { id: '10', title: 'Legimi E-books', url: 'https://legimi.pl', category: 'e-book', clickCount: 7 },
    { id: '11', title: 'ZnanyLekarz', url: 'https://znanylekarz.pl', category: 'Zdrowie', clickCount: 5 },
    { id: '12', title: 'Claude AI', url: 'https://claude.ai', category: 'Edukacja AI', clickCount: 33 },
    { id: '13', title: 'Behance Design', url: 'https://behance.net', category: 'Foto', clickCount: 11 },
    { id: '14', title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'www', clickCount: 29 },
    { id: '15', title: 'Spotify Web', url: 'https://open.spotify.com', category: 'Video', clickCount: 19 }
  ];

  const initialTodos: Todo[] = [
    { id: 't1', text: 'Zintegrować Gemini API z projektem', category: TodoCategory.TODAY, completed: false, createdAt: Date.now() },
    { id: 't2', text: 'Zrobić porządki w folderze pobrane', category: TodoCategory.TODAY, completed: true, createdAt: Date.now() - 86400000 },
    { id: 't3', text: 'Zakupy na cały tydzień', category: TodoCategory.TOMORROW, completed: false, createdAt: Date.now() },
    { id: 't4', text: 'Wieczorny trening cardio (45 min)', category: TodoCategory.TODAY, completed: false, remindMe: true, reminderTime: '19:30', createdAt: Date.now() },
    { id: 't5', text: 'Dokończyć kurs React Advanced', category: TodoCategory.THIS_WEEK, completed: false, createdAt: Date.now() },
    { id: 't6', text: 'Przegląd finansów miesięcznych', category: TodoCategory.THIS_WEEK, completed: false, createdAt: Date.now() - 10000 },
    { id: 't7', text: 'Telefon do ubezpieczalni', category: TodoCategory.TOMORROW, completed: false, createdAt: Date.now() }
  ];

  const getInitialEvents = (): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return [
      { id: 'e1', title: 'Analiza Dashboardu Hub', date: today, time: '11:00', person: 'Własne', link: '', phone: '', location: 'Biuro' },
      { id: 'e2', title: 'Meeting Team Sync', date: tomorrow, time: '09:30', person: 'Zespół Dev', link: 'https://meet.google.com/abc-def', phone: '', location: 'Online', remindMe: true, reminderMinutes: 10 },
    ];
  };

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('hub_bookmarks_v3');
    return saved ? JSON.parse(saved) : initialBookmarks;
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('hub_todos_v3');
    return saved ? JSON.parse(saved) : initialTodos;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('hub_events_v3');
    return saved ? JSON.parse(saved) : getInitialEvents();
  });

  const [googleSession, setGoogleSession] = useState<GoogleSession>(() => {
    const saved = localStorage.getItem('hub_google_session');
    return saved ? JSON.parse(saved) : { isConnected: false };
  });

  useEffect(() => localStorage.setItem('hub_bookmarks_v3', JSON.stringify(bookmarks)), [bookmarks]);
  useEffect(() => localStorage.setItem('hub_todos_v3', JSON.stringify(todos)), [todos]);
  useEffect(() => localStorage.setItem('hub_events_v3', JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem('hub_google_session', JSON.stringify(googleSession)), [googleSession]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between border-b border-slate-100 pb-8 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">My Hub</h1>
          <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-[0.4em] mt-3">Produktywność • Archiwum • Kalendarz</p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
           {googleSession.isConnected && (
             <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xs uppercase">
                  {googleSession.userName?.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900 leading-none">{googleSession.userName}</span>
                  <span className="text-[8px] font-bold text-slate-400">Google Sync Active</span>
                </div>
             </div>
           )}
          <div className="bg-white px-8 py-4 rounded-[32px] shadow-sm border border-slate-50 flex flex-col items-center md:items-end">
            <div className="text-xl text-slate-800 font-black tracking-tight">
              {new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
              {new Date().toLocaleDateString('pl-PL', { weekday: 'long' })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        <BookmarkSection bookmarks={bookmarks} setBookmarks={setBookmarks} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <TodoSection todos={todos} setTodos={setTodos} />
          <CalendarSection events={events} setEvents={setEvents} googleSession={googleSession} setGoogleSession={setGoogleSession} />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 pb-12 text-center border-t border-slate-50 pt-12">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">System Dashboard v4.0 • Archiwum Ukończone</p>
      </footer>
    </div>
  );
};

export default App;
