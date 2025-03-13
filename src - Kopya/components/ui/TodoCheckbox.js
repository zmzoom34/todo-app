import React from "react";
import { CheckSquare, Square } from "lucide-react";

const TodoCheckbox = ({ completed, onClick, isArchived }) => (
  <button
    onClick={!isArchived ? onClick : undefined}
    disabled={completed && isArchived}
    className={`flex-shrink-0 mr-2 mt-1 sm:mt-0 ${
      completed && isArchived ? "cursor-not-allowed opacity-50" : ""
    }`}
  >
    {completed ? (
      <CheckSquare className="w-6 h-6 text-green-600" />
    ) : (
      <Square className="w-6 h-6 text-gray-400" />
    )}
  </button>
);

export default TodoCheckbox;
