import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const TodoInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  inputRef, 
  placeholder = "Yeni görev ekle..." 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter için yeni satır
        e.preventDefault();
        const cursorPosition = e.target.selectionStart;
        const newValue = value.slice(0, cursorPosition) + '\n' + value.slice(cursorPosition);
        onChange({ target: { value: newValue } });
      } else {
        // Sadece Enter tuşu için submit
        e.preventDefault();
        if (value.trim()) {
          onSubmit(e);
        }
      }
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        placeholder={placeholder}
        className="flex-grow"
      />
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