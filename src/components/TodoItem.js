import React from "react";
import { CheckSquare, Square, Edit, Archive, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ThumbsUp, ThumbsDown, Pen, Settings } from "lucide-react";

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
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        todo.completed ? "bg-gray-50" : "bg-white"
      }`}
    >
      <button onClick={() => toggleComplete(todo)} className="flex-shrink-0">
        {todo.completed ? (
          <CheckSquare className="w-6 h-6 text-green-600" />
        ) : (
          <Square className="w-6 h-6 text-gray-400" />
        )}
      </button>

      {editingId === todo.id ? (
        <div className="flex-grow flex gap-2">
          <Input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={() => saveEdit(todo)}>Kaydet</Button>
        </div>
      ) : (
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <p
              className={`${
                todo.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {todo.text}
            </p>
          </div>
          {todo.completedBy && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ThumbsUp className="w-3 h-3 text-gray-600" />
              <span>{todo.completedBy}</span>
              <span>{new Date(todo.updatedAt).toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Pen className="w-3 h-3 text-gray-600" />
            <span>{todo.createdBy}</span>
            <span>{new Date(todo.createdAt).toLocaleString()}</span>
          </div>
          {todo.updatedBy && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Settings className="w-3 h-3 text-gray-600" />
              <span>{todo.updatedBy}</span>
              <span>{new Date(todo.updatedAt).toLocaleString()}</span>
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
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteClick(todo)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {activeTab !== "archive" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleArchiveClick(todo)}
            className="text-red-600 hover:text-red-700"
          >
            <Archive className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TodoItem;