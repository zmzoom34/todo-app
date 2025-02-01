import { deleteDoc, doc, updateDoc } from 'firebase/firestore';

export const useTodoOperations = (db, showToastMessage) => {
  const deleteTodo = async (todo) => {
    try {
      await deleteDoc(doc(db, "todos", todo.id));
      showToastMessage("Görev başarıyla silindi :)", "success");
    } catch (error) {
      console.error("Error deleting todo:", error);
      showToastMessage("Todo silinirken bir hata oluştu: )", "warning");
    }
  };

  const toggleComplete = async (todo, nickName) => {
    try {
      await updateDoc(doc(db, "todos", todo.id), {
        completed: !todo.completed,
        updatedAt: new Date().toISOString(),
        completedBy: !todo.completed ? nickName : null,
      });
      
      if (todo.completed) {
        showToastMessage("Görev yapılmadı", "info");
      } else {
        showToastMessage("Görev yapıldı", "success");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      showToastMessage("Todo güncellenirken bir hata oluştu: )", "warning");
    }
  };

  const archiveTodo = async (todo, nickName, setIsModalOpenArchive) => {
    if (!todo.completed) {
      showToastMessage('Tamamlanmamış görev arşivlenemez', 'warning');
      return false;
    }

    try {
      await updateDoc(doc(db, "todos", todo.id), {
        statue: "archive", // 'statue' yerine 'status' düzeltildi
        archivedAt: new Date().toISOString(),
        archivedBy: nickName,
      });
      showToastMessage("Görev arşivlendi...", "success");
      
      if (setIsModalOpenArchive) {
        setIsModalOpenArchive(false);
      }
      return true;
    } catch (error) {
      console.error("Error updating todo:", error);
      showToastMessage("Todo güncellenirken bir hata oluştu: )", "warning");
      return false;
    }
  };

  return {
    deleteTodo,
    toggleComplete,
    archiveTodo
  };
};
