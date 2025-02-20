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
  nickName,
  setEditingId,
  setEditCategory,
  setEditAmount,
  setEditUnit,
  editAmount,
  categories
}) => {
  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todos={todos}
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
          nickName={nickName}
          setEditingId={setEditingId}
          setEditCategory={setEditCategory}
          setEditAmount={setEditAmount}
          setEditUnit={setEditUnit}
          editAmount={editAmount}
          categories={categories}
        />
      ))}
    </div>
  );
};

export default TodoList;