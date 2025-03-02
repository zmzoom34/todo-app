import React, { useEffect, useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import CategorySelect from "./ui/CatagorySelect";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";

const TodoInputDirectArchive = ({
  todos,
  value,
  amount,
  unit,
  onChange,
  onChangeAmount,
  onChangeUnit,
  onSubmit,
  inputRef,
  placeholder = "Arşive ekle...",
  setNewTodoCategory,
  newTodoCategory,
  newTodoPrice,
  setNewTodoPrice,
  categories,
  newTodoDueDate,
  setNewTodoDueDate,
  todoType,
}) => {
  const [unitOptions, setUnitOptions] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSuggestions &&
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions, inputRef]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isFormValid()) {
        onSubmit(e);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionSelect = (e, selectedText) => {
    e.stopPropagation();
    onChange({ target: { value: selectedText } });
    setShowSuggestions(false);
    
    const outsideClickEvent = new Event('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(outsideClickEvent);
    
    if (inputRef.current) {
      inputRef.current.focus();
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

    setFilteredTodos((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(filtered)) {
        return filtered;
      }
      return prev;
    });

    setShowSuggestions(filtered.length > 0);
  }, [value, todos]);

  // Form validation function
  const isFormValid = () => {
    // Required fields: value, newTodoCategory, amount, unit
    // newTodoPrice and newTodoDueDate can be optional depending on your needs
    return (
      value.trim() !== "" &&
      newTodoCategory !== "" &&
      amount !== "" &&
      unit !== "" &&
      newTodoPrice !== ""
    );
  };

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
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-2 z-10 max-h-40 overflow-y-auto"
          >
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                onClick={(e) => handleSuggestionSelect(e, todo.text)}
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
          className="border-2 border-gray-300 rounded-xl p-3"
        />
        <select
          value={unit}
          onChange={(e) => onChangeUnit && onChangeUnit(e.target.value)}
          className="border-2 border-gray-300 rounded-xl p-3 bg-white text-gray-700"
        >
          <option value="">Birim Seç</option>
          {unitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Input
          type="number"
          value={newTodoPrice}
          onChange={(e) => {
            setNewTodoPrice(e.target.value);
          }}
          placeholder="Fiyat (TL)"
        />
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
        disabled={!isFormValid()}
        onClick={(e) => {
          e.preventDefault();
          if (isFormValid()) {
            onSubmit(e);
            setShowSuggestions(false);
          }
        }}
        className="bg-blue-500 text-white hover:bg-blue-600 transition-all rounded-xl p-3 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5 mr-2" />
        Ekle
      </Button>
    </div>
  );
};

export default TodoInputDirectArchive;