import React, { useState } from "react";

const TodoDateModal = ({ isOpen, onClose, todo, setEditDueDate, editDueDate, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(editDueDate || "");

  const handleSave = () => {
    setEditDueDate(selectedDate);
    onSave(todo.id, selectedDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-3">Tarihi Düzenle</h2>
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>İptal</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSave}>Kaydet</button>
        </div>
      </div>
    </div>
  );
};

export default TodoDateModal;
