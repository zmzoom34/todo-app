import { deleteDoc, doc, updateDoc } from 'firebase/firestore';

export const useTodoOperations = (db, showToastMessage) => {
  const fetchExchangeRate = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/TRY");
      const data = await response.json();
      return data.rates.USD;
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      return null;
    }
  };

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

  const archiveTodo = async (todo, nickName, setIsModalOpenArchive, prizeTL) => {
    if (!todo.completed) {
      showToastMessage('Tamamlanmamış görev arşivlenemez', 'warning');
      return false;
    }

    try {
      const exchangeRate = await fetchExchangeRate();
      if (!exchangeRate) {
        showToastMessage("Döviz kuru alınamadı, işlem iptal edildi", "error");
        return false;
      }
      const prizeUSD = (prizeTL * exchangeRate).toFixed(2);
      
      await updateDoc(doc(db, "todos", todo.id), {
        statue: "archive", 
        archivedAt: new Date().toISOString(),
        archivedBy: nickName,
        prizeTL,
        prizeUSD,
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
