import React from "react";
import { CheckSquare, Square } from "lucide-react";

const TodoCheckbox = ({ completed, onClick }) => (
  <button onClick={onClick} className="flex-shrink-0 mt-1 sm:mt-0">
    {completed ? (
      <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
    ) : (
      <Square className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
    )}
  </button>
);

export default TodoCheckbox