
import React, { useState } from 'react';
import { CalendarEvent, GoogleSession } from '../types';

interface Props {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  googleSession: GoogleSession;
  setGoogleSession: React.Dispatch<React.SetStateAction<GoogleSession>>;
}

type ViewType = 'month' | 'week' | 'year';

const CalendarSection: React.FC<Props> = ({ events, setEvents, googleSession, setGoogleSession }) => {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    description: '',
    location: '',
    person: 'Ja'
  });

  const daysOfWeek = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust to start from Monday
  };

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(next);
  };

  const changeYear = (offset: number) => {
    const next = new Date(currentDate);
    next.setFullYear(currentDate.getFullYear() + offset);
    setCurrentDate(next);
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const getEventsForDate = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;

    const event: CalendarEvent = {
      ...newEvent,
      id: Date.now().toString(),
      link: '',
      phone: ''
    };

    setEvents(prev => [...prev, event]);
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      description: '',
      location: '',
      person: 'Ja'
    });
  };

  // Render Widoku Miesiąca
  const renderMonth = (targetDate: Date, mini = false) => {
    const m = targetDate.getMonth();
    const y = targetDate.getFullYear();
    const daysCount = getDaysInMonth(m, y);
    const startDay = getFirstDayOfMonth(m, y);
    const days = [];

    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} />);
    for (let d = 1; d <= daysCount; d++) {
      const active = isToday(d, m, y);
      const dayEvents = getEventsForDate(d, m, y);
      days.push(
        <div 
          key={d} 
          onClick={() => {
            if (!mini) {
              setNewEvent(prev => ({ ...prev, date: `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}` }));
              setIsAddingEvent(true);
            }
          }}
          className={`relative flex items-center justify-center cursor-pointer ${mini ? 'h-6 w-6 text-[8px]' : 'h-10 w-10 text-xs md:h-12 md:w-12 md:text-sm'} font-bold rounded-xl transition-all ${
            active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          {d}
          {dayEvents.length > 0 && !active && (
            <div className="absolute bottom-1 flex gap-0.5">
              {dayEvents.slice(0, 3).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-indigo-400 rounded-full" />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {!mini && (
          <div className="grid grid-cols-7 mb-2">
            {daysOfWeek.map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase py-2">{d}</div>)}
          </div>
        )}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  // Render Widoku Roku
  const renderYear = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-2 overflow-y-auto max-h-[600px] custom-scrollbar">
        {months.map((name, idx) => {
          const monthDate = new Date(currentDate.getFullYear(), idx, 1);
          return (
            <div key={name} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <h4 className="text-[9px] font-black uppercase text-indigo-500 mb-2 border-b border-indigo-100 pb-1">{name}</h4>
              {renderMonth(monthDate, true)}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Widoku Tygodnia
  const renderWeek = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const active = isToday(d.getDate(), d.getMonth(), d.getFullYear());
      const dateStr = d.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));

      weekDays.push(
        <div key={i} className={`flex-1 min-w-[150px] p-4 rounded-3xl border transition-all ${active ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100 ring-offset-2' : 'bg-white border-slate-100'}`}>
          <div className="text-center mb-4">
            <p className={`text-[10px] font-black uppercase ${active ? 'text-indigo-600' : 'text-slate-300'}`}>{daysOfWeek[i]}</p>
            <p className={`text-xl font-black ${active ? 'text-indigo-900' : 'text-slate-800'}`}>{d.getDate()}</p>
          </div>
          <div className="space-y-2">
            {dayEvents.map(e => (
              <div key={e.id} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                <p className="text-[9px] font-black uppercase text-slate-800 leading-tight truncate" title={e.title}>{e.title}</p>
                <p className="text-[8px] font-bold text-slate-400 mt-0.5">{e.time}</p>
                {e.description && <p className="text-[7px] text-slate-400 mt-1 line-clamp-1 italic">{e.description}</p>}
              </div>
            ))}
            {dayEvents.length === 0 && <div className="h-20 border border-dashed border-slate-100 rounded-xl" />}
          </div>
        </div>
      );
    }
    return <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">{weekDays}</div>;
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 h-full flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Kalendarz</h2>
           <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAddingEvent(true)}
            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mr-2"
          >
            <span className="text-xl font-light">+</span>
          </button>
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {(['month', 'week', 'year'] as ViewType[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${view === v ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v === 'month' ? 'Miesiąc' : v === 'week' ? 'Tydzień' : 'Rok'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => view === 'year' ? changeYear(-1) : changeMonth(-1)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:bg-slate-100">Dziś</button>
        <button onClick={() => view === 'year' ? changeYear(1) : changeMonth(1)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {view === 'month' && renderMonth(currentDate)}
        {view === 'week' && renderWeek()}
        {view === 'year' && renderYear()}
      </div>

      {isAddingEvent && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Nowe Wydarzenie</h3>
            <button onClick={() => setIsAddingEvent(false)} className="p-2 text-slate-400 hover:text-slate-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <form onSubmit={handleAddEvent} className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tytuł</label>
              <input 
                type="text" 
                required
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="np. Wizyta u lekarza"
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-slate-800"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                <input 
                  type="date" 
                  required
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Godzina</label>
                <input 
                  type="time" 
                  required
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokalizacja / Osoba</label>
              <input 
                type="text" 
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value, person: e.target.value})}
                placeholder="np. Biuro / Anna"
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opis</label>
              <textarea 
                rows={3}
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Dodatkowe szczegóły..."
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-slate-800 resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 mt-4"
            >
              Zapisz Wydarzenie
            </button>
          </form>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default CalendarSection;
