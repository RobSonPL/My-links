
import React, { useState, useEffect, useRef } from 'react';
import { Todo, TodoCategory } from '../types';

interface Props {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

const DEFAULT_NOTIFICATION_SOUND = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

const TodoSection: React.FC<Props> = ({ todos, setTodos }) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory>(TodoCategory.TODAY);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const firedRemindersRef = useRef<Set<string>>(new Set());

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
          
          // Show notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`Zadanie: ${todo.text}`, {
              body: `Czas na wykonanie zadania z kategorii ${todo.category}`,
              icon: '/favicon.ico'
            });
          }
          
          firedRemindersRef.current.add(todo.id);
        }
      });
    }, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      category: selectedCategory,
      completed: false,
      remindMe: false
    };
    setTodos([...todos, newTodo]);
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

  const handleShare = async (todo: Todo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Zadanie do zrobienia',
          text: todo.text,
          url: window.location.href
        });
      } catch (err) {
        console.debug('Share failed', err);
      }
    } else {
      alert('Twoja przeglądarka nie wspiera bezpośredniego udostępniania do aplikacji systemowych.');
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string, category: TodoCategory) => {
    if (!draggedId || draggedId === targetId) return;

    const newTodos = [...todos];
    const dragIdx = newTodos.findIndex(t => t.id === draggedId);
    const targetIdx = newTodos.findIndex(t => t.id === targetId);
    
    if (dragIdx === -1 || targetIdx === -1) return;

    const [draggedItem] = newTodos.splice(dragIdx, 1);
    draggedItem.category = category;
    
    const adjustedTargetIdx = newTodos.findIndex(t => t.id === targetId);
    newTodos.splice(adjustedTargetIdx, 0, draggedItem);
    
    setTodos(newTodos);
    setDraggedId(null);
  };

  const renderCategory = (category: TodoCategory, label: string) => {
    const categoryTodos = todos.filter(t => t.category === category);
    return (
      <div className="mb-8 last:mb-0">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{label}</h3>
        <div className="space-y-2">
          {categoryTodos.length === 0 ? (
            <div 
              onDragOver={handleDragOver}
              onDrop={() => {
                if (draggedId) {
                  setTodos(todos.map(t => t.id === draggedId ? { ...t, category } : t));
                }
              }}
              className="text-xs italic text-slate-400 px-1 py-4 border-2 border-dashed border-slate-100 rounded-xl text-center"
            >
              Brak zadań... Upuść tutaj
            </div>
          ) : (
            categoryTodos.map(todo => (
              <div 
                key={todo.id} 
                draggable 
                onDragStart={() => handleDragStart(todo.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(todo.id, category)}
                className={`group flex flex-col p-3 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all cursor-move ${draggedId === todo.id ? 'opacity-30 border-indigo-200' : ''}`}
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
                    <button 
                      onClick={() => handleShare(todo)}
                      title="Wyślij do Apple Reminders / Google Tasks"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                
                {/* Todo Reminder Controls */}
                {!todo.completed && (
                  <div className="mt-2 flex items-center space-x-3 px-8">
                    <button 
                      onClick={() => updateTodoReminder(todo.id, !todo.remindMe)}
                      className={`flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        todo.remindMe ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                      <span>{todo.remindMe ? 'POWIADOMIENIE WŁ.' : 'POWIADOM MNIE'}</span>
                    </button>
                    
                    {todo.remindMe && (
                      <input 
                        type="time" 
                        value={todo.reminderTime || '12:00'}
                        onChange={(e) => updateTodoReminder(todo.id, true, e.target.value)}
                        className="text-[10px] font-bold bg-white border border-slate-200 rounded px-1 text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Lista zadań</h2>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Systemowe Powiadomienia</span>
          <span className="text-[9px] text-indigo-500 font-bold uppercase cursor-help" title="Kliknij ikonę udostępniania, by wysłać zadanie do Apple Reminders lub Google Tasks">Obsługa Apple & Google</span>
        </div>
      </div>
      
      <form onSubmit={addTodo} className="mb-8">
        <div className="flex flex-col space-y-3">
          <input 
            type="text" 
            value={newTodoText}
            onChange={e => setNewTodoText(e.target.value)}
            placeholder="Co jest do zrobienia?"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-inner bg-slate-50 focus:bg-white transition-all"
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
                className={`flex-1 text-xs py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center justify-center"
            >
              +
            </button>
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
