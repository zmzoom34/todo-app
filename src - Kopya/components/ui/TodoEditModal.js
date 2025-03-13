import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CategorySelect from "../ui/CatagorySelect";
import { Camera, X } from "lucide-react";
import BarcodeScanner from "../BarcodeScanner";
import NotificationSound from "../sounds/beep-07a.mp3";

const TodoEditModal = ({
  isOpen,
  onClose,
  todo,
  editText,
  setEditText,
  onSave,
  categories,
  stores,
  units,
  activeTab,
}) => {
  const [todoData, setTodoData] = useState({
    id: "",
    text: "",
    category: "",
    amount: "",
    prizeTL: "",
    prizeUSD: "",
    brand: "",
    store: "",
    unit: "",
    groupId: "",
    userId: "",
    createdAt: "",
    updatedAt: "",
    archivedAt: "",
    completed: false,
    completedBy: "",
    archivedBy: "",
    createdBy: "",
    statue: "",
    barcode: "",
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const audioPlayer = useRef(null);
  const [scanResult, setScanResult] = useState(null);

  // Ses çalma fonksiyonu
  const playAudio = () => {
    if (audioPlayer.current) {
      audioPlayer.current.play()
        .then(() => {
          console.log("Ses başarıyla çalındı");
        })
        .catch((error) => {
          console.error("Ses çalma hatası:", error);
        });
    } else {
      console.error("Audio elementi bulunamadı");
    }
  };

  useEffect(() => {
    if (todo) {
      setTodoData({
        id: todo.id || "",
        text: todo.text || "",
        category: todo.category || "",
        amount: todo.amount || "",
        prizeTL: todo.prizeTL || "",
        prizeUSD: todo.prizeUSD || "",
        brand: todo.brand || "",
        store: todo.store || "",
        unit: todo.unit || "",
        groupId: todo.groupId || "",
        userId: todo.userId || "",
        createdAt: todo.createdAt || "",
        updatedAt: todo.updatedAt || "",
        archivedAt: todo.archivedAt || "",
        completed: todo.completed || false,
        completedBy: todo.completedBy || "",
        archivedBy: todo.archivedBy || "",
        createdBy: todo.createdBy || "",
        statue: todo.statue || "",
        barcode: todo.barcode || "",
      });
    }
  }, [todo]);

  useEffect(() => {
    if (isScanning) {
      console.log("Scanning started");
    } else {
      console.log("Scanning stopped");
    }
  }, [isScanning]);

  const handleInputChange = (field, value) => {
    setTodoData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleScanSuccess = (decodedText) => {
    setScanResult(decodedText);
    setTodoData((prev) => ({
      ...prev,
      barcode: decodedText,
    }));
    toggleScanner();
    playAudio(); // Ses burada çalınıyor
    console.log(`Scan result: ${decodedText}`);
  };

  const handleScanError = (error) => {
    setScannerError(`Scanner error: ${error.message || "Unknown error"}`);
    console.error(error);
  };

  const handleSaveTodo = (e) => {
    e.preventDefault();
    onSave(todoData);
    onClose();
  };

  const toggleScanner = () => {
    setIsScanning((prev) => !prev);
    if (isScanning) {
      setScanResult(null);
    }
  };

  const handleClose = () => {
    setScanResult(null);
    setIsScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-8 w-full max-w-lg relative overflow-y-auto max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">Görevi Düzenle</h2>

        <form onSubmit={handleSaveTodo} className="space-y-4">
          <div>
            <label htmlFor="taskDetail" className="block text-sm font-medium text-gray-700 mb-2">
              Görev Detayı
            </label>
            <Input
              id="taskDetail"
              type="text"
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                handleInputChange("text", e.target.value);
              }}
              placeholder="Görevi düzenle..."
              className="w-full"
            />
          </div>

          <div className="w-full">
            <CategorySelect
              value={todoData.category}
              onValueChange={(value) => handleInputChange("category", value)}
              categories={categories}
            />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Miktar
              </label>
              <Input
                id="amount"
                type="text"
                value={todoData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="Miktar"
                className="w-full"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                Birim
              </label>
              <select
                id="unit"
                value={todoData.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                className="w-full border rounded-lg p-2 bg-white text-gray-700"
              >
                <option value="">Birim Seç</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === "archive" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label htmlFor="prizeTL" className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (TL)
                  </label>
                  <Input
                    id="prizeTL"
                    type="number"
                    value={todoData.prizeTL}
                    onChange={(e) => handleInputChange("prizeTL", e.target.value)}
                    placeholder="Fiyat (TL)"
                    className="w-full"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="prizeUSD" className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (USD)
                  </label>
                  <Input
                    id="prizeUSD"
                    type="number"
                    value={todoData.prizeUSD}
                    onChange={(e) => handleInputChange("prizeUSD", e.target.value)}
                    placeholder="Fiyat (USD)"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Marka
                  </label>
                  <Input
                    id="brand"
                    type="text"
                    value={todoData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="Marka"
                    className="w-full"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-2">
                    Mağaza
                  </label>
                  <select
                    id="store"
                    value={todoData.store}
                    onChange={(e) => handleInputChange("store", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-gray-700"
                  >
                    <option value="">Mağaza Seç</option>
                    {stores.map((store, index) => (
                      <option key={index} value={store.value}>
                        {store.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  id="status"
                  value={todoData.statue}
                  onChange={(e) => handleInputChange("statue", e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white text-gray-700"
                >
                  <option value="">Durum Seç</option>
                  <option value="archive">Arşiv</option>
                  <option value="active">Aktif</option>
                </select>
              </div>

              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode / QR Code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    type="text"
                    value={todoData.barcode}
                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                    placeholder="Barcode number"
                    className="w-full"
                    disabled={isScanning}
                  />
                  <Button
                    type="button"
                    onClick={toggleScanner}
                    variant="outline"
                    className="flex items-center gap-1"
                    disabled={!navigator?.mediaDevices}
                    aria-label={isScanning ? "Close Scanner" : "Open Scanner"}
                  >
                    {isScanning ? <X size={16} /> : <Camera size={16} />}
                    {isScanning ? "Close" : "Scan"}
                  </Button>
                </div>

                {isScanning && (
                  <div className="mt-4">
                    <div
                      className="border rounded overflow-hidden mx-auto"
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                      }}
                    >
                      <BarcodeScanner
                        onScanSuccess={handleScanSuccess}
                        onScanError={handleScanError}
                      />
                      <audio ref={audioPlayer} src={NotificationSound} preload="auto" />
                      {scanResult && (
                        <div className="p-2 bg-green-100 text-green-800 text-center mt-2">
                          Scanned: {scanResult}
                        </div>
                      )}
                    </div>
                    {scannerError && (
                      <div className="text-red-500 text-sm mt-2 text-center">
                        {scannerError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

TodoEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  todo: PropTypes.object,
  editText: PropTypes.string,
  setEditText: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  stores: PropTypes.array.isRequired,
  units: PropTypes.array.isRequired,
  activeTab: PropTypes.string,
};

export default TodoEditModal;