import React, { useState, useEffect } from "react";
import {
  LogOut,
  Settings,
  Users,
  User,
  UserRoundPen,
  Archive,
  Menu,
  Ruler,
  Bell,
  Plus,
  CirclePlus,
  Store,
  List,
  Edit,
  Trash,
  Save,
  CircleX,
} from "lucide-react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import Checkbox from "./Checkbox";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

// useConfirm Hook'u
const useConfirm = (title, message) => {
  const [promise, setPromise] = useState(null);

  const confirm = () =>
    new Promise((resolve) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleConfirm}>Yes</Button>
      </DialogActions>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};

// Add this new function to delete a todo
const deleteTodoFromList = async (db, user, listId, todoId) => {
  try {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const todoRef = doc(
      db,
      "users",
      user.uid,
      "lists",
      listId,
      "todos",
      todoId
    );
    await deleteDoc(todoRef);
    console.log("Todo deleted successfully");
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
};

// Modified SortableTodoItem component with editing capability
function SortableTodoItem({ todo, toggleTodoCompletion, onDelete, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    toggleTodoCompletion(todo.id, todo.completed);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editedText.trim()) {
      onEdit(todo.id, editedText);
      setIsEditing(false);
    }
  };

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
        <form onSubmit={handleEditSubmit} className="flex-grow flex items-center space-x-2">
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="flex-grow px-2 py-1 border rounded"
            autoFocus
          />
          <button
            type="submit"
            className="text-green-500 hover:text-green-700"
          >
            <Save/>
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <CircleX/>
          </button>
        </form>
      ) : (
        <>
          <Checkbox
            type="checkbox"
            checked={todo.completed}
            onChange={handleCheckboxChange}
            className="form-checkbox"
            disabled={isDragging}
          />
          <span
            className={`flex-grow ${
              todo.completed ? "line-through text-gray-500" : ""
            }`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-blue-500 hover:text-blue-700 flex-shrink-0"
            disabled={isDragging}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
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

function ExpandableListItem({ list, onEdit, onDelete, user, db }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");

  // Confirmation dialogs for both list and todo deletion
  const [ListConfirmationDialog, confirmDeleteList] = useConfirm(
    "Are you sure?",
    `Are you sure you want to delete the list "${list.listName}"?`
  );
  
  const [TodoConfirmationDialog, confirmDeleteTodo] = useConfirm(
    "Delete Todo?",
    "Are you sure you want to delete this todo?"
  );

  // New function to update todo
  const handleEditTodo = async (todoId, newText) => {
    try {
      const todoRef = doc(
        db,
        "users",
        user.uid,
        "lists",
        list.id,
        "todos",
        todoId
      );
      await updateDoc(todoRef, {
        text: newText,
        updatedAt: new Date().toISOString(),
      });
      console.log("Todo text updated successfully");
    } catch (error) {
      console.error("Error updating todo text:", error);
    }
  };

  const addTodoToList = async (listId, todoText) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const listTodosRef = collection(
        db,
        "users",
        user.uid,
        "lists",
        listId,
        "todos"
      );
      const todosSnapshot = await getDocs(listTodosRef);
      const newSortOrder = todosSnapshot.size;

      const todoData = {
        text: todoText,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sortOrder: newSortOrder,
      };

      const docRef = await addDoc(listTodosRef, todoData);
      console.log("Todo added to list successfully");
      return docRef.id;
    } catch (error) {
      console.error("Error adding todo to list:", error);
    }
  };

  const useListTodos = (listId) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user || !listId) {
        setLoading(false);
        return;
      }

      const listTodosRef = collection(
        db,
        "users",
        user.uid,
        "lists",
        listId,
        "todos"
      );
      const unsubscribe = onSnapshot(
        query(listTodosRef, orderBy("sortOrder", "asc")),
        (snapshot) => {
          const todosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodos(todosData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching list todos:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }, [user, listId]);

    return { todos, loading };
  };

  const { todos, loading } = useListTodos(list.id);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      await addTodoToList(list.id, newTodoText);
      setNewTodoText("");
    }
  };

  const toggleTodoCompletion = async (todoId, currentStatus) => {
    try {
      const todoRef = doc(db, "users", user.uid, "lists", list.id, "todos", todoId);
      await updateDoc(todoRef, {
        completed: !currentStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    const confirmed = await confirmDeleteTodo();
    if (confirmed) {
      await deleteTodoFromList(db, user, list.id, todoId);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over.id);

      const newTodos = Array.from(todos);
      const [reorderedItem] = newTodos.splice(oldIndex, 1);
      newTodos.splice(newIndex, 0, reorderedItem);

      try {
        for (let i = 0; i < newTodos.length; i++) {
          const todoRef = doc(db, "users", user.uid, "lists", list.id, "todos", newTodos[i].id);
          await updateDoc(todoRef, { sortOrder: i });
        }
      } catch (error) {
        console.error("Error updating sort order:", error);
      }
    }
  };

  const handleDeleteList = async (listId) => {
    const ans = await confirmDeleteList();
    if (ans) {
      try {
        if (!user) {
          console.error("User not authenticated");
          return;
        }
        const listDocRef = doc(db, "users", user.uid, "lists", listId);
        await deleteDoc(listDocRef);
        console.log("List deleted successfully");
        onDelete(listId);
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    }
  };

  return (
    <>
      <ListConfirmationDialog />
      <TodoConfirmationDialog />
      <div className="border rounded-md mb-2 bg-stone-100">
        <div
          className="flex justify-between items-center p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <span>{list.listName}</span>
            {todos.length > 0 && (
              <span className="text-sm text-gray-500">
                ({todos.filter((todo) => !todo.completed).length}/{todos.length})
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(list);
              }}
              className="text-blue-500 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteList(list.id);
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 border-t">
            <form onSubmit={handleAddTodo} className="flex mb-3">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a todo"
                className="flex-grow px-2 py-1 border rounded-l-md"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded-r-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {loading ? (
              <div>Loading todos...</div>
            ) : todos.length > 0 ? (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={todos.map((todo) => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {todos.map((todo) => (
                      <SortableTodoItem
                        key={todo.id}
                        todo={todo}
                        toggleTodoCompletion={toggleTodoCompletion}
                        onDelete={handleDeleteTodo}
                        onEdit={handleEditTodo}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-gray-500 text-center">No todos in this list</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ExpandableListItem;