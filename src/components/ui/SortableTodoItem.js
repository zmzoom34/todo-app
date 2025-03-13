import React, { useState } from "react";
import { Edit, Trash, Save, CircleX, Volume2, MoreVertical } from "lucide-react";
import Checkbox from "./Checkbox";

function TodoItem({ todo, toggleTodoCompletion, updateTodoItems, onDelete, onEdit, speechLang }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for dropdown menu
  const [editedData, setEditedData] = useState(
    todo.parameters
      ? Object.fromEntries(todo.parameters.map((param) => [param.id, param.value ?? ""]))
      : { text: todo.text ?? "" }
  );

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (todo.parameters) {
      const updatedParameters = todo.parameters.map((param) => ({
        ...param,
        value: editedData[param.id] ?? param.value,
      }));
      onEdit(todo.id, updatedParameters);
    } else if (editedData.text.trim()) {
      onEdit(todo.id, editedData.text);
    }
    setIsEditing(false);
  };

  const handleInputChange = (fieldId, value) => {
    setEditedData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleParameterChange = (index, value) => {
    const updatedParameters = [...todo.parameters];
    updatedParameters[index] = { ...updatedParameters[index], value };
    updateTodoItems(todo.id, updatedParameters);
  };

  const handleSpeak = () => {
    let textToSpeak = "";
    if (todo.parameters) {
      textToSpeak = todo.parameters
        .map((param) =>
          param.type === "checkbox"
            ? `${param.label}: ${param.value ? "checked" : "unchecked"}`
            : `${param.label}: ${param.value || "no value"}`
        )
        .join(", ");
    } else {
      textToSpeak = todo.text;
    }

    if (window.Android) {
      window.Android.speak(textToSpeak, speechLang);
    } else if (window.speechSynthesis && typeof SpeechSynthesisUtterance !== "undefined") {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = speechLang;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported.");
    }
  };

  const isAdvanced = !!todo.parameters;

  return (
    <div className="bg-gray-100 p-2 rounded-lg shadow-sm mb-2">
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-3">
          {isAdvanced ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {todo.parameters.map((param) => (
                <div key={param.id} className="flex flex-col">
                  <label className="text-xs font-medium">
                    {param.label}
                    {param.required && <span className="text-red-500">*</span>}
                  </label>
                  {param.type === "checkbox" ? (
                    <Checkbox
                      checked={editedData[param.id] || false}
                      onChange={(e) => handleInputChange(param.id, e.target.checked)}
                      className="mt-1"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editedData[param.id] || ""}
                      onChange={(e) => handleInputChange(param.id, e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={editedData.text || ""}
              onChange={(e) => handleInputChange("text", e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          )}
          <div className="flex justify-end space-x-3">
            <button type="submit" className="p-2 text-green-500 hover:text-green-700">
              <Save className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <CircleX className="w-5 h-5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start space-x-2">
          <Checkbox
            checked={todo.completed}
            onChange={() => toggleTodoCompletion(todo.id, todo.completed)}
            className="mt-1"
          />
          <div
            className={`flex-grow text-base ${todo.completed ? "line-through text-gray-400" : ""}`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {!isAdvanced ? (
              todo.text
            ) : (
              <div className="space-y-1">
                {todo.parameters.map((param, index) => (
                  <div key={param.id}>
                    {param.type === "checkbox" ? (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={param.value || false}
                          onChange={(e) => handleParameterChange(index, e.target.checked)}
                        />
                        <span className="font-medium">{param.label}</span>
                      </label>
                    ) : (
                      <div>
                        <span className="font-medium">{param.label}: </span>
                        <span>{param.value || "-"}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    handleSpeak();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-green-500 hover:bg-gray-100 text-sm"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Speak
                </button>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-blue-500 hover:bg-gray-100 text-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(todo.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-red-500 hover:bg-gray-100 text-sm"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoItem;