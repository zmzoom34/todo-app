import React, { useState } from "react";
import TodoCheckbox from "./ui/TodoCheckbox";
import TodoContent from "./ui/TodoContent";
import TodoActions from "./ui/TodoActions";
import TodoEditModal from "./ui/TodoEditModal";

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
  nickName,
  setEditingId,
  setEditCategory,
  setEditAmount,
  setEditUnit,
  editAmount
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start gap-2 sm:items-center gap-3 p-3 rounded-lg border ${
        todo.completed ? "bg-gray-50" : "bg-white"
      }`}
    >
      <TodoCheckbox
        completed={todo.completed}
        onClick={() => toggleComplete(todo, nickName)}
      />

      <TodoContent todo={todo} />

      <TodoActions
        onEdit={() => startEditing(todo)}
        onDelete={() => handleDeleteClick(todo)}
        onArchive={() => handleArchiveClick(todo)}
        editingId={editingId}
        todoId={todo.id}
        showArchive={activeTab !== "archive" && todo.type !== "personal"}
      />

      <TodoEditModal
        isOpen={editingId === todo.id}
        onClose={() => setEditingId(null)}
        todo={todo}
        editText={editText}
        setEditText={setEditText}
        onSave={saveEdit}
        setEditCategory={setEditCategory}
        setEditAmount={setEditAmount}
        setEditUnit={setEditUnit}
        editAmount={editAmount}
      />
    </div>
  );
};

export default TodoItem;