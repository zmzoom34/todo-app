import React from "react";
import TodoCheckbox from "./ui/TodoCheckbox";
import TodoContent from "./ui/TodoContent";
import TodoActions from "./ui/TodoActions";
import TodoEditModal from "./ui/TodoEditModal";

const TodoItem = ({
  todo,
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
  categories,
}) => {
  //const { categories, loading } = useFetchCategories()
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-1 rounded-lg border ${
        todo.completed ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <TodoCheckbox
          completed={todo.completed}
          onClick={() => toggleComplete(todo, nickName)}
          isArchived={todo.statue === "archive" ? true : false}
        />
        <TodoContent todo={todo} />
      </div>
      {todo.category && (
        <div className="text-sm text-gray-700">
          {categories.find((cat) => cat.value === todo.category)?.label ||
            "Kategori seçilmemiş"}
        </div>
      )}
      {todo.dueDate ? (
        <span className="text-xs text-gray-600">
          ⏳{" "}
          {new Date(todo.dueDate).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      ) : (
        ""
      )}
      <div className="ml-auto">
        <TodoActions
          onEdit={() => startEditing(todo)}
          onDelete={() => handleDeleteClick(todo)}
          onArchive={() => handleArchiveClick(todo)}
          editingId={editingId}
          todoId={todo.id}
          showArchive={activeTab !== "archive" && todo.type !== "personal"}
        />
      </div>
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
        categories={categories}
        todos={todos}
      />
    </div>
  );
};

export default TodoItem;
