import React from "react";
import TodoItem from "./TodoItem";

const TodoList = ({
  todos,
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
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          editingId={editingId}
          editText={editText}
          setEditText={setEditText}
          saveEdit={saveEdit}
          toggleComplete={toggleComplete}
          startEditing={startEditing}
          handleDeleteClick={handleDeleteClick}
          handleArchiveClick={handleArchiveClick}
          activeTab={activeTab}
        />
      ))}
    </div>
  );
};

export default TodoList;