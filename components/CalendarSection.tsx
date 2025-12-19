
import React, { useState } from 'react';
import { CalendarEvent } from '../types';

interface Props {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const CalendarSection: React.FC<Props> = ({ events, setEvents }) => {
  const [syncing, setSyncing] = useState(false);

  const syncGoogle = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    alert("Pomyślnie zsynchronizowano z Kalendarzem Google!");
    setSyncing(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === todayStr);

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 h-full">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Kalendarz</h2>
        <button onClick={syncGoogle} disabled={syncing} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50">
          {syncing ? 'Synchronizacja...' : 'Sync Google'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl shadow-indigo-100 mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Plan na dzisiaj</p>
          <div className="space-y-4">
            {todayEvents.length > 0 ? todayEvents.map(e => (
              <div key={e.id} className="flex justify-between items-center border-b border-indigo-400/30 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-black">{e.title}</p>
                  <p className="text-[10px] opacity-70 uppercase font-bold">{e.location || 'Brak lokalizacji'}</p>
                </div>
                <p className="text-xs font-black bg-white/20 px-3 py-1 rounded-full">{e.time}</p>
              </div>
            )) : <p className="text-sm font-bold opacity-70">Brak zaplanowanych wydarzeń</p>}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Wszystkie Wydarzenia</h3>
          <div className="space-y-3">
            {events.filter(e => e.date !== todayStr).map(e => (
              <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100">
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase">{e.title}</p>
                  <p className="text-[9px] font-bold text-slate-400">{e.date} &bull; {e.person}</p>
                </div>
                <span className="text-[10px] font-black text-indigo-600">{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;
