import React, { useState, useEffect } from "react";
import { FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useToast } from "../../hooks/useToast";

function ListsWithReports({ lists, user, db, type = "user", groupId = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToastMessage } = useToast();

  const fetchListTodos = async (listId, collectionPath) => {
    try {
      const todosRef = collection(db, collectionPath);
      const todosQuery = query(todosRef, orderBy("createdAt", "desc"));
      const todosSnapshot = await getDocs(todosQuery);

      return todosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
        const collectionPath =
          type === "group"
            ? `groups/${groupId}/lists/${list.id}/todos`
            : `users/${user.uid}/lists/${list.id}/todos`;

        const listTodos = await fetchListTodos(list.id, collectionPath);

        // Her todo için rapor satırı oluştur
        const listReportData = listTodos.map((todo) => ({
          "List Name": list.listName,
          "Todo Text": todo.text,
          Status: todo.completed ? "Completed" : "Pending",
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
        `todos_report_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      const collectionType =
      type === "group"
        ? `Grup`
        : `Kişi`;
      const msg = collectionType + " Rapor oluşturuldu. İndirilenler klasörüne bakın"
      showToastMessage(msg, "success");
    } catch (error) {
      console.error("Error generating todos report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <>
          <FileSpreadsheet
            className="mr-2 h-8 w-8 cursor-pointer mb-2"
            onClick={generateTodosReport}
            disabled={isLoading}
          />
          {isLoading ? "Generating..." : ""}
        </>
      </div>
      {/* {lists.map(list => (
        <ExpandableListAll
          key={list.id}
          list={list}
          user={user}
          db={db}
          type={type}
          groupId={groupId}
        />
      ))} */}
    </div>
  );
}

export default ListsWithReports;
