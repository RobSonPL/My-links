
import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '../types';

interface Props {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet';
type ViewMode = 'month' | 'week';

const THEMES: Record<ThemeColor, { bg: string, text: string, border: string, accent: string, ring: string, lightBg: string }> = {
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', accent: 'bg-indigo-500', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-50' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', accent: 'bg-emerald-500', ring: 'focus:ring-emerald-500', lightBg: 'bg-emerald-50' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', accent: 'bg-rose-500', ring: 'focus:ring-rose-500', lightBg: 'bg-rose-50' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', accent: 'bg-amber-500', ring: 'focus:ring-amber-500', lightBg: 'bg-amber-50' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', accent: 'bg-violet-500', ring: 'focus:ring-violet-500', lightBg: 'bg-violet-50' },
};

const DEFAULT_NOTIFICATION_SOUND = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

const CalendarSection: React.FC<Props> = ({ events, setEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [calendarTheme, setCalendarTheme] = useState<ThemeColor>(() => {
    return (localStorage.getItem('calendar_theme') as ThemeColor) || 'indigo';
  });
  
  // Track fired reminders to avoid repeats in the same session
  const firedRemindersRef = useRef<Set<string>>(new Set());

  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id' | 'date'>>({
    title: '',
    time: '12:00',
    person: '',
    link: '',
    phone: '',
    location: '',
    description: '',
    remindMe: false,
    reminderMinutes: 15
  });

  useEffect(() => {
    localStorage.setItem('calendar_theme', calendarTheme);
  }, [calendarTheme]);

  // Audio reminder logic
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      events.forEach(event => {
        if (event.remindMe && !firedRemindersRef.current.has(event.id)) {
          const [hours, minutes] = event.time.split(':').map(Number);
          const eventDate = new Date(event.date);
          eventDate.setHours(hours, minutes, 0, 0);
          
          const reminderTime = new Date(eventDate.getTime() - (event.reminderMinutes || 0) * 60000);
          
          // If current time is past or at the reminder time but before the actual event ends (arbitrary 30 min window)
          if (now >= reminderTime && now < new Date(eventDate.getTime() + 30 * 60000)) {
            const audio = new Audio(DEFAULT_NOTIFICATION_SOUND);
            audio.play().catch(e => console.debug("Audio playback blocked", e));
            firedRemindersRef.current.add(event.id);
            
            // Show browser notification if possible
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Przypomnienie: ${event.title}`, {
                body: `${event.time} - ${event.location || 'Brak lokalizacji'}`
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [events]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday-start
    return new Date(d.setDate(diff));
  };

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const adjustedStart = startOfMonth === 0 ? 6 : startOfMonth - 1;

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const formatDay = (dayDate: Date) => {
    return dayDate.toISOString().split('T')[0];
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;

    const newEvent: CalendarEvent = {
      ...formData,
      id: Date.now().toString(),
      date: selectedDay
    };

    setEvents([...events, newEvent]);
    setIsModalOpen(false);
    setFormData({ title: '', time: '12:00', person: '', link: '', phone: '', location: '', description: '', remindMe: false, reminderMinutes: 15 });
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const eventsOnSelectedDay = events.filter(e => e.date === selectedDay).sort((a, b) => a.time.localeCompare(b.time));
  const activeTheme = THEMES[calendarTheme];

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: adjustedStart }).map((_, i) => (
        <div key={`empty-${i}`} className="h-12 lg:h-16"></div>
      ))}
      {Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
        const dateStr = formatDay(d);
        const dayEvents = events.filter(e => e.date === dateStr);
        const hasEvents = dayEvents.length > 0;
        const hasReminders = dayEvents.some(e => e.remindMe);
        const isToday = new Date().toISOString().split('T')[0] === dateStr;
        
        return (
          <button
            key={dateStr}
            onClick={() => handleDayClick(dateStr)}
            className={`h-12 lg:h-16 flex flex-col items-center justify-center rounded-xl border transition-all relative ${
              isToday 
                ? `${activeTheme.border} ${activeTheme.lightBg} ${activeTheme.text}` 
                : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-sm font-semibold">{i + 1}</span>
            {hasEvents && (
              <div className="mt-1 flex space-x-0.5">
                <div className={`w-1.5 h-1.5 ${hasReminders ? 'bg-amber-500' : activeTheme.accent} rounded-full`}></div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderWeekView = () => {
    const monday = getStartOfWeek(currentDate);
    return (
      <div className="flex flex-col space-y-3">
        {Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const dateStr = formatDay(d);
          const dayEvents = events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          
          return (
            <div 
              key={dateStr} 
              className={`flex p-3 rounded-2xl border transition-all items-center ${
                isToday ? `${activeTheme.border} ${activeTheme.lightBg}` : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <button 
                onClick={() => handleDayClick(dateStr)}
                className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl shadow-sm mr-4 shrink-0 ${
                  isToday ? activeTheme.bg + ' text-white' : 'bg-white text-slate-700'
                }`}
              >
                <span className="text-[10px] font-bold uppercase opacity-80">
                  {d.toLocaleDateString('pl-PL', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
              </button>
              
              <div className="flex-1 overflow-x-auto no-scrollbar py-1">
                <div className="flex space-x-2">
                  {dayEvents.length === 0 ? (
                    <span className="text-xs text-slate-300 font-medium italic py-2">Brak wydarzeń</span>
                  ) : (
                    dayEvents.map(ev => (
                      <div key={ev.id} className="bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm min-w-[120px] max-w-[160px] shrink-0">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${ev.remindMe ? 'bg-amber-500' : activeTheme.accent}`}></span>
                          <span className="text-[10px] font-bold text-slate-400">{ev.time}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate">{ev.title}</p>
                      </div>
                    ))
                  )}
                  <button 
                    onClick={() => handleDayClick(dateStr)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center shrink-0 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kalendarz</h2>
          <div className="flex items-center space-x-3 mt-2">
            <div className="flex space-x-1.5">
              {(Object.keys(THEMES) as ThemeColor[]).map(t => (
                <button 
                  key={t} 
                  onClick={() => setCalendarTheme(t)}
                  className={`w-3 h-3 rounded-full transition-transform hover:scale-125 ${THEMES[t].bg} ${calendarTheme === t ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                />
              ))}
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button 
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                MIESIĄC
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                TYDZIEŃ
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-sm font-bold text-slate-700">
            {viewMode === 'month' 
              ? currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
              : `Tydzień ${getStartOfWeek(currentDate).getDate()}.${getStartOfWeek(currentDate).getMonth()+1}`}
          </span>
          <div className="flex space-x-1">
            <button onClick={handlePrev} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={handleNext} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>
      </div>

      <div className="mb-2">
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-1">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">{d}</div>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'month' ? renderMonthView() : renderWeekView()}

      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Nadchodzące dzisiaj i jutro</h3>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {events
            .filter(e => {
              const evDate = new Date(e.date);
              const today = new Date();
              today.setHours(0,0,0,0);
              const limit = new Date(today);
              limit.setDate(limit.getDate() + 2); // Show next 2 days
              return evDate >= today && evDate < limit;
            })
            .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            .map(event => (
              <div key={event.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col space-y-2 relative group hover:bg-white transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <span className={`text-[10px] font-bold ${activeTheme.text} ${activeTheme.lightBg} px-2 py-0.5 rounded-full uppercase mr-2`}>
                      {new Date(event.date).toLocaleDateString('pl-PL', { weekday: 'short' })} {event.time}
                    </span>
                    {event.remindMe && (
                      <span className="bg-amber-100 text-amber-600 p-1 rounded-full" title={`Przypomnienie: ${event.reminderMinutes} min wcześniej`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                      </span>
                    )}
                  </div>
                  <button onClick={() => deleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                {event.location && (
                  <div className="text-[10px] text-slate-500 flex items-center bg-slate-100 self-start px-2 py-0.5 rounded italic">
                    <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event.location}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Plan na {selectedDay}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className={`text-xs font-bold ${activeTheme.text} uppercase tracking-widest border-b border-slate-100 pb-1`}>Dodaj wydarzenie</h4>
                <form id="event-form" onSubmit={handleSaveEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Tytuł</label>
                      <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 ${activeTheme.ring} outline-none`} placeholder="Spotkanie..." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Godzina</label>
                      <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 ${activeTheme.ring} outline-none`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Osoba</label>
                      <input type="text" value={formData.person} onChange={e => setFormData({...formData, person: e.target.value})} className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 ${activeTheme.ring} outline-none`} placeholder="Imię..." />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Lokalizacja</label>
                      <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 ${activeTheme.ring} outline-none`} placeholder="Gdzie?" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                        Powiadomienie (Audio)
                      </label>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, remindMe: !formData.remindMe})}
                        className={`w-10 h-5 rounded-full relative transition-colors ${formData.remindMe ? activeTheme.bg : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.remindMe ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    {formData.remindMe && (
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          min="0" 
                          max="1440"
                          value={formData.reminderMinutes}
                          onChange={e => setFormData({...formData, reminderMinutes: parseInt(e.target.value) || 0})}
                          className={`w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-2 ${activeTheme.ring} outline-none`} 
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">minut przed</span>
                      </div>
                    )}
                  </div>

                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 ${activeTheme.ring} outline-none resize-none`} 
                    placeholder="Opis..."
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 ${activeTheme.ring} outline-none`} placeholder="Link spotkania" />
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 ${activeTheme.ring} outline-none`} placeholder="Telefon" />
                  </div>
                  
                  <button type="submit" className={`w-full py-2.5 ${activeTheme.bg} text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-md`}>Zapisz wydarzenie</button>
                </form>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Zapisane</h4>
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {eventsOnSelectedDay.length === 0 ? (
                    <p className="text-xs italic text-slate-400 text-center py-8">Brak planów na ten dzień</p>
                  ) : (
                    eventsOnSelectedDay.map(e => (
                      <div key={e.id} className="p-4 bg-slate-50 rounded-xl text-xs relative group border border-slate-100 flex flex-col space-y-2">
                        <div className="flex justify-between items-start">
                          <span className={`font-bold ${activeTheme.text}`}>{e.time} - {e.title}</span>
                          <button onClick={() => deleteEvent(e.id)} className="text-red-400 hover:text-red-600 transition-opacity">Usuń</button>
                        </div>
                        {e.location && <p className="text-slate-500 font-medium italic">📍 {e.location}</p>}
                        {e.description && <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-100">{e.description}</p>}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {e.remindMe && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold text-[9px]">🔔 {e.reminderMinutes}m</span>}
                          {e.link && <a href={e.link} className={`${activeTheme.text} font-bold underline`}>Link</a>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSection;
