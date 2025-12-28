
import React, { useState, useEffect } from 'react';
import { Todo, TodoCategory } from '../types';

interface Props {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

const TodoSection: React.FC<Props> = ({ todos, setTodos }) => {
  const [showArchive, setShowArchive] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedCat, setSelectedCat] = useState<TodoCategory>(TodoCategory.TODAY);
  const [remindMe, setRemindMe] = useState(false);
  const [reminderTime, setReminderTime] = useState('12:00');

  const handleCompleteAndArchive = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: true, isArchived: true } : t
    ));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const newTask: Todo = {
      id: Date.now().toString(),
      text: newTaskText,
      category: selectedCat,
      completed: false,
      isArchived: false,
      createdAt: Date.now(),
      remindMe: remindMe,
      reminderTime: remindMe ? reminderTime : undefined
    };
    
    setTodos(prev => [newTask, ...prev]);
    setNewTaskText('');
    setRemindMe(false);
  };

  const restoreTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: false, isArchived: false } : t
    ));
  };

  const deletePermanent = (id: string) => {
    if (window.confirm("Usunąć zadanie na stałe?")) {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  const activeTodos = todos.filter(t => !t.isArchived);
  const archivedTodos = todos.filter(t => t.isArchived);

  const categoryLabels: Record<TodoCategory, string> = {
    [TodoCategory.TODAY]: 'Dzisiaj',
    [TodoCategory.TOMORROW]: 'Jutro',
    [TodoCategory.AFTER_TOMORROW]: 'Pojutrze',
    [TodoCategory.THIS_WEEK]: 'W tym tygodniu'
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Zadania</h2>
        <button 
          onClick={() => setShowArchive(!showArchive)}
          className={`text-[9px] font-black uppercase px-4 py-2 rounded-full transition-all border ${showArchive ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
        >
          {showArchive ? 'Wróć do listy' : `Archiwum (${archivedTodos.length})`}
        </button>
      </div>

      {!showArchive && (
        <form onSubmit={addTask} className="mb-8 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
          <input 
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Co masz do zrobienia?"
            className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 mb-4 shadow-sm"
          />
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
             <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remind_todo"
                  checked={remindMe}
                  onChange={e => setRemindMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remind_todo" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">Przypomnij mi</label>
             </div>
             {remindMe && (
               <input 
                type="time" 
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="bg-white border-none rounded-lg px-2 py-1 text-[10px] font-black text-slate-600 shadow-sm"
               />
             )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as TodoCategory[]).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedCat === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
            <button 
              type="submit" 
              className="ml-auto px-5 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Dodaj +
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {!showArchive ? (
          (Object.keys(categoryLabels) as TodoCategory[]).map(cat => {
            const catItems = activeTodos.filter(t => t.category === cat);
            return (
              <div key={cat} className="mb-6 last:mb-0">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3 border-b border-slate-50 pb-1">{categoryLabels[cat]}</h3>
                <div className="space-y-2.5">
                  {catItems.length === 0 ? (
                    <p className="text-[10px] text-slate-300 italic py-1 pl-2">Brak zadań</p>
                  ) : (
                    catItems.map(todo => (
                      <div key={todo.id} className="group flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                        <div className="flex items-center gap-3.5 flex-1">
                          <input 
                            type="checkbox" 
                            checked={todo.completed} 
                            onChange={() => handleCompleteAndArchive(todo.id)} 
                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 line-clamp-2">
                                {todo.text}
                            </span>
                            {todo.remindMe && (
                                <div className="flex items-center gap-1 mt-1">
                                    <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-[8px] font-black text-indigo-400 uppercase">{todo.reminderTime}</span>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-4 border-b border-amber-50 pb-2">Ukończone / Archiwum</h3>
            <div className="space-y-3">
              {archivedTodos.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-300 italic">Archiwum jest puste.</div>
              ) : (
                archivedTodos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-sm font-medium text-slate-400 line-through">{todo.text}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => restoreTodo(todo.id)} className="text-[8px] font-black uppercase text-indigo-600 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-50 shadow-sm">Przywróć</button>
                      <button onClick={() => deletePermanent(todo.id)} className="text-[8px] font-black uppercase text-red-400 bg-white px-2.5 py-1.5 rounded-lg border border-red-50 shadow-sm">Usuń</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoSection;
