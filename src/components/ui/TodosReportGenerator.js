import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';
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

function TodosReportGenerator({ 
  user, 
  db, 
  lists, 
  type = "user", 
  groupId = null 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchListTodos = async (listId, collectionPath) => {
    try {
      const todosRef = collection(db, collectionPath);
      const todosQuery = query(todosRef, orderBy("createdAt", "desc"));
      const todosSnapshot = await getDocs(todosQuery);
      
      return todosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error fetching todos for list ${listId}:`, error);
      return [];
    }
  };

  const generateTodosReport = async () => {
    setIsLoading(true);
    try {
      const reportData = [];

      // Her liste için todoları topla
      for (const list of lists) {
        const collectionPath = type === "group"
          ? `groups/${groupId}/lists/${list.id}/todos`
          : `users/${user.uid}/lists/${list.id}/todos`;

        const listTodos = await fetchListTodos(list.id, collectionPath);

        // Her todo için rapor satırı oluştur
        const listReportData = listTodos.map(todo => ({
          "List Name": list.listName,
          "Todo Text": todo.text,
          "Status": todo.completed ? "Completed" : "Pending",
          "Created At": new Date(todo.createdAt).toLocaleString(),
          "Updated At": new Date(todo.updatedAt).toLocaleString(),
        }));

        reportData.push(...listReportData);
      }

      // Excel dosyası oluşturma
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Todos Report");

      // Raporu indirme
      XLSX.writeFile(
        workbook, 
        `todos_report_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (error) {
      console.error("Error generating todos report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={generateTodosReport}
      disabled={isLoading}
      className="flex items-center bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
    >
      <FileSpreadsheet className="mr-2" /> 
      {isLoading ? "Generating..." : "Export Todos Report"}
    </button>
  );
}

export default TodosReportGenerator;