import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import CategorySelect from "./ui/CatagorySelect";
import { db } from "../firebase-config"; // Firestore bağlantısı
import { collection, getDocs } from "firebase/firestore";

const TodoInput = ({
  todos, // 🆕 Mevcut görevleri prop olarak al
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
  categories
}) => {
  const [unitOptions, setUnitOptions] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]); // 🆕 Filtrelenmiş görevler
  const [showSuggestions, setShowSuggestions] = useState(false); // 🆕 Öneri listesi gösterilsin mi?

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
      if (e.shiftKey) {
        e.preventDefault();
        const cursorPosition = e.target.selectionStart;
        const newValue =
          value.slice(0, cursorPosition) + "\n" + value.slice(cursorPosition);
        onChange({ target: { value: newValue } });
      } else {
        e.preventDefault();
        if (value.trim()) {
          onSubmit(e);
        }
      }
    }
  };

  useEffect(() => {
    if (value.trim() === "") {
      if (filteredTodos.length > 0) {
        setFilteredTodos([]);
        setShowSuggestions(false);
      }
      return;
    }
  
    const filtered = todos.filter((todo) =>
      todo.text.toLowerCase().includes(value.toLowerCase())
    );
  
    // 🔥 Eğer filtrelenmiş sonuçlar zaten güncelse state güncellenmesin (sonsuz döngü engellenir)
    if (JSON.stringify(filtered) !== JSON.stringify(filteredTodos)) {
      setFilteredTodos(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  }, [value, todos, filteredTodos]);
  

  return (
    <div className="flex flex-col gap-2 w-full relative">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          placeholder={placeholder}
          className="flex-grow"
        />

        {/* 🆕 Öneri Listesi */}
        {showSuggestions && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 z-10 max-h-40 overflow-y-auto">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange({ target: { value: todo.text } }); // 🆕 Seçilen todo'yu inputa yaz
                  setShowSuggestions(false);
                }}
              >
                {todo.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="m-2">
        <CategorySelect 
        onValueChange={setNewTodoCategory}
        categories={categories}
        value={newTodoCategory}
        />
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          value={amount}
          onChange={onChangeAmount}
          placeholder="Miktar"
          className="w-1/2"
        />
        <select
          value={unit}
          onChange={(e) => onChangeUnit && onChangeUnit(e.target.value)}
          className="w-1/2 border rounded-lg p-2 bg-white text-gray-700"
        >
          <option value="">Birim Seç</option>
          {unitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={!value.trim()}
        onClick={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onSubmit(e);
          }
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Ekle
      </Button>
    </div>
  );
};

export default TodoInput;
