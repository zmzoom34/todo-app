import React, { useState, useEffect } from "react";
import {
  Save,
  CircleX,
} from "lucide-react";

function EditListModal({ isOpen, onClose, list, onSave }) {
  const [listName, setListName] = useState(list?.listName || "");

  useEffect(() => {
    setListName(list?.listName || "");
  }, [list]);

  const handleSave = () => {
    if (listName.trim()) {
      onSave({
        ...list,
        listName: listName.trim(),
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-end">
          <div onClick={onClose}>
            <CircleX
              size={32}
              color="#ff0000"
              strokeWidth={2.5}
              className="cursor-pointer"
            />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Edit List</h2>
        </div>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="Enter list name"
          className="w-full px-3 py-2 border rounded-md mb-4"
        />
        <div className="flex justify-end space-x-2">
          <div onClick={handleSave} disabled={!listName.trim()}>
            <Save
              size={48}
              color="#0000ff"
              strokeWidth={2.5}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditListModal