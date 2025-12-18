
import React, { useState } from 'react';
import { Todo, TodoCategory } from '../types';

interface Props {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

const TodoSection: React.FC<Props> = ({ todos, setTodos }) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory>(TodoCategory.TODAY);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      category: selectedCategory,
      completed: false
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
    // When dropping, also update category if it's different
    draggedItem.category = category;
    
    // Find new target index because index might have shifted
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
                className={`group flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all cursor-move ${draggedId === todo.id ? 'opacity-30 border-indigo-200' : ''}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <input 
                    type="checkbox" 
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={`text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {todo.text}
                  </span>
                </div>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
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
        <span className="text-[10px] text-slate-400 font-bold uppercase">Drag & Drop do reorderu</span>
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
