import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";
import Modal from "react-modal";

// Modal'ın kök elementini belirleme (React Modal için gerekli)
//Modal.setAppElement("#root"); // Bu, uygulamanızın kök elementidir, genellikle public/index.html'de bulunur.

const BackupCollectionToJson = ({ collectionName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBackup = async () => {
    try {
      if (!collectionName) {
        throw new Error("Koleksiyon adı belirtilmedi.");
      }

      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${collectionName}_backup.json`;
      link.click();

      URL.revokeObjectURL(url);

      console.log(`${collectionName} koleksiyonu başarıyla yedeklendi.`);
    } catch (error) {
      console.error("Yedekleme sırasında bir hata oluştu:", error.message);
      alert(`Yedekleme hatası: ${error.message}`);
    } finally {
      setIsModalOpen(false); // Modal'ı kapat
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <div
        className="flex"
        onClick={openModal}
        disabled={!collectionName}
        style={{ cursor: "pointer" }}
      >
        {collectionName
          ? `${collectionName} JSON`
          : "Koleksiyon Adı Belirtilmedi"}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Yedekleme Onayı"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h2>Yedekleme Onayı</h2>
        <p>{collectionName} koleksiyonunu yedeklemek istediğinizden emin misiniz?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={closeModal}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#e0e0e0",
              cursor: "pointer",
            }}
          >
            İptal
          </button>
          <button
            onClick={handleBackup}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Yedekle
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BackupCollectionToJson;