import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  CircleX,
  Upload,
  ChevronDown,
  ChevronUp,
  Globe,
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
import BulkTodoModal from "./BulkTodoModal";
import Tooltip from "./Tooltip";
import SortableTodoItem from "./SortableTodoItem";
import useConfirm from "../../hooks/useConfirm";
import TodoTabs from "./TodoTabs";
import PlusButton from "./PlusButton";

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
  const [speechLang, setSpeechLang] = useState("en-US");
  const [showAddSection, setShowAddSection] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // New state for active tab
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

  // Calculate todo counts for tabs
  const todoCounts = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const notCompleted = total - completed;
    return { total, completed, notCompleted };
  }, [todos]);

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

  const toggleAddSection = () => {
    setShowAddSection(!showAddSection);
  };

  // Filter todos based on the active tab
  const filteredTodos = useMemo(() => {
    switch (activeTab) {
      case "completed":
        return todos.filter((todo) => todo.completed);
      case "notCompleted":
        return todos.filter((todo) => !todo.completed);
      case "all":
      default:
        return todos;
    }
  }, [todos, activeTab]);

  if (!isOpen || !list) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <TodoConfirmationDialog />
      <div className="bg-white p-2 rounded-lg w-full h-full max-w-4xl max-h-[100vh] overflow-y-auto m-0 sm:m-4">
        <div className="sticky top-0 z-10 bg-teal-100 shadow-md rounded-lg p-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-semibold truncate max-w-[200px] md:max-w-xs">
                {list.listName}
              </h2>
              {todos.length > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {todoCounts.completed}/{todoCounts.total}
                </span>
              )}
            </div>
            <div className="flex flex-wrap mr-0 md:mr-12 md:flex-nowrap items-center gap-2">
              <div className="relative group">
                <div className="md:hidden">
                  <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Globe size={18} />
                  </button>
                  <div className="absolute hidden group-hover:block top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-2 z-20 w-32">
                    <select
                      value={speechLang}
                      onChange={(e) => setSpeechLang(e.target.value)}
                      className="w-full text-sm p-1"
                    >
                      <option value="en-US">English</option>
                      <option value="tr-TR">Turkish</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                    </select>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <label
                    htmlFor="speech-lang"
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    Speech:
                  </label>
                  <select
                    id="speech-lang"
                    value={speechLang}
                    onChange={(e) => setSpeechLang(e.target.value)}
                    className="text-sm border rounded-md p-1.5 bg-gray-50 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                  >
                    <option value="en-US">English</option>
                    <option value="tr-TR">Turkish</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                  </select>
                </div>
              </div>
              {listType !== "listsAdvanced" && (
                <button
                  className="flex items-center justify-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setIsBulkTodoModalOpen(true)}
                >
                  <Upload size={16} />
                  <span className="text-sm">Bulk</span>
                </button>
              )}
            </div>
            <div className="absolute top-2 right-2 md:top-2 md:right-2">
              <button
                onClick={onClose}
                className="p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                aria-label="Close"
              >
                <CircleX size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          {/* Tabs */}
          <TodoTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            todoCounts={todoCounts}
          />

          {/* Toggle button for add section */}
          <PlusButton onClick={toggleAddSection} />
        </div>

        {showAddSection && (
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
                    : !newTodoText.trim()
                }
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1 w-full"
              >
                <Plus className="w-5 h-5" />
                <span>Add Todo</span>
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading todos...</p>
          </div>
        ) : filteredTodos.length > 0 ? (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                toggleTodoCompletion={toggleTodoCompletion}
                updateTodoItems={updateTodoItems}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
                isDraggable={false}
                speechLang={speechLang}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            <p className="text-xl">No todos in this category</p>
            <p className="mt-2">Add a todo using the form above.</p>
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

export default TodoListModal;
