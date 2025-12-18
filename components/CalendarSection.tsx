
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CalendarEvent } from '../types';

interface Props {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'orange' | 'cyan' | 'fuchsia' | 'slate' | 'custom';

interface ThemeDefinition {
  bg: string;
  text: string;
  border: string;
  accent: string;
  ring: string;
  lightBg: string;
  hex: string;
}

const THEMES: Record<string, ThemeDefinition> = {
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', accent: 'bg-indigo-500', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-50', hex: '#4f46e5' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', accent: 'bg-emerald-500', ring: 'focus:ring-emerald-500', lightBg: 'bg-emerald-50', hex: '#059669' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', accent: 'bg-rose-500', ring: 'focus:ring-rose-500', lightBg: 'bg-rose-50', hex: '#e11d48' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', accent: 'bg-amber-500', ring: 'focus:ring-amber-500', lightBg: 'bg-amber-50', hex: '#d97706' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', accent: 'bg-violet-500', ring: 'focus:ring-violet-500', lightBg: 'bg-violet-50', hex: '#7c3aed' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', accent: 'bg-orange-400', ring: 'focus:ring-orange-500', lightBg: 'bg-orange-50', hex: '#f97316' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', accent: 'bg-cyan-400', ring: 'focus:ring-cyan-500', lightBg: 'bg-cyan-50', hex: '#06b6d4' },
  fuchsia: { bg: 'bg-fuchsia-600', text: 'text-fuchsia-600', border: 'border-fuchsia-600', accent: 'bg-fuchsia-500', ring: 'focus:ring-fuchsia-500', lightBg: 'bg-fuchsia-50', hex: '#c026d3' },
  slate: { bg: 'bg-slate-700', text: 'text-slate-700', border: 'border-slate-700', accent: 'bg-slate-600', ring: 'focus:ring-slate-700', lightBg: 'bg-slate-50', hex: '#334155' },
};

const REMINDER_SOUNDS = [
  { name: 'Standardowy Beep', url: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
  { name: 'Elektroniczny Chime', url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
  { name: 'Spokojny Bell', url: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg' },
];

const DAYS_OF_WEEK = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];

const CalendarSection: React.FC<Props> = ({ events, setEvents }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [calendarTheme, setCalendarTheme] = useState<ThemeColor>(() => {
    return (localStorage.getItem('calendar_theme') as ThemeColor) || 'indigo';
  });
  const [customColor, setCustomColor] = useState(() => {
    return localStorage.getItem('calendar_custom_color') || '#6366f1';
  });
  
  const firedRemindersRef = useRef<Set<string>>(new Set());

  const playPreview = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.debug("Audio preview blocked", e));
  };

  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id' | 'date'>>({
    title: '',
    time: '12:00',
    person: '',
    link: '',
    phone: '',
    location: '',
    description: '',
    remindMe: false,
    reminderMinutes: 15,
    soundUrl: REMINDER_SOUNDS[0].url
  });

  useEffect(() => {
    localStorage.setItem('calendar_theme', calendarTheme);
    localStorage.setItem('calendar_custom_color', customColor);
  }, [calendarTheme, customColor]);

  // Symulacja autoryzacji i synchronizacji
  const handleSyncGoogleCalendar = async () => {
    setIsSyncing(true);
    
    // Symulacja okna logowania / autoryzacji
    if (!isConnected) {
      const confirmAuth = window.confirm("Hub chce uzyskać dostęp do Twojego Kalendarza Google. Czy wyrażasz zgodę?");
      if (!confirmAuth) {
        setIsSyncing(false);
        return;
      }
      // Symulacja opóźnienia sieciowego
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsConnected(true);
    }

    // Symulacja pobierania danych z API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const now = new Date();
    const mockExternalEvents: CalendarEvent[] = [
      {
        id: `google-${Date.now()}-1`,
        title: 'Wideokonferencja Zespół',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split('T')[0],
        time: '09:00',
        person: 'Zespół Marketingu',
        link: 'https://meet.google.com/xyz-abcd-qrs',
        phone: '',
        location: 'Google Meet',
        isExternal: true
      },
      {
        id: `google-${Date.now()}-2`,
        title: 'Warsztaty Design Thinking',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3).toISOString().split('T')[0],
        time: '11:00',
        person: 'Jan Kowalski',
        link: '',
        phone: '',
        location: 'Biuro Centrum',
        isExternal: true
      }
    ];

    setEvents(prev => {
      const internal = prev.filter(e => !e.isExternal);
      return [...internal, ...mockExternalEvents];
    });
    
    setIsSyncing(false);
  };

  // Reminder Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      events.forEach(event => {
        if (event.remindMe && !firedRemindersRef.current.has(event.id)) {
          const [hours, minutes] = event.time.split(':').map(Number);
          const eventDate = new Date(event.date);
          eventDate.setHours(hours, minutes, 0, 0);
          const reminderTime = new Date(eventDate.getTime() - (event.reminderMinutes || 0) * 60000);
          
          if (now >= reminderTime && now < new Date(eventDate.getTime() + 30 * 60000)) {
            const audio = new Audio(event.soundUrl || REMINDER_SOUNDS[0].url);
            audio.play().catch(e => console.debug("Audio playback blocked", e));
            firedRemindersRef.current.add(event.id);
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Przypomnienie: ${event.title}`, { body: `${event.time} - ${event.location || ''}` });
            }
          }
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [events]);

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const adjustedStart = firstDay === 0 ? 6 : firstDay - 1;
    const calendarDays = [];
    for (let i = 0; i < adjustedStart; i++) calendarDays.push(null);
    for (let i = 1; i <= days; i++) calendarDays.push(new Date(year, month, i));
    return calendarDays;
  }, [viewDate]);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDay(dateStr);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    const newEvent: CalendarEvent = { ...formData, id: Date.now().toString(), date: selectedDay };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
    setFormData({ ...formData, title: '', remindMe: false });
  };

  const activeTheme = useMemo(() => {
    if (calendarTheme === 'custom') {
      return { 
        bg: 'bg-custom', text: 'text-custom', border: 'border-custom', accent: 'bg-custom', ring: 'focus:ring-custom', lightBg: 'bg-custom-light', 
        hex: customColor, isCustom: true 
      };
    }
    return { ...THEMES[calendarTheme as string], isCustom: false };
  }, [calendarTheme, customColor]);

  const getThemeStyles = (type: 'bg' | 'text' | 'border' | 'ring' | 'lightBg') => {
    if (!activeTheme.isCustom) return {};
    const color = activeTheme.hex;
    switch (type) {
      case 'bg': return { backgroundColor: color };
      case 'text': return { color: color };
      case 'border': return { borderColor: color };
      case 'ring': return { '--tw-ring-color': color } as React.CSSProperties;
      case 'lightBg': return { backgroundColor: `${color}15` };
      default: return {};
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 flex flex-col gap-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            {viewDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
          </h2>
          {/* Theme Palette */}
          <div className="flex flex-wrap items-center gap-2 mt-4 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            {Object.keys(THEMES).map(t => (
              <button 
                key={t} 
                onClick={() => setCalendarTheme(t as ThemeColor)} 
                className={`w-5 h-5 rounded-full transition-all hover:scale-125 ${THEMES[t].bg} ${calendarTheme === t ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-sm' : ''}`} 
                title={t}
              />
            ))}
            <div className={`w-5 h-5 rounded-full relative overflow-hidden transition-all hover:scale-125 ${calendarTheme === 'custom' ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-sm' : ''}`} style={{ backgroundColor: customColor }}>
              <input 
                type="color" 
                value={customColor} 
                onChange={(e) => { setCustomColor(e.target.value); setCalendarTheme('custom'); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
              />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mr-1">Paleta kolorów</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isConnected 
                ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100' 
                : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-500 hover:text-blue-600 shadow-sm'
            } ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSyncing ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.35 11.1h-9.17v2.73h5.14c-.22 1.1-.87 2.03-1.85 2.68v2.23h3c1.76-1.62 2.77-4 2.77-6.88 0-.6-.05-1.18-.14-1.76z" fill="#4285F4"/><path d="M12.18 21c2.43 0 4.47-.8 5.96-2.18l-3-2.23c-.83.56-1.89.88-2.96.88-2.27 0-4.19-1.53-4.88-3.6H4.26v2.3C5.74 19.1 8.78 21 12.18 21z" fill="#34A853"/><path d="M7.3 13.87c-.17-.5-.27-1.04-.27-1.6s.1-1.1.27-1.6V8.37H4.26c-.57 1.15-.9 2.44-.9 3.8s.33 2.65.9 3.8l3.04-2.3z" fill="#FBBC05"/><path d="M12.18 6.93c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.65 4.3 14.61 3.5 12.18 3.5c-3.4 0-6.44 1.9-7.92 4.87l3.04 2.3c.69-2.07 2.61-3.6 4.88-3.6z" fill="#EA4335"/>
              </svg>
            )}
            {isSyncing ? 'Ładowanie...' : isConnected ? 'Zsynchronizowano' : 'Połącz Kalendarz'}
          </button>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => changeMonth(-1)} className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setViewDate(new Date())} className="px-5 py-1 text-[10px] font-black text-slate-700 hover:text-black uppercase tracking-widest">Dzisiaj</button>
            <button onClick={() => changeMonth(1)} className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase py-4">
            {day}
          </div>
        ))}
        {daysInMonth.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="h-20 sm:h-28 bg-slate-50/50 rounded-3xl" />;
          
          const dateStr = date.toISOString().split('T')[0];
          const isToday = dateStr === todayStr;
          const dayEvents = events.filter(e => e.date === dateStr);
          const hasExternal = dayEvents.some(e => e.isExternal);
          
          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(date)}
              style={isToday ? getThemeStyles('lightBg') : {}}
              className={`h-20 sm:h-28 p-3 border rounded-3xl flex flex-col items-center justify-between transition-all group relative overflow-hidden ${
                isToday 
                  ? (activeTheme.isCustom ? 'border-2' : `border-2 ${activeTheme.border} ${activeTheme.lightBg}`) 
                  : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span 
                className={`text-sm font-black ${isToday ? (activeTheme.isCustom ? '' : activeTheme.text) : 'text-slate-500 group-hover:text-slate-800'}`}
                style={isToday && activeTheme.isCustom ? getThemeStyles('text') : {}}
              >
                {date.getDate()}
              </span>
              
              <div className="flex flex-wrap gap-1 justify-center mt-auto pb-1 max-w-full">
                {dayEvents.slice(0, 4).map(e => (
                  <div 
                    key={e.id} 
                    style={activeTheme.isCustom ? getThemeStyles('bg') : {}}
                    className={`w-2 h-2 rounded-full ${activeTheme.isCustom ? '' : activeTheme.bg} ${e.isExternal ? 'ring-1 ring-white shadow-sm' : ''}`} 
                    title={e.title} 
                  />
                ))}
              </div>
              
              {hasExternal && (
                <div className="absolute top-2 right-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 transform animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Dodaj Plan</h3>
                <p className="text-xs font-bold text-slate-400 mt-2 tracking-widest uppercase">{new Date(selectedDay!).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', weekday: 'long' })}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveEvent} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nazwa wydarzenia</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-8 py-5 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none font-black text-slate-800 transition-all shadow-inner"
                  placeholder="np. Trening, Spotkanie..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Godzina</label>
                  <input 
                    required 
                    type="time" 
                    value={formData.time} 
                    onChange={e => setFormData({...formData, time: e.target.value})} 
                    className="w-full px-8 py-5 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none font-black text-slate-800 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Miejsce</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                    className="w-full px-8 py-5 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none font-black text-slate-800 transition-all shadow-inner"
                    placeholder="Gdzie?" 
                  />
                </div>
              </div>
              
              <div className="p-8 bg-slate-50 rounded-[32px] space-y-6 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      style={formData.remindMe ? getThemeStyles('bg') : {}} 
                      className={`p-3 rounded-2xl ${formData.remindMe && !activeTheme.isCustom ? activeTheme.bg : 'bg-slate-200'} text-white transition-all shadow-md`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    <label className="text-sm font-black text-slate-700 uppercase tracking-tight">Włącz powiadomienie</label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, remindMe: !formData.remindMe})} 
                    style={formData.remindMe ? getThemeStyles('bg') : {}}
                    className={`w-16 h-8 rounded-full relative transition-all ${formData.remindMe && !activeTheme.isCustom ? activeTheme.bg : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${formData.remindMe ? 'right-1.5' : 'left-1.5'}`} />
                  </button>
                </div>

                {formData.remindMe && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-400">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alarm:</span>
                      <input 
                        type="number" 
                        value={formData.reminderMinutes} 
                        onChange={e => setFormData({...formData, reminderMinutes: parseInt(e.target.value) || 0})} 
                        className="w-20 px-3 py-2 rounded-xl border-2 border-slate-100 font-black text-sm text-center focus:border-indigo-500 outline-none" 
                      />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">minut przed czasem</span>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Wybierz dźwięk</label>
                      <div className="space-y-2">
                        {REMINDER_SOUNDS.map(s => (
                          <div 
                            key={s.url} 
                            onClick={() => setFormData({...formData, soundUrl: s.url})}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              formData.soundUrl === s.url 
                                ? `border-indigo-500 bg-white shadow-lg` 
                                : 'border-transparent bg-white/50 hover:bg-white hover:border-slate-100'
                            }`}
                          >
                            <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{s.name}</span>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); playPreview(s.url); }} 
                              style={activeTheme.isCustom ? getThemeStyles('text') : {}}
                              className={`${!activeTheme.isCustom ? activeTheme.text : ''} hover:scale-125 transition-transform`}
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                style={getThemeStyles('bg')}
                className={`w-full py-6 rounded-[28px] font-black uppercase text-sm tracking-[0.2em] text-white shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] ${!activeTheme.isCustom ? activeTheme.bg : ''} hover:brightness-110 active:brightness-90`}
              >
                Zatwierdź Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSection;
