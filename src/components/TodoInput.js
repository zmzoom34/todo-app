import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import CategorySelect from "./ui/CatagorySelect";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";

const TodoInput = ({
  todos,
  value,
  amount,
  unit,
  onChange,
  onChangeAmount,
  onChangeUnit,
  onSubmit,
  inputRef,
  placeholder = "Yeni görev ekle...",
  setNewTodoCategory,
  newTodoCategory,
  categories,
  newTodoDueDate,
  setNewTodoDueDate,
  todoType,
}) => {
  const [unitOptions, setUnitOptions] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "units"));
        const units = querySnapshot.docs.map((doc) => doc.data().name);
        setUnitOptions(units);
      } catch (error) {
        console.error("Birimler alınırken hata oluştu:", error);
      }
    };

    fetchUnits();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(e);
      }
    }
  };

useEffect(() => {
  if (value.trim() === "") {
    setFilteredTodos([]);
    setShowSuggestions(false);
    return;
  }

  const filtered = todos.filter((todo) =>
    todo.text.toLowerCase().includes(value.toLowerCase())
  );

  // 🔥 Eğer yeni filtrelenen liste öncekinden farklıysa state'i güncelle
  setFilteredTodos((prev) => {
    if (JSON.stringify(prev) !== JSON.stringify(filtered)) {
      return filtered;
    }
    return prev;
  });

  setShowSuggestions(filtered.length > 0);
}, [value, todos]); // ✅ filteredTodos bağımlılık dizisinden çıkarıldı


  return (
    <div className="flex flex-col gap-3 w-full p-4 bg-white shadow-lg rounded-2xl">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          placeholder={placeholder}
          className="flex-grow border-2 border-gray-300 focus:border-blue-500 rounded-xl p-3"
        />

        {showSuggestions && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-2 z-10 max-h-40 overflow-y-auto">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                onClick={() => {
                  onChange({ target: { value: todo.text } });
                  setShowSuggestions(false);
                }}
              >
                {todo.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <CategorySelect
        onValueChange={setNewTodoCategory}
        categories={categories}
        value={newTodoCategory}
      />

      <div className="flex gap-2">
        <Input
          type="number"
          value={amount}
          onChange={onChangeAmount}
          placeholder="Miktar"
          className="w-1/2 border-2 border-gray-300 rounded-xl p-3"
        />
        <select
          value={unit}
          onChange={(e) => onChangeUnit && onChangeUnit(e.target.value)}
          className="w-1/2 border-2 border-gray-300 rounded-xl p-3 bg-white text-gray-700"
        >
          <option value="">Birim Seç</option>
          {unitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {todoType === "personal" && (
        <div className="flex items-center gap-2 w-full">
          <label className="text-sm text-gray-700">Hedef Tarih:</label>
          <input
            type="date"
            value={newTodoDueDate}
            onChange={(e) => setNewTodoDueDate(e.target.value)}
            className="p-3 border-2 border-gray-300 rounded-xl"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={!value.trim()}
        onClick={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onSubmit(e);
          }
        }}
        className="bg-blue-500 text-white hover:bg-blue-600 transition-all rounded-xl p-3 flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Ekle
      </Button>
    </div>
  );
};

export default TodoInput;
