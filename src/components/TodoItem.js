import React from "react";
import TodoCheckbox from "./ui/TodoCheckbox";
import TodoEditForm from "./ui/TodoEditForm";
import TodoContent from "./ui/TodoContent";
import TodoActions from "./ui/TodoActions";

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
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border ${
        todo.completed ? "bg-gray-50" : "bg-white"
      }`}
    >
      <TodoCheckbox 
        completed={todo.completed} 
        onClick={() => toggleComplete(todo, nickName)} 
      />

      {editingId === todo.id ? (
        <TodoEditForm
          editText={editText}
          setEditText={setEditText}
          onSave={() => saveEdit(todo)}
        />
      ) : (
        <TodoContent todo={todo} />
      )}

      <TodoActions
        onEdit={() => startEditing(todo)}
        onDelete={() => handleDeleteClick(todo)}
        onArchive={() => handleArchiveClick(todo)}
        editingId={editingId}
        todoId={todo.id}
        showArchive={activeTab !== "archive"}
      />
    </div>
  );
};

export default TodoItem;