import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import TodoInputDirectArchive from "../TodoInputDirectArchive";

const AddTodoDirectArchiveModal = ({
  todos,
  isOpen,
  onClose,
  addTodoDirectArchive,
  newTodo,
  newTodoPrice,
  setNewTodo,
  newTodoAmount,
  setNewTodoAmount,
  setNewTodoPrice,
  newTodoUnit,
  setNewTodoUnit,
  newTodoCategory,
  setNewTodoCategory,
  inputRef,
  categories,
  newTodoDueDate,
  setNewTodoDueDate,
  newTodoBrand,
  setNewTodoBrand,
  newTodoStore,
  setNewTodoStore,
  todoType,
  stores,
  units
}) => {
  if (!isOpen) return null;
  const uniqueTodos = todos.filter(
    (todo, index, self) => index === self.findIndex((t) => t.text === todo.text)
  );

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
          <h3 className="text-lg font-semibold">Arşive Ekle</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* TodoInput Formu */}
        <form
          onSubmit={(e) => {
            addTodoDirectArchive(e);
            onClose(); // Modalı kapat
            setNewTodoAmount("");
            setNewTodoUnit("");
            setNewTodoCategory(""); // Seçili kategori sıfırlansın
          }}
        >
          <TodoInputDirectArchive
            todos={uniqueTodos}
            value={newTodo}
            amount={newTodoAmount}
            price={newTodoPrice}
            newTodoPrice={newTodoPrice}
            setNewTodoPrice={setNewTodoPrice}
            unit={newTodoUnit}
            onChange={(e) => setNewTodo(e.target.value)}
            onChangeAmount={(e) => setNewTodoAmount(e.target.value)}
            onChangeUnit={setNewTodoUnit}
            onSubmit={(e) => {
              addTodoDirectArchive(e);
              onClose();
              setNewTodoAmount("");
              setNewTodoUnit("");
              setNewTodoCategory("");
            }}
            inputRef={inputRef}
            placeholder="Arşive ekle..."
            newTodoCategory={newTodoCategory}
            setNewTodoCategory={setNewTodoCategory}
            categories={categories}
            newTodoDueDate={newTodoDueDate} // Yeni prop
            setNewTodoDueDate={setNewTodoDueDate} // Yeni prop
            newTodoBrand={newTodoBrand} // Yeni prop
            setNewTodoBrand={setNewTodoBrand} // Yeni prop
            newTodoStore={newTodoStore} // Yeni prop
            setNewTodoStore={setNewTodoStore} // Yeni prop
            todoType={todoType}
            stores={stores}
            units={units}
          />
        </form>
      </div>
    </div>
  );
};

export default AddTodoDirectArchiveModal;
