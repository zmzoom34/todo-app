import React from "react";
import { Edit, Archive, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

const TodoActions = ({ onEdit, onDelete, onArchive, editingId, todoId, showArchive }) => (
  <div className="flex gap-2 flex-shrink-0 mt-1 sm:mt-0 w-full sm:w-auto justify-end">
    <Button
      variant="ghost"
      size="icon"
      onClick={onEdit}
      disabled={editingId === todoId}
    >
      <Edit className="w-4 h-4" />
    </Button>

    <Button
      variant="ghost"
      size="icon"
      onClick={onDelete}
      className="text-red-600 hover:text-red-700"
    >
      <Trash2 className="w-4 h-4" />
    </Button>

    {showArchive && (
      <Button
        variant="ghost"
        size="icon"
        onClick={onArchive}
        className="text-purple-800 hover:text-purple-700"
      >
        <Archive className="w-4 h-4" />
      </Button>
    )}
  </div>
);

export default TodoActions