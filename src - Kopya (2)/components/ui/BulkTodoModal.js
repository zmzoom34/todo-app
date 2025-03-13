import React, { useState } from 'react';
import { Edit, Trash, Plus, Save, CircleX, Upload } from "lucide-react";

function BulkTodoModal({ 
  isOpen, 
  onClose, 
  onBulkAdd, 
  onAddTodos 
}) {
  const [bulkText, setBulkText] = useState('');

  const handleBulkAdd = () => {
    // Boş satırları ve başındaki/sonundaki boşlukları kaldır
    const todos = bulkText
      .split('\n')
      .map(todo => todo.trim())
      .filter(todo => todo !== '');

    if (todos.length > 0) {
      onBulkAdd(todos);
      setBulkText('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bulk Add Todos</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <CircleX size={24} />
          </button>
        </div>
        
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="Paste your todos here, one per line"
          className="w-full h-40 p-2 border rounded-md mb-4"
        />
        
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button 
            onClick={handleBulkAdd}
            className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
          >
            <Plus className="mr-2" /> Add Todos
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkTodoModal;