
import React, { useState, useRef } from 'react';
import { CalendarEvent, GoogleSession, MoodEntry, EmotionType } from '../types';

interface Props {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  googleSession: GoogleSession;
  setGoogleSession: React.Dispatch<React.SetStateAction<GoogleSession>>;
  moods: MoodEntry[];
  setMoods: React.Dispatch<React.SetStateAction<MoodEntry[]>>;
}

type ViewType = 'month' | 'week' | 'year';

const PREDEFINED_SOUNDS = [
  { name: 'Standardowy', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { name: 'Cyfrowy', url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3' },
  { name: 'Zen', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { name: 'Energiczny', url: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3' },
  { name: 'Subtelny', url: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' },
  { name: 'Natura', url: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3' },
];

const EMOTIONS: { type: EmotionType, label: string, color: string, bg: string, text: string }[] = [
    { type: 'super', label: 'Super', color: 'bg-emerald-500', bg: 'bg-emerald-500', text: 'text-white' },
    { type: 'ok', label: 'OK', color: 'bg-orange-500', bg: 'bg-orange-500', text: 'text-white' },
    { type: 'kochany', label: 'Kochany', color: 'bg-sky-400', bg: 'bg-sky-400', text: 'text-white' },
    { type: 'słabo', label: 'Słabo', color: 'bg-slate-400', bg: 'bg-slate-400', text: 'text-white' },
    { type: 'masakra', label: 'Masakra', color: 'bg-red-500', bg: 'bg-red-500', text: 'text-white' },
];

const CalendarSection: React.FC<Props> = ({ events, setEvents, googleSession, setGoogleSession, moods, setMoods }) => {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isMoodSelectorOpen, setIsMoodSelectorOpen] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    description: '',
    location: '',
    person: 'Ja',
    soundUrl: PREDEFINED_SOUNDS[0].url
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

  const getMoodForDate = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return moods.find(m => m.date === dateStr);
  };

  const getEventsForDate = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const playPreview = (url: string) => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.src = url;
      audioPreviewRef.current.play().catch(e => console.error("Błąd odtwarzania dźwięku:", e));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewEvent(prev => ({ ...prev, soundUrl: url }));
      playPreview(url);
    }
  };

  const setMood = (emotion: EmotionType) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newMoods = moods.filter(m => m.date !== todayStr);
    setMoods([...newMoods, { date: todayStr, emotion }]);
    setIsMoodSelectorOpen(false);
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
      person: 'Ja',
      soundUrl: PREDEFINED_SOUNDS[0].url
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
      const dayMood = getMoodForDate(d, m, y);
      const moodStyle = EMOTIONS.find(e => e.type === dayMood?.emotion);

      days.push(
        <div 
          key={d} 
          onClick={() => {
            if (!mini) {
              setNewEvent(prev => ({ ...prev, date: `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}` }));
              setIsAddingEvent(true);
            }
          }}
          className={`relative flex flex-col items-center justify-center cursor-pointer ${mini ? 'h-6 w-6 text-[8px]' : 'h-10 w-10 text-xs md:h-12 md:w-12 md:text-sm'} font-bold rounded-xl transition-all ${
            dayMood ? `${moodStyle?.bg} ${moodStyle?.text} shadow-sm` : (active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-100 text-slate-700')
          }`}
        >
          {d}
          {dayEvents.length > 0 && !active && !dayMood && (
            <div className="absolute bottom-1 flex gap-0.5">
              {dayEvents.slice(0, 3).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-indigo-400 rounded-full" />
              ))}
            </div>
          )}
          {dayEvents.length > 0 && dayMood && (
            <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full opacity-60" />
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
      const dayMood = moods.find(m => m.date === dateStr);
      const moodStyle = EMOTIONS.find(e => e.type === dayMood?.emotion);

      weekDays.push(
        <div key={i} className={`flex-1 min-w-[150px] p-4 rounded-3xl border transition-all ${dayMood ? moodStyle?.bg + ' border-transparent ' + moodStyle?.text : (active ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100 ring-offset-2' : 'bg-white border-slate-100')}`}>
          <div className="text-center mb-4 relative">
            <p className={`text-[10px] font-black uppercase ${dayMood ? 'text-white/80' : (active ? 'text-indigo-600' : 'text-slate-300')}`}>{daysOfWeek[i]}</p>
            <p className={`text-xl font-black ${dayMood ? 'text-white' : (active ? 'text-indigo-900' : 'text-slate-800')}`}>{d.getDate()}</p>
          </div>
          <div className="space-y-2">
            {dayEvents.map(e => (
              <div key={e.id} className={`p-2.5 rounded-xl shadow-sm border group relative overflow-hidden ${dayMood ? 'bg-white/10 border-white/20' : 'bg-white border-slate-100'}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${dayMood ? 'bg-white/40' : 'bg-indigo-500'}`} />
                <p className={`text-[9px] font-black uppercase leading-tight truncate ${dayMood ? 'text-white' : 'text-slate-800'}`} title={e.title}>{e.title}</p>
                <p className={`text-[8px] font-bold mt-0.5 ${dayMood ? 'text-white/70' : 'text-slate-400'}`}>{e.time}</p>
                {e.description && <p className={`text-[7px] mt-1 line-clamp-1 italic ${dayMood ? 'text-white/60' : 'text-slate-400'}`}>{e.description}</p>}
              </div>
            ))}
            {dayEvents.length === 0 && <div className={`h-20 border border-dashed rounded-xl ${dayMood ? 'border-white/20' : 'border-slate-100'}`} />}
          </div>
        </div>
      );
    }
    return <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">{weekDays}</div>;
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 h-full flex flex-col relative overflow-hidden">
      <audio ref={audioPreviewRef} hidden />
      
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Kalendarz</h2>
           <div className="flex items-center gap-3 mt-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                <div className="h-1 w-1 bg-slate-200 rounded-full" />
                
                {/* Visual Mood Selector Bar */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100">
                    {EMOTIONS.map(e => (
                        <button
                            key={e.type}
                            onClick={() => setMood(e.type)}
                            title={`Dzisiaj czuję się: ${e.label}`}
                            className={`w-4 h-4 rounded-full ${e.color} hover:scale-125 transition-transform shadow-sm`}
                        />
                    ))}
                    <div className="w-px h-3 bg-slate-200 mx-1" />
                    <button 
                        onClick={() => setIsMoodSelectorOpen(!isMoodSelectorOpen)}
                        className="text-[8px] font-black text-slate-400 uppercase pr-1"
                    >
                        Nastrój
                    </button>
                </div>
           </div>
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

      {isMoodSelectorOpen && (
          <div className="absolute top-24 left-8 right-8 bg-white shadow-2xl rounded-3xl border border-slate-100 p-6 z-[60] animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jak się dziś czujesz?</h4>
                  <button onClick={() => setIsMoodSelectorOpen(false)} className="text-slate-300 hover:text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
              <div className="flex justify-between items-center gap-2">
                  {EMOTIONS.map(e => (
                      <button
                        key={e.type}
                        onClick={() => setMood(e.type)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-110 flex-1 ${e.bg} group`}
                      >
                          <div className={`w-4 h-4 rounded-full border-2 border-white/50 bg-white group-hover:bg-transparent transition-colors`} />
                          <span className="text-[9px] font-black uppercase text-white">{e.label}</span>
                      </button>
                  ))}
              </div>
          </div>
      )}

      {isAddingEvent && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Nowe Wydarzenie</h3>
            <button onClick={() => setIsAddingEvent(false)} className="p-2 text-slate-400 hover:text-slate-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <form onSubmit={handleAddEvent} className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
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
                rows={2}
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Dodatkowe szczegóły..."
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-slate-800 resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dźwięk Powiadomienia</label>
                <div className="relative">
                  <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" id="custom-sound-upload" />
                  <label htmlFor="custom-sound-upload" className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md cursor-pointer hover:bg-indigo-100 transition-colors uppercase">Wgraj własny</label>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PREDEFINED_SOUNDS.map(sound => (
                  <button
                    key={sound.name}
                    type="button"
                    onClick={() => {
                      setNewEvent(prev => ({ ...prev, soundUrl: sound.url }));
                      playPreview(sound.url);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all ${
                      newEvent.soundUrl === sound.url 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                        : 'bg-white border-slate-50 text-slate-500 hover:border-slate-100'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-tight truncate">{sound.name}</span>
                    <div className={`p-1 rounded-full ${newEvent.soundUrl === sound.url ? 'bg-indigo-500' : 'bg-slate-100 text-slate-300'}`}>
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                    </div>
                  </button>
                ))}
              </div>
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
    </div>
  );
};

export default CalendarSection;
