import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useToast } from "../../hooks/useToast";
import ConfirmModal from "./ConfirmModal";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Modal from "react-modal";

function ListsWithReports({
  lists,
  user,
  db,
  type = "user",
  groupId = null,
  toggleSidebar,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToastMessage } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleConfirm = () => {
    // Burada onaylandıktan sonra yapılacak işlemi ekleyin
    console.log("İşlem onaylandı!");
    closeModal(); // Onay modal'ını kapat
    setIsLoadingModalOpen(true); // Yükleme modal'ını aç
    generateTodosReport();
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

      const collectionType = type === "group" ? `Grup` : `Kişi`;
      const msg =
        collectionType + " Rapor oluşturuldu. İndirilenler klasörüne bakın";
      showToastMessage(msg, "success");
    } catch (error) {
      console.error("Error generating todos report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingModalOpen(false); // İşlem tamamlandığında yükleme modal'ını kapat
    }
  };

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

  return (
    <div>
      <div
        className="mr-2 cursor-pointer mb-2"
        onClick={() => {
          toggleSidebar();
          setIsModalOpen(true);
        }}
        disabled={isLoading}
      >
        Excel Export
      </div>

      {/* Onay Modalı */}
      <ConfirmModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        handleConfirm={handleConfirm}
        contentLabel="Onay Modalı"
      />

      {/* Yükleme Modalı */}
      <Modal
        isOpen={isLoadingModalOpen}
        contentLabel="Yükleme Durumu"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "300px",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 className="text-lg font-medium mb-4">Rapor Oluşturuluyor</h3>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
        <p className="text-gray-600">Lütfen bekleyin, verileriniz işleniyor...</p>
      </Modal>
    </div>
  );
}

export default ListsWithReports;