// utils/todoUtils.js
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    getDocs,
  } from "firebase/firestore";
  
  export const addTodoToList = async (
    user,
    db,
    collectionPath,
    newTodoText,
    advancedTodoData,
    list
  ) => {
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
    return docRef;
  };
  
  export const handleEditTodo = async (todoId, newData, db, collectionPath, list, listType) => {
    const todoRef = doc(db, collectionPath, todoId);
  
    let updateData;
    if (list?.isAdvanced || listType === "listsAdvanced") {
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
      updateData = {
        text: newData.trim(),
        updatedAt: new Date().toISOString(),
      };
    }
  
    await updateDoc(todoRef, updateData);
  };
  
  export const toggleTodoCompletion = async (todoId, currentStatus, db, collectionPath) => {
    const todoRef = doc(db, collectionPath, todoId);
    await updateDoc(todoRef, {
      completed: !currentStatus,
      updatedAt: new Date().toISOString(),
    });
  };
  
  export const handleDeleteTodo = async (todoId, db, collectionPath, confirmDeleteTodo) => {
    const confirmed = await confirmDeleteTodo();
    if (confirmed) {
      const todoRef = doc(db, collectionPath, todoId);
      await deleteDoc(todoRef);
    }
  };

  export const bulkAddTodos = async (user, db, collectionPath, todos) => {
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
  }