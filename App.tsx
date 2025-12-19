
import React, { useState, useEffect } from 'react';
import BookmarkSection from './components/BookmarkSection';
import TodoSection from './components/TodoSection';
import CalendarSection from './components/CalendarSection';
import { Bookmark, Todo, CalendarEvent, TodoCategory } from './types';

const App: React.FC = () => {
  // TWOJE PRZYWRÓCONE ZAKŁADKI (15 pozycji)
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

  // TWOJE PRZYWRÓCONE ZADANIA (7 pozycji)
  const initialTodos: Todo[] = [
    { id: 't1', text: 'Zintegrować Gemini API z projektem', category: TodoCategory.TODAY, completed: false, createdAt: Date.now() },
    { id: 't2', text: 'Zrobić porządki w folderze pobrane', category: TodoCategory.TODAY, completed: true, createdAt: Date.now() - 86400000 },
    { id: 't3', text: 'Zakupy na cały tydzień', category: TodoCategory.TOMORROW, completed: false, createdAt: Date.now() },
    { id: 't4', text: 'Wieczorny trening cardio (45 min)', category: TodoCategory.TODAY, completed: false, remindMe: true, reminderTime: '19:30', createdAt: Date.now() },
    { id: 't5', text: 'Dokończyć kurs React Advanced', category: TodoCategory.THIS_WEEK, completed: false, createdAt: Date.now() },
    { id: 't6', text: 'Przegląd finansów miesięcznych', category: TodoCategory.THIS_WEEK, completed: false, createdAt: Date.now() - 10000 },
    { id: 't7', text: 'Telefon do ubezpieczalni', category: TodoCategory.TOMORROW, completed: false, createdAt: Date.now() }
  ];

  // TWOJE PRZYWRÓCONE WYDARZENIA (4 pozycje)
  const getInitialEvents = (): CalendarEvent[] => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split('T')[0];
    const nextMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (1 - now.getDay() + 7) % 7).toISOString().split('T')[0];

    return [
      { 
        id: 'e1', 
        title: 'Analiza Dashboardu Hub', 
        date: today, 
        time: '11:00', 
        person: 'Własne', 
        link: '', 
        phone: '', 
        location: 'Biuro', 
        description: 'Sprawdzenie czy wszystkie linki działają poprawnie.' 
      },
      { 
        id: 'e2', 
        title: 'Meeting Team Sync', 
        date: tomorrow, 
        time: '09:30', 
        person: 'Zespół Dev', 
        link: 'https://meet.google.com/abc-def-ghi', 
        phone: '', 
        location: 'Online', 
        remindMe: true, 
        reminderMinutes: 10 
      },
      { 
        id: 'e3', 
        title: 'Konsultacja Medyczna', 
        date: nextMon, 
        time: '15:00', 
        person: 'Specjalista', 
        link: '', 
        phone: '500-600-700', 
        location: 'Centrum Medyczne' 
      },
      { 
        id: 'e4', 
        title: 'Urodziny - Wyjście', 
        date: today, 
        time: '20:00', 
        person: 'Przyjaciele', 
        link: '', 
        phone: '', 
        location: 'Restauracja Rynek' 
      }
    ];
  };

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('hub_bookmarks');
    return saved ? JSON.parse(saved) : initialBookmarks;
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('hub_todos');
    return saved ? JSON.parse(saved) : initialTodos;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('hub_events');
    return saved ? JSON.parse(saved) : getInitialEvents();
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
    <div className="min-h-screen bg-[#fdfdfd] text-slate-900 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-center md:items-baseline justify-between border-b border-slate-100 pb-6 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Personal Hub</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Centrum Produktywności i Linków</p>
        </div>
        <div className="flex flex-col items-center md:items-end bg-white px-6 py-3 rounded-[24px] shadow-sm border border-slate-50">
          <div className="text-lg text-slate-800 font-black tracking-tight">
            {new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">
            {new Date().toLocaleDateString('pl-PL', { weekday: 'long' })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-10">
        <section className="w-full">
          <BookmarkSection 
            bookmarks={bookmarks} 
            setBookmarks={setBookmarks} 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
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

      <footer className="max-w-7xl mx-auto mt-20 pb-10 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Twój prywatny dashboard &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
