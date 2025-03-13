import React, { useState, useEffect, useMemo } from "react";
import {
  Edit,
  Trash,
  Plus,
  Save,
  CircleX,
  Upload,
  FileSpreadsheet,
  ListTodo,
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
import Tooltip from "./Tooltip";
import SortableTodoItem from "./SortableTodoItem";
import EditListModal from "./EditListModal";

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

function TodoListModal({
  isOpen,
  onClose,
  list,
  user,
  db,
  type,
  groupId,
  listType,
}) {
  const [newTodoText, setNewTodoText] = useState("");
  const [advancedTodoData, setAdvancedTodoData] = useState({});
  const [isBulkTodoModalOpen, setIsBulkTodoModalOpen] = useState(false);
  const [TodoConfirmationDialog, confirmDeleteTodo] = useConfirm(
    "Delete Todo?",
    "Are you sure you want to delete this todo?"
  );

  const optionsMap = useMemo(() => {
    const map = {};
    if (!list || !Array.isArray(list.todoParameters)) {
      return map;
    }

    list.todoParameters.forEach((param) => {
      let options = [];
      if (Array.isArray(param.options)) {
        if (
          param.options.length === 1 &&
          typeof param.options[0] === "string"
        ) {
          options = param.options[0].split(";").map((opt) => opt.trim());
        } else {
          options = param.options;
        }
      } else if (
        typeof param.options === "string" &&
        param.options.trim() !== ""
      ) {
        options = param.options.split(";").map((opt) => opt.trim());
      }
      map[param.id] = options;
    });

    return map;
  }, [list?.todoParameters]);

  const getCollectionPath = (type, groupId, user, listId, listType) => {
    const basePath =
      type === "group" ? `groups/${groupId}` : `users/${user?.uid}`;
    return `${basePath}/${listType}/${listId}/todos`;
  };

  const collectionPath = useMemo(() => {
    return getCollectionPath(type, groupId, user, list?.id, listType);
  }, [type, groupId, user, list?.id, listType]);

  const useListTodos = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user || !list?.id) {
        console.error("Invalid user or list:", { user, list });
        setLoading(false);
        return;
      }

      const listTodosRef = collection(db, collectionPath);
      console.log("Fetching todos from:", collectionPath);

      const fetchTodos = async () => {
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

        return unsubscribe;
      };

      fetchTodos();
    }, [user, list?.id, collectionPath, type, groupId]);

    return { todos, loading };
  };

  const { todos, loading } = useListTodos();

  useEffect(() => {
    if (list?.isAdvanced && list?.todoParameters) {
      const initialData = {};
      list.todoParameters.forEach((param) => {
        if (param.type === "checkbox") {
          initialData[param.id] =
            param.value !== undefined ? param.value : false;
        } else {
          initialData[param.id] = param.value || "";
        }
      });
      setAdvancedTodoData(initialData);
    }
  }, [list]);

  const addTodoToList = async () => {
    console.log("Adding todo:", { newTodoText, advancedTodoData });
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const listTodosRef = collection(db, collectionPath);
      const todosSnapshot = await getDocs(listTodosRef);
      const newSortOrder = todosSnapshot.size;

      let todoData;
      if (list?.todoParameters) {
        const parametersArray = list.todoParameters.map((param) => ({
          id: param.id,
          label: param.label,
          type: param.type,
          value:
            advancedTodoData[param.id] !== undefined
              ? advancedTodoData[param.id]
              : param.type === "number"
              ? null
              : param.type === "checkbox"
              ? false
              : "",
          required: param.required || false,
        }));

        todoData = {
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sortOrder: newSortOrder,
          parameters: parametersArray,
        };
      } else {
        todoData = {
          text: newTodoText,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sortOrder: newSortOrder,
        };
      }

      const docRef = await addDoc(listTodosRef, todoData);
      console.log("Todo added successfully with ID:", docRef.id);

      if (list?.isAdvanced) {
        const initialData = {};
        list.todoParameters.forEach((param) => {
          initialData[param.id] = param.type === "checkbox" ? false : "";
        });
        setAdvancedTodoData(initialData);
      } else {
        setNewTodoText("");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleAddTodo = async (e) => {
    console.log("Adding todo:", { newTodoText, advancedTodoData });
    e.preventDefault();

    if (listType === "listsAdvanced") {
      const allRequiredFieldsFilled = list.todoParameters
        .filter((param) => param.required)
        .every((param) => {
          const value = advancedTodoData[param.id];
          return (
            value !== undefined &&
            value !== null &&
            (typeof value === "string" ? value.trim() !== "" : true)
          );
        });

      const hasAnyValue = Object.entries(advancedTodoData).some(
        ([key, value]) => {
          return (
            value !== undefined &&
            value !== null &&
            (typeof value === "string" ? value.trim() !== "" : true)
          );
        }
      );

      if (allRequiredFieldsFilled && hasAnyValue) {
        await addTodoToList();
      } else if (!allRequiredFieldsFilled) {
        alert("Please fill all required fields");
      }
    } else if (newTodoText.trim()) {
      await addTodoToList();
    }
  };

  const handleAdvancedInputChange = (fieldId, value) => {
    console.log("Updating field:", { fieldId, value });
    const parameter = list?.todoParameters?.find(
      (param) => param.id === fieldId
    );

    let processedValue = value;
    if (parameter?.type === "number") {
      processedValue =
        value === "" ? "" : isNaN(Number(value)) ? value : Number(value);
    } else if (parameter?.type === "checkbox") {
      processedValue = value;
    }

    setAdvancedTodoData((prev) => ({
      ...prev,
      [fieldId]: processedValue,
    }));
  };

  const handleEditTodo = async (todoId, newData) => {
    console.log("Gelen yeni veri:", newData);

    try {
      if (!todoId || !collectionPath) {
        throw new Error("Geçersiz todoId veya collectionPath");
      }

      const todoRef = doc(db, collectionPath, todoId);

      let updateData;

      if (list?.isAdvanced || listType === "listsAdvanced") {
        if (!Array.isArray(newData)) {
          throw new Error(
            "New data for advanced todo must be an array of parameters"
          );
        }

        updateData = {
          parameters: newData.map((param) => ({
            id: param.id,
            label: param.label,
            type: param.type,
            value: param.value,
            required: param.required ?? false,
          })),
          updatedAt: new Date().toISOString(),
        };
      } else {
        if (typeof newData !== "string") {
          throw new Error("New data for regular todo must be a string");
        }

        updateData = {
          text: newData.trim(),
          updatedAt: new Date().toISOString(),
        };
      }

      console.log("Firestore'a gönderilecek veri:", updateData);
      console.log("Firestore yolu:", todoRef.path);

      await updateDoc(todoRef, updateData);

      console.log("Todo başarıyla güncellendi:", todoId);
    } catch (error) {
      console.error("Todo güncelleme hatası:", error);
    }
  };

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

  const updateTodoItems = async (todoId, currentParameters) => {
    try {
      const todoRef = doc(db, collectionPath, todoId);
      await updateDoc(todoRef, {
        parameters: currentParameters,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

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

  const bulkAddTodos = async (todos) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const listTodosRef = collection(db, collectionPath);
      const todosSnapshot = await getDocs(listTodosRef);
      let newSortOrder = todosSnapshot.size;

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

  if (!isOpen || !list) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <TodoConfirmationDialog />
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {list.listName}{" "}
            {todos.length > 0 && (
              <span className="text-sm text-gray-500">
                ({todos.filter((todo) => todo.completed).length}/{todos.length})
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-4">
            {listType !== "listsAdvanced" && (
              <Tooltip text={"Toplu todo ekleme"} position={"left"}>
                <button
                  className="flex items-center bg-gray-200 p-2 rounded-lg shadow-md"
                  onClick={() => setIsBulkTodoModalOpen(true)}
                >
                  <Upload className="w-5 h-5 mr-1" />
                  <span>Toplu</span>
                </button>
              </Tooltip>
            )}
            <div onClick={onClose}>
              <CircleX
                size={32}
                color="#ff0000"
                strokeWidth={2.5}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <form onSubmit={handleAddTodo} className="space-y-4">
            {list?.todoParameters ? (
              <div className="space-y-4">
                {list.todoParameters.map((param) => (
                  <div key={param.id}>
                    <label
                      htmlFor={param.id}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {param.label}{" "}
                      {param.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {param.type === "select" ? (
                      <select
                        id={param.id}
                        value={advancedTodoData[param.id] || ""}
                        onChange={(e) =>
                          handleAdvancedInputChange(param.id, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">
                          Select {param.label.toLowerCase()}
                        </option>
                        {optionsMap[param.id].length > 0 ? (
                          optionsMap[param.id].map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))
                        ) : (
                          <option value="">No options available</option>
                        )}
                      </select>
                    ) : param.type === "textarea" ? (
                      <textarea
                        id={param.id}
                        value={advancedTodoData[param.id] || ""}
                        onChange={(e) =>
                          handleAdvancedInputChange(param.id, e.target.value)
                        }
                        placeholder={`Enter ${param.label.toLowerCase()}`}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : param.type === "date" ? (
                      <input
                        id={param.id}
                        type="date"
                        value={advancedTodoData[param.id] || ""}
                        onChange={(e) =>
                          handleAdvancedInputChange(param.id, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : param.type === "checkbox" ? (
                      <div className="flex items-center">
                        <input
                          id={param.id}
                          type="checkbox"
                          checked={advancedTodoData[param.id] || false}
                          onChange={(e) =>
                            handleAdvancedInputChange(
                              param.id,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={param.id}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {param.label}
                        </label>
                      </div>
                    ) : (
                      <input
                        id={param.id}
                        type={param.type || "text"}
                        value={advancedTodoData[param.id] || ""}
                        onChange={(e) =>
                          handleAdvancedInputChange(param.id, e.target.value)
                        }
                        placeholder={`Enter ${param.label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Enter new todo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {/* Add Todo Butonu */}
            <button
              type="submit"
              disabled={
                list?.todoParameters
                  ? !list.todoParameters
                      .filter((param) => param.required)
                      .every((param) => {
                        const value = advancedTodoData[param.id];
                        return (
                          value !== undefined &&
                          value !== null &&
                          (typeof value === "string"
                            ? value.trim() !== ""
                            : true)
                        );
                      })
                  : !newTodoText.trim() // list?.todoParameters yoksa, newTodoText'in boş olmadığını kontrol et
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1 w-full"
            >
              <Plus className="w-5 h-5" />
              <span>Add Todo</span>
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading todos...</p>
          </div>
        ) : todos.length > 0 ? (
          listType === "listsAdvanced" ? (
            // Non-draggable list for advanced todos
            <div className="space-y-3">
              {todos.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  toggleTodoCompletion={toggleTodoCompletion}
                  updateTodoItems={updateTodoItems}
                  onDelete={handleDeleteTodo}
                  onEdit={handleEditTodo}
                  isDraggable={false} // Pass a prop to disable dragging in SortableTodoItem if needed
                />
              ))}
            </div>
          ) : (
            // Draggable list for non-advanced todos
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todos.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {todos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      toggleTodoCompletion={toggleTodoCompletion}
                      onDelete={handleDeleteTodo}
                      onEdit={handleEditTodo}
                      isDraggable={true} // Optional: for clarity
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )
        ) : (
          <div className="text-gray-500 text-center py-8">
            <p className="text-xl">No todos in this list</p>
            <p className="mt-2">Add your first todo using the form above.</p>
          </div>
        )}
      </div>

      <BulkTodoModal
        isOpen={isBulkTodoModalOpen}
        onClose={() => setIsBulkTodoModalOpen(false)}
        onBulkAdd={bulkAddTodos}
      />
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
  listType,
}) {
  // Remove expandedListId state from here - we'll use a modal
  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [isTodoListModalOpen, setIsTodoListModalOpen] = useState(false);
  const [currentEditList, setCurrentEditList] = useState(null);

  // Confirmation dialogs
  const [ListConfirmationDialog, confirmDeleteList] = useConfirm(
    "Are you sure?",
    `Are you sure you want to delete the list "${list.listName}"?`
  );

  // Edit list button click handler
  const openEditListModal = () => {
    setCurrentEditList(list);
    setIsEditListModalOpen(true);
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

  // Delete list
  // const handleDeleteList = async () => {
  //   const confirmed = await confirmDeleteList();
  //   if (confirmed) {
  //     try {
  //       const listDocRef = doc(
  //         db,
  //         type === "group" ? `groups/${groupId}/` : `users/${user.uid}/`,
  //         listType,
  //         list.id
  //       );
  //       console.log(listDocRef);
  //       await deleteDoc(listDocRef);
  //       //onDelete(list.id);
  //     } catch (error) {
  //       console.error("Error deleting list:", error);
  //     }
  //   }
  // };

  const handleDeleteList = async () => {
    const confirmed = await confirmDeleteList();
    if (confirmed) {
      try {
        // Construct the reference to the list document
        const listDocRef = doc(
          db,
          type === "group" ? `groups/${groupId}/` : `users/${user.uid}/`,
          listType,
          list.id
        );
        console.log("List document reference:", listDocRef.path);

        // Reference to the 'todos' subcollection
        const todosRef = collection(db, `${listDocRef.path}/todos`);
        console.log("Todos subcollection reference:", todosRef.path);

        // Fetch all documents in the 'todos' subcollection
        const todosSnapshot = await getDocs(todosRef);

        // Delete each todo document in the subcollection
        const deleteTodoPromises = todosSnapshot.docs.map((todoDoc) =>
          deleteDoc(todoDoc.ref)
        );
        await Promise.all(deleteTodoPromises);
        console.log(`Deleted ${todosSnapshot.size} todos from subcollection`);

        // Delete the parent list document
        await deleteDoc(listDocRef);
        console.log("List document deleted successfully");

        // Optionally notify parent component
        // onDelete(list.id);
      } catch (error) {
        console.error("Error deleting list and its subcollections:", error);
        throw error; // Optionally rethrow to handle in UI
      }
    }
  };

  // Hook to fetch the count of todos and completed todos
  const useTodoCount = () => {
    const [counts, setCounts] = useState({ total: 0, completed: 0 });

    useEffect(() => {
      if (!user || !list.id) return;

      const collectionPath =
        type === "group"
          ? `groups/${groupId}/${listType}/${list.id}/todos`
          : `users/${user.uid}/lists/${list.id}/todos`;

      const todosRef = collection(db, collectionPath);

      const unsubscribe = onSnapshot(todosRef, (snapshot) => {
        const todosData = snapshot.docs.map((doc) => ({ ...doc.data() }));
        const total = todosData.length;
        const completed = todosData.filter((todo) => todo.completed).length;
        setCounts({ total, completed });
      });

      return () => unsubscribe();
    }, [user, list.id, type, groupId]);

    return counts;
  };

  const { total: totalTodos, completed: completedTodos } = useTodoCount();

  return (
    <>
      <ListConfirmationDialog />
      <div className="border rounded-md mb-2 bg-stone-100">
        <div
          className="flex justify-between items-center p-3 cursor-pointer"
          onClick={() => setIsTodoListModalOpen(true)}
        >
          <div className="flex items-center space-x-2">
            <span>{list.listName}</span>
            {totalTodos > 0 && (
              <span className="text-sm text-gray-500">
                ({completedTodos}/{totalTodos})
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
      </div>
      <EditListModal
        isOpen={isEditListModalOpen}
        onClose={() => {
          setIsEditListModalOpen(false);
          setCurrentEditList(null);
        }}
        list={currentEditList}
        onSave={handleEditList}
        db={db}
        activeTab={type}
        user={user}
        selectedGroupId={groupId}
      />
      <TodoListModal
        isOpen={isTodoListModalOpen}
        onClose={() => setIsTodoListModalOpen(false)}
        list={list}
        user={user}
        db={db}
        type={type}
        groupId={groupId}
        listType={listType}
      />
    </>
  );
}

export default ExpandableListAll;
