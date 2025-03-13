import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import TodoInput from "../TodoInput";

const AddTodoModal = ({
  todos,
  isOpen,
  onClose,
  addTodo,
  newTodo,
  setNewTodo,
  newTodoAmount,
  setNewTodoAmount,
  newTodoUnit,
  setNewTodoUnit,
  newTodoCategory,
  setNewTodoCategory,
  inputRef,
  categories,
  stores,
  newTodoDueDate,
  setNewTodoDueDate,
  todoType,
  units
}) => {
  if (!isOpen) return null;
  const uniqueTodos = todos.filter(
    (todo, index, self) => index === self.findIndex((t) => t.text === todo.text)
  );

  console.log(categories);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlık ve Kapatma Butonu */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Yeni Görev Ekle</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* TodoInput Formu */}
        <form
          onSubmit={(e) => {
            addTodo(e);
            onClose(); // Modalı kapat
            setNewTodoAmount("");
            setNewTodoUnit("");
            setNewTodoCategory(""); // Seçili kategori sıfırlansın
          }}
        >
          <TodoInput
            todos={uniqueTodos}
            value={newTodo}
            amount={newTodoAmount}
            unit={newTodoUnit}
            onChange={(e) => setNewTodo(e.target.value)}
            onChangeAmount={(e) => setNewTodoAmount(e.target.value)}
            onChangeUnit={setNewTodoUnit}
            onSubmit={(e) => {
              addTodo(e);
              onClose();
              setNewTodoAmount("");
              setNewTodoUnit("");
              setNewTodoCategory("");
            }}
            inputRef={inputRef}
            placeholder="Yeni görev ekle..."
            newTodoCategory={newTodoCategory}
            setNewTodoCategory={setNewTodoCategory}
            categories={categories}
            newTodoDueDate={newTodoDueDate} // Yeni prop
            setNewTodoDueDate={setNewTodoDueDate} // Yeni prop
            todoType={todoType}
            units={units}
          />
        </form>
      </div>
    </div>
  );
};

export default AddTodoModal;
