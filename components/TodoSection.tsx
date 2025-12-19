
import React, { useState, useEffect } from 'react';
import { Todo, TodoCategory } from '../types';

interface Props {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

const TodoSection: React.FC<Props> = ({ todos, setTodos }) => {
  const [permission, setPermission] = useState<NotificationPermission>(typeof Notification !== 'undefined' ? Notification.permission : 'default');

  const requestNotifs = async () => {
    if (typeof Notification === 'undefined') return;
    const res = await Notification.requestPermission();
    setPermission(res);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  useEffect(() => {
    const check = setInterval(() => {
      const now = new Date();
      const curTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      todos.forEach(t => {
        if (!t.completed && t.remindMe && t.reminderTime === curTime && permission === 'granted') {
          new Notification(`Zadanie: ${t.text}`, { body: "Czas na realizację!", icon: 'https://cdn-icons-png.flaticon.com/512/1157/1157000.png' });
        }
      });
    }, 60000);
    return () => clearInterval(check);
  }, [todos, permission]);

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Lista Zadań</h2>
        {permission !== 'granted' && (
          <button onClick={requestNotifs} className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all animate-pulse">
            Włącz powiadomienia Apple
          </button>
        )}
      </div>

      <div className="space-y-6">
        {[TodoCategory.TODAY, TodoCategory.TOMORROW, TodoCategory.THIS_WEEK].map(cat => (
          <div key={cat}>
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 border-b border-slate-50 pb-2">{cat.replace('_', ' ')}</h3>
            <div className="space-y-3">
              {todos.filter(t => t.category === cat).map(todo => (
                <div key={todo.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                    <span className={`text-sm font-bold ${todo.completed ? 'line-through text-slate-300' : 'text-slate-700'}`}>{todo.text}</span>
                  </div>
                  {todo.remindMe && <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">{todo.reminderTime}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoSection;
