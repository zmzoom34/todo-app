import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

function ConfirmModal( {
    isModalOpen,
    closeModal,
    handleConfirm,
    contentLabel = "Onay Modalı",    
} ) {
  return (
    <div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={contentLabel}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h2 className="text-lg font-bold mb-4">İşlemi Onayla</h2>
        <p>Bu işlemi gerçekleştirmek istediğinizden emin misiniz?</p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            İptal
          </button>
          <button
            onClick={() => {
              handleConfirm();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Onayla
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default ConfirmModal;
