import React, { useState, useRef, useEffect } from "react";
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
  units
}) => {
  // Suggestions state and refs
  const [suggestionList, setSuggestionList] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionsContainerRef = useRef(null);
  
  // Active input tracking - only show suggestions when main text input is active
  const [activeInputId, setActiveInputId] = useState(null);
  const MAIN_INPUT_ID = "main-todo-input";
  
  // Update suggestions when value changes or todos change
  useEffect(() => {
    if (activeInputId !== MAIN_INPUT_ID || !value.trim()) {
      setSuggestionList([]);
      return;
    }

    const matchingTodos = todos.filter(todo => 
      todo.text.toLowerCase().includes(value.toLowerCase())
    );
    
    setSuggestionList(matchingTodos);
  }, [value, todos, activeInputId]);

  // Control suggestions visibility
  useEffect(() => {
    setIsSuggestionsOpen(
      activeInputId === MAIN_INPUT_ID && 
      suggestionList.length > 0 && 
      value.trim() !== ""
    );
  }, [suggestionList, activeInputId, value]);
  
  // Global click handler to close suggestions when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // If clicking inside suggestions container, do nothing
      if (suggestionsContainerRef.current && 
          suggestionsContainerRef.current.contains(e.target)) {
        return;
      }
      
      // If clicking main input, handled by onFocus
      if (inputRef.current && inputRef.current.contains(e.target)) {
        return;
      }
      
      // Otherwise, close suggestions
      setIsSuggestionsOpen(false);
    };
    
    document.addEventListener('mousedown', handleGlobalClick);
    
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  // Handle selection from suggestions
  const selectSuggestion = (text) => {
    onChange({ target: { value: text } });
    setIsSuggestionsOpen(false);
    // Return focus to the main input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle Enter key in main input
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onSubmit(e);
      setIsSuggestionsOpen(false);
    }
  };

  // Form validation
  const isFormValid = () => {
    return (
      value.trim() !== "" &&
      newTodoCategory !== "" &&
      amount !== "" &&
      unit !== ""
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full p-4 bg-white shadow-lg rounded-2xl">
      <div className="relative">
        <Input
          id={MAIN_INPUT_ID}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setActiveInputId(MAIN_INPUT_ID)}
          ref={inputRef}
          placeholder={placeholder}
          className="flex-grow border-2 border-gray-300 focus:border-blue-500 rounded-xl p-3"
        />

        {isSuggestionsOpen && (
          <div
            ref={suggestionsContainerRef}
            className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-2 z-10 max-h-40 overflow-y-auto"
          >
            {suggestionList.length > 0 ? (
              suggestionList.map((todo) => (
                <div
                  key={todo.id}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                  onClick={() => selectSuggestion(todo.text)}
                >
                  {todo.text}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">Sonuç bulunamadı</div>
            )}
          </div>
        )}
      </div>

      <CategorySelect
        onValueChange={setNewTodoCategory}
        categories={categories}
        value={newTodoCategory}
        onFocus={() => setActiveInputId('category')}
      />

      <div className="flex gap-2">
        <Input
          type="number"
          value={amount}
          onChange={onChangeAmount}
          onFocus={() => setActiveInputId('amount')}
          placeholder="Miktar"
          className="w-1/2 border-2 border-gray-300 rounded-xl p-3"
        />
        <select
          value={unit}
          onChange={(e) => onChangeUnit && onChangeUnit(e.target.value)}
          onFocus={() => setActiveInputId('unit')}
          className="w-1/2 border-2 border-gray-300 rounded-xl p-3 bg-white text-gray-700"
        >
          <option value="">Birim Seç</option>
          {units.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
            onFocus={() => setActiveInputId('dueDate')}
            className="p-3 border-2 border-gray-300 rounded-xl"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={!isFormValid()}
        onClick={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onSubmit(e);
            setIsSuggestionsOpen(false);
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