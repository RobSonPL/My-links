
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Todo, TodoCategory } from '../types';

interface Props {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

const DEFAULT_NOTIFICATION_SOUND = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

type SortType = 'newest' | 'oldest' | 'due_time';

const TodoSection: React.FC<Props> = ({ todos, setTodos }) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory>(TodoCategory.TODAY);
  const [sortType, setSortType] = useState<SortType>('newest');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const firedRemindersRef = useRef<Set<string>>(new Set());

  // Request Notification Permission (Apple/System)
  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  // Background reminder checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      todos.forEach(todo => {
        if (!todo.completed && todo.remindMe && todo.reminderTime === currentTime && !firedRemindersRef.current.has(todo.id)) {
          // Play sound
          const audio = new Audio(DEFAULT_NOTIFICATION_SOUND);
          audio.play().catch(e => console.debug("Audio blocked", e));
          
          // Show System Notification (Apple/Desktop)
          if (notifPermission === 'granted') {
            new Notification(`Powiadomienie: ${todo.text}`, {
              body: `Masz zadanie na teraz! (${todo.category})`,
              icon: 'https://cdn-icons-png.flaticon.com/512/1157/1157000.png',
              silent: false,
              requireInteraction: true
            });
          }
          firedRemindersRef.current.add(todo.id);
        }
      });
    }, 10000); // Check every 10 seconds for better responsiveness

    return () => clearInterval(interval);
  }, [todos, notifPermission]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      category: selectedCategory,
      completed: false,
      remindMe: false,
      createdAt: Date.now()
    };
    setTodos([newTodo, ...todos]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const updateTodoReminder = (id: string, remindMe: boolean, time?: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, remindMe, reminderTime: time || t.reminderTime } : t));
    if (!remindMe) firedRemindersRef.current.delete(id);
  };

  const sortedTodos = useMemo(() => {
    const copy = [...todos];
    switch (sortType) {
      case 'newest': return copy.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest': return copy.sort((a, b) => a.createdAt - b.createdAt);
      case 'due_time': return copy.sort((a, b) => (a.reminderTime || '99:99').localeCompare(b.reminderTime || '99:99'));
      default: return copy;
    }
  }, [todos, sortType]);

  const renderCategory = (category: TodoCategory, label: string) => {
    const categoryTodos = sortedTodos.filter(t => t.category === category);
    return (
      <div className="mb-8 last:mb-0">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{label}</h3>
        <div className="space-y-2">
          {categoryTodos.length === 0 ? (
            <div className="text-xs italic text-slate-400 px-1 py-4 border-2 border-dashed border-slate-100 rounded-xl text-center">
              Brak zadań...
            </div>
          ) : (
            categoryTodos.map(todo => (
              <div 
                key={todo.id} 
                className={`group flex flex-col p-3 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <input 
                      type="checkbox" 
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {todo.text}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteTodo(todo.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                {!todo.completed && (
                  <div className="mt-2 flex items-center space-x-3 px-8">
                    <button 
                      onClick={() => updateTodoReminder(todo.id, !todo.remindMe)}
                      className={`flex items-center space-x-1 text-[10px] font-black px-3 py-1 rounded-full transition-colors ${
                        todo.remindMe ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                      <span className="uppercase tracking-tighter">{todo.remindMe ? todo.reminderTime : 'PRZYPOMNIJ'}</span>
                    </button>
                    {todo.remindMe && (
                      <input 
                        type="time" 
                        value={todo.reminderTime || '12:00'}
                        onChange={(e) => updateTodoReminder(todo.id, true, e.target.value)}
                        className="text-[10px] font-black bg-white border border-slate-200 rounded px-1 text-slate-600 outline-none"
                      />
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Zadania</h2>
        <div className="flex items-center gap-2">
          {notifPermission !== 'granted' && (
            <button 
              onClick={requestPermission}
              className="text-[10px] font-black uppercase bg-amber-50 text-amber-600 px-3 py-1 rounded-lg border border-amber-100 hover:bg-amber-100 transition-all animate-pulse"
            >
              Włącz powiadomienia Apple
            </button>
          )}
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value as SortType)}
            className="text-[10px] font-black uppercase bg-slate-50 border-none rounded-lg px-2 py-1 text-slate-400 cursor-pointer outline-none focus:ring-1 focus:ring-indigo-200"
          >
            <option value="newest">Najnowsze</option>
            <option value="oldest">Najstarsze</option>
            <option value="due_time">Godzina</option>
          </select>
        </div>
      </div>
      
      <form onSubmit={addTodo} className="mb-8">
        <div className="flex flex-col space-y-4">
          <input 
            type="text" 
            value={newTodoText}
            onChange={e => setNewTodoText(e.target.value)}
            placeholder="Co planujesz na dziś?"
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-slate-800 transition-all bg-slate-50/50 shadow-inner"
          />
          <div className="flex space-x-2">
            {[
              { id: TodoCategory.TODAY, label: 'Dzisiaj' },
              { id: TodoCategory.TOMORROW, label: 'Jutro' },
              { id: TodoCategory.THIS_WEEK, label: 'Tydzień' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-1 text-[10px] py-3 rounded-xl font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">+</button>
          </div>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto pr-1">
        {renderCategory(TodoCategory.TODAY, 'Dzisiaj')}
        {renderCategory(TodoCategory.TOMORROW, 'Jutro')}
        {renderCategory(TodoCategory.THIS_WEEK, 'W tym tygodniu')}
      </div>
    </div>
  );
};

export default TodoSection;
