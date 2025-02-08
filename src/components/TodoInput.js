import React, { useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import CategorySelect from "./ui/CatagorySelect";

const TodoInput = ({
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
}) => {
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

  return (
    <div className="flex flex-col gap-2 w-full">
      <Input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        placeholder={placeholder}
        className="flex-grow"
      />
      <div className="m-2">
        <CategorySelect onValueChange={setNewTodoCategory} />
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={amount}
          onChange={onChangeAmount}
          placeholder="Miktar"
          className="w-1/2"
        />
        <Input
          type="text"
          value={unit}
          onChange={onChangeUnit}
          placeholder="Birim"
          className="w-1/2"
        />
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
