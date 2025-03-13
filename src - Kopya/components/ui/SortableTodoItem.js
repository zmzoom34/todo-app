import React, { useState } from "react";
import { Edit, Trash, Save, CircleX } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Checkbox from "./Checkbox";

function SortableTodoItem({ todo, toggleTodoCompletion, updateTodoItems, onDelete, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  console.log(todo);

  const [isEditing, setIsEditing] = useState(false);
  // For advanced todos, we'll store the edited parameters in an object
  const [editedData, setEditedData] = useState(
    todo.parameters
      ? Object.fromEntries(
          todo.parameters.map((param) => [param.id, param.value])
        )
      : { text: todo.text }
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (todo.parameters) {
      // For advanced todos, convert editedData back to parameters array
      const updatedParameters = todo.parameters.map((param) => ({
        ...param,
        value: editedData[param.id] || param.value,
      }));
      console.log(updatedParameters);
      onEdit(todo.id, updatedParameters);
    } else if (editedData.text.trim()) {
      onEdit(todo.id, editedData.text);
    }
    setIsEditing(false);
  };

  const handleInputChange = (fieldId, value) => {
    console.log(value)
    setEditedData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    console.log(editedData)
  };

  const handleParameterChange = (index, value) => {
    todo.parameters[index].value = value;
    updateTodoItems(todo.id, todo.parameters)
  }

  // Determine if this is an advanced todo
  const isAdvanced = !!todo.parameters;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center space-x-2 touch-none bg-gray-200 p-3 rounded-lg"
    >
      <div
        {...listeners}
        className="drag-handle flex-shrink-0 w-6 h-6 cursor-move"
      >
        <span className="text-lg">::</span>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleEditSubmit}
          className="flex-grow flex flex-col space-y-2"
        >
          {isAdvanced ? (
            todo.parameters.map((param) => (
              <div key={param.id} className="flex flex-col">
                <label className="text-sm font-medium">
                  {param.label}
                  {param.required && <span className="text-red-500">*</span>}
                </label>
                {param.type === "checkbox" ? (
                  <Checkbox
                    type="checkbox"
                    checked={editedData[param.id]}
                    onChange={(e) =>
                      handleInputChange(param.id, e.target.checked)
                    }
                  />
                ) : (
                  <input
                    type="text"
                    value={editedData[param.id]}
                    onChange={(e) =>
                      handleInputChange(param.id, e.target.value)
                    }
                    className="px-2 py-1 border rounded"
                  />
                )}
              </div>
            ))
          ) : (
            <input
              type="text"
              value={editedData.text}
              onChange={(e) => handleInputChange("text", e.target.value)}
              className="flex-grow px-2 py-1 border rounded"
              autoFocus
            />
          )}
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="text-green-500 hover:text-green-700"
            >
              <Save />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <CircleX />
            </button>
          </div>
        </form>
      ) : (
        <>
          <Checkbox
            type="checkbox"
            
            checked={todo.completed}
            onChange={() => toggleTodoCompletion(todo.id, todo.completed)}
            className="form-checkbox"
            disabled={true}
          />
          <div
            className={`flex-grow ${
              todo.completed ? "line-through text-gray-500" : ""
            }`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {!isAdvanced ? (
              todo.text
            ) : (
              <div className="space-y-1">
                {todo.parameters.map((param, index) => (
                  <div key={param.id}>
                    {param.type === "checkbox" ? (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editedData[param.id]}
                          onChange={(e) =>
                            handleParameterChange(index, e.target.checked)

                          }
                        />
                        <span className="font-medium">{param.label}</span>
                      </label>
                    ) : (
                      <div>
                        <span className="font-medium">{param.label}: </span>
                        <span>{param.value || "-"}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-700 flex-shrink-0"
            disabled={isDragging}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-red-500 hover:text-red-700 flex-shrink-0"
            disabled={isDragging}
          >
            <Trash className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

export default SortableTodoItem;
