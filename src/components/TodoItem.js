import React from "react";
import { CheckSquare, Square, Edit, Archive, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ThumbsUp, Pen, Settings } from "lucide-react";

const TodoItem = ({
  todo,
  editingId,
  editText,
  setEditText,
  saveEdit,
  toggleComplete,
  startEditing,
  handleDeleteClick,
  handleArchiveClick,
  activeTab,
  nickName
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        todo.completed 
          ? "bg-green-50 border-green-100" 
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <button 
        onClick={() => toggleComplete(todo, nickName)} 
        className="flex-shrink-0 hover:bg-gray-100 p-1 rounded-full transition-colors"
      >
        {todo.completed ? (
          <CheckSquare className="w-6 h-6 text-green-600" />
        ) : (
          <Square className="w-6 h-6 text-gray-400 hover:text-gray-600" />
        )}
      </button>

      {editingId === todo.id ? (
        <div className="flex-grow flex gap-2">
          <Input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-grow focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <Button 
            onClick={() => saveEdit(todo)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Kaydet
          </Button>
        </div>
      ) : (
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <p
              className={`${
                todo.completed 
                  ? "line-through text-gray-600" 
                  : "text-gray-800"
              }`}
            >
              {todo.text}
            </p>
          </div>
          {todo.completedBy && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <ThumbsUp className="w-3 h-3 text-gray-400" />
              <span>{todo.completedBy}</span>
              <span className="text-gray-400">
                {new Date(todo.updatedAt).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <Pen className="w-3 h-3 text-gray-400" />
            <span>{todo.createdBy}</span>
            <span className="text-gray-400">
              {new Date(todo.createdAt).toLocaleString()}
            </span>
          </div>
          {todo.updatedBy && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Settings className="w-3 h-3 text-gray-400" />
              <span>{todo.updatedBy}</span>
              <span className="text-gray-400">
                {new Date(todo.updatedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => startEditing(todo)}
          disabled={editingId === todo.id}
          className="text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteClick(todo)}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {activeTab !== "archive" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleArchiveClick(todo)}
            className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          >
            <Archive className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TodoItem;