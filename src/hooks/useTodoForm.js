import { useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

export const useTodoForm = (db, user, showToastMessage, newTodo, setNewTodo, nickName, selectedGroupId) => {
  //const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const addTodo = async (e, activeTab) => {
    console.log(selectedGroupId)
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const todoData = {
        text: newTodo,
        completed: false,
        statue: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.uid,
        type: activeTab === "personal" ? "personal" : "group",
        createdBy: nickName,
      };

      if (activeTab === "group") {
        if (!selectedGroupId) {
          showToastMessage("Lütfen bir grup seçin", "warning");
          return;
        }
        todoData.groupId = selectedGroupId;
      }

      console.log(todoData)

      await addDoc(collection(db, "todos"), todoData);
      setNewTodo("");
      showToastMessage("Görev başarıyla eklendi :)", "success");
    } catch (error) {
      console.error("Error adding todo:", error);
      showToastMessage("Todo eklenirken bir hata oluştu. :)", "warning");
    }
  };

  const saveEdit = async (todo, nickName) => {
    if (!editText.trim()) return;

    try {
      await updateDoc(doc(db, "todos", todo.id), {
        text: editText,
        updatedAt: new Date().toISOString(),
        updatedBy: nickName,
      });
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating todo:", error);
      showToastMessage("Todo güncellenirken bir hata oluştu: )", "warning");
    }
  };

  return {
    newTodo,
    setNewTodo,
    editingId,
    setEditingId,
    editText,
    setEditText,
    addTodo,
    saveEdit
  };
};