import React, { useState, useEffect, useMemo } from "react";
import { Edit, Trash, Plus, Save, CircleX, Upload, FileSpreadsheet } from "lucide-react";
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
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import Checkbox from "./Checkbox";
import BulkTodoModal from "./BulkTodoModal";
import TodosReportGenerator from "./TodosReportGenerator";

// Custom hook for confirmation dialogs
const useConfirm = (title, message) => {
  const [promise, setPromise] = useState(null);

  const confirm = () =>
    new Promise((resolve) => {
      setPromise({ resolve });
    });

  const handleClose = () => setPromise(null);
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

// Sortable Todo Item Component
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
        <form
          onSubmit={handleEditSubmit}
          className="flex-grow flex items-center space-x-2"
        >
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="flex-grow px-2 py-1 border rounded"
            autoFocus
          />
          <button type="submit" className="text-green-500 hover:text-green-700">
            <Save />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <CircleX />
          </button>
        </form>
      ) : (
        <>
          <Checkbox
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodoCompletion(todo.id, todo.completed)}
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

function EditListModal({ isOpen, onClose, list, onSave }) {
  const [listName, setListName] = useState(list?.listName || "");

  useEffect(() => {
    setListName(list?.listName || "");
  }, [list]);

  const handleSave = () => {
    if (listName.trim()) {
      onSave({
        ...list,
        listName: listName.trim(),
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-end">
          <div onClick={onClose}>
            <CircleX
              size={32}
              color="#ff0000"
              strokeWidth={2.5}
              className="cursor-pointer"
            />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Edit List</h2>
        </div>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="Enter list name"
          className="w-full px-3 py-2 border rounded-md mb-4"
        />
        <div className="flex justify-end space-x-2">
          <div onClick={handleSave} disabled={!listName.trim()}>
            <Save
              size={48}
              color="#0000ff"
              strokeWidth={2.5}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListsWithReports({
    lists, 
    user, 
    db, 
    type = "user", 
    groupId = null
  }) {
    const [expandedListId, setExpandedListId] = useState(null);
  
    return (
      <div>
        <div className="flex justify-end mb-4">
          <TodosReportGenerator
            user={user}
            db={db}
            lists={lists}
            type={type}
            groupId={groupId}
          />
        </div>
        {lists.map(list => (
          <ExpandableListAll
            key={list.id}
            list={list}
            user={user}
            db={db}
            type={type}
            groupId={groupId}
          />
        ))}
      </div>
    );
  }

  function ExpandableListAll({
    list,
    onEdit,
    onDelete,
    user,
    db,
    type = "user",
    groupId = null,
  }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newTodoText, setNewTodoText] = useState("");
    const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
    const [isBulkTodoModalOpen, setIsBulkTodoModalOpen] = useState(false);
    const [currentEditList, setCurrentEditList] = useState(null);

  // Confirmation dialogs
  const [ListConfirmationDialog, confirmDeleteList] = useConfirm(
    "Are you sure?",
    `Are you sure you want to delete the list "${list.listName}"?`
  );

  const [TodoConfirmationDialog, confirmDeleteTodo] = useConfirm(
    "Delete Todo?",
    "Are you sure you want to delete this todo?"
  );

  // Memoized collection path
  const collectionPath = useMemo(() => {
    return type === "group"
      ? `groups/${groupId}/lists/${list.id}/todos`
      : `users/${user.uid}/lists/${list.id}/todos`;
  }, [type, groupId, user, list.id]);

  // Fetch todos hook
  const useListTodos = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user || !list.id) {
        setLoading(false);
        return;
      }

      const listTodosRef = collection(db, collectionPath);
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
    }, [user, list.id, collectionPath]);

    return { todos, loading };
  };

  const { todos, loading } = useListTodos();

  // Add todo to list
  const addTodoToList = async (todoText) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const listTodosRef = collection(db, collectionPath);
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
      console.log("Todo added successfully");
      return docRef.id;
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Edit todo
  const handleEditTodo = async (todoId, newText) => {
    try {
      const todoRef = doc(db, collectionPath, todoId);
      await updateDoc(todoRef, {
        text: newText,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Edit list handler
  const handleEditList = async (updatedList) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const listCollectionPath =
        type === "group"
          ? `groups/${groupId}/lists`
          : `users/${user.uid}/lists`;

      // Reference to the specific list document
      const listDocRef = doc(db, listCollectionPath, updatedList.id);

      // Update the document
      await updateDoc(listDocRef, {
        listName: updatedList.listName,
        timestamp: new Date().toISOString(),
      });

      console.log("List updated successfully");
      setIsEditListModalOpen(false);
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  // Toggle todo completion
  const toggleTodoCompletion = async (todoId, currentStatus) => {
    try {
      const todoRef = doc(db, collectionPath, todoId);
      await updateDoc(todoRef, {
        completed: !currentStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

  // Edit list button click handler
  const openEditListModal = () => {
    setCurrentEditList(list);
    setIsEditListModalOpen(true);
  };

  // Delete todo
  const handleDeleteTodo = async (todoId) => {
    const confirmed = await confirmDeleteTodo();
    if (confirmed) {
      try {
        const todoRef = doc(db, collectionPath, todoId);
        await deleteDoc(todoRef);
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    }
  };

  // Drag and drop handler
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
          const todoRef = doc(db, collectionPath, newTodos[i].id);
          await updateDoc(todoRef, { sortOrder: i });
        }
      } catch (error) {
        console.error("Error updating sort order:", error);
      }
    }
  };

  // Delete list
  const handleDeleteList = async () => {
    const confirmed = await confirmDeleteList();
    if (confirmed) {
      try {
        const listDocRef = doc(
          db,
          type === "group"
            ? `groups/${groupId}/lists`
            : `users/${user.uid}/lists`,
          list.id
        );
        await deleteDoc(listDocRef);
        onDelete(list.id);
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    }
  };

  // Add todo handler
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      await addTodoToList(newTodoText);
      setNewTodoText("");
    }
  };

  // Bulk todo ekleme fonksiyonu
  const bulkAddTodos = async (todos) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const listTodosRef = collection(db, collectionPath);
      const todosSnapshot = await getDocs(listTodosRef);
      let newSortOrder = todosSnapshot.size;

      // Her todo için bir batch işlemi yapılabilir, ancak şimdilik seri olarak ekleyeceğiz
      for (const todoText of todos) {
        const todoData = {
          text: todoText,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sortOrder: newSortOrder++,
        };

        await addDoc(listTodosRef, todoData);
      }

      console.log(`${todos.length} todos added successfully`);
    } catch (error) {
      console.error("Error bulk adding todos:", error);
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
                ({todos.filter((todo) => todo.completed).length}/{todos.length}
                )
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditListModal();
              }}
              className="text-blue-500 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteList();
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 border-t">
            <div className="flex mb-3">
              <form onSubmit={handleAddTodo} className="flex flex-grow">
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
                <button
                onClick={() => setIsBulkTodoModalOpen(true)}
                className="ml-2 bg-green-500 text-white px-3 py-1 rounded-md flex items-center"
                title="Bulk Add Todos"
              >
                <Upload className="w-4 h-4" />
              </button>
              </form>
            </div>

            {loading ? (
              <div>Loading todos...</div>
            ) : todos.length > 0 ? (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
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
              <div className="text-gray-500 text-center">
                No todos in this list
              </div>
            )}
          </div>
        )}
      </div>
      {/* Edit List Modal */}
      <EditListModal
        isOpen={isEditListModalOpen}
        onClose={() => {
          setIsEditListModalOpen(false);
          setCurrentEditList(null);
        }}
        list={currentEditList}
        onSave={handleEditList}
      />

      {/* Bulk Todo Modal */}
      <BulkTodoModal
        isOpen={isBulkTodoModalOpen}
        onClose={() => setIsBulkTodoModalOpen(false)}
        onBulkAdd={bulkAddTodos}
      />
    </>
  );
}

export default ExpandableListAll;
