import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CategorySelect from "../ui/CatagorySelect";
import { Camera, X } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

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
  // Single state object to manage all todo fields
  const [todoData, setTodoData] = useState({
    id: todo?.id || "",
    text: todo?.text || "",
    category: todo?.category || "",
    amount: todo?.amount || "",
    prizeTL: todo?.prizeTL || "",
    prizeUSD: todo?.prizeUSD || "",
    brand: todo?.brand || "",
    store: todo?.store || "",
    unit: todo?.unit || "",
    groupId: todo?.groupId || "",
    userId: todo?.userId || "",
    createdAt: todo?.createdAt || "",
    updatedAt: todo?.updatedAt || "",
    archivedAt: todo?.archivedAt || "",
    completed: todo?.completed || false,
    completedBy: todo?.completedBy || "",
    archivedBy: todo?.archivedBy || "",
    createdBy: todo?.createdBy || "",
    statue: todo?.statue || "",
    barcode: todo?.barcode || "",
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const scannerRef = useRef(null);

  // Update todoData when the `todo` prop changes
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

  // Initialize barcode scanner when isScanning is true
  useEffect(() => {
    if (isScanning) {
      startScanner();
    }

    // Remove the cleanup from here and handle it differently
  }, [isScanning]); // Only depend on isScanning

  const handleInputChange = (field, value) => {
    setTodoData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSaveTodo = (e) => {
    e.preventDefault();
    onSave(todoData); // Pass the updated todoData to the parent
    onClose(); // Close the modal
  };

  const startScanner = () => {
    console.log("Starting scanner...");
    setScannerError(null);

    const scannerContainer = document.getElementById("scanner-container");
    if (!scannerContainer) {
      setScannerError("Scanner container not found");
      setIsScanning(false);
      return;
    }

    try {
      scannerContainer.innerHTML = "";

      const scanner = new Html5QrcodeScanner(
        "scanner-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [0],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          facingMode: "environment",
          disableFlip: false,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          console.log("QR code scanned successfully:", decodedText);
          handleInputChange("barcode", decodedText);
          setIsScanning(false); // Stop scanning after success
          stopScanner();
        },
        (error) => {
          // Safely handle the error
          const errorMessage = error?.message || "Unknown error occurred";
          console.warn("Scan error:", errorMessage);

          // Ignore "no QR code found" errors (common during scanning)
          if (
            errorMessage.includes(
              "No MultiFormat Readers were able to detect"
            ) ||
            errorMessage.includes("No QR code found")
          ) {
            // Do nothing - this is expected during continuous scanning
          } else {
            setScannerError("Scanning error: " + errorMessage);
          }
        }
      );

      // Check camera permissions
      navigator.mediaDevices.getUserMedia({ video: true }).catch((err) => {
        console.error("Camera permission error:", err);
        setScannerError("Camera access denied: " + err.message);
        setIsScanning(false);
      });
    } catch (error) {
      console.error("Scanner initialization failed:", error);
      setScannerError(
        "Failed to start scanner: " + (error.message || "Unknown error")
      );
      setIsScanning(false);
    }
  };

  // Add separate cleanup useEffect
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts or isScanning changes
      if (!isScanning && scannerRef.current) {
        stopScanner();
      }
    };
  }, [isScanning]); // Depend on isScanning

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current.html5Qrcode;
        if (scanner && scanner.isScanning) {
          await scanner.stop(); // Kamerayı durdur
          console.log("Scanner stopped successfully");
        }
        scannerRef.current.clear(); // UI temizleme
        scannerRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
        setScannerError("Error stopping scanner: " + error.message);
      }
    }
    setScannerError(null);
  };

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner(); // Kamerayı kapat
      setIsScanning(false);
    } else {
      setIsScanning(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 w-full max-w-lg relative overflow-y-auto max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Görevi Düzenle</h2>

        <form onSubmit={handleSaveTodo} className="space-y-4">
          {/* Görev Detayı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Görev Detayı
            </label>
            <Input
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

          {/* Kategori Seçimi */}
          <div className="w-full max-w-xs">
            <CategorySelect
              value={todoData.category}
              onValueChange={(value) => handleInputChange("category", value)}
              categories={categories}
            />
          </div>

          {/* Miktar ve Birim */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={todoData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="Miktar"
              className="w-1/2"
            />
            <select
              value={todoData.unit}
              onChange={(e) => handleInputChange("unit", e.target.value)}
              className="w-1/2 border rounded-lg p-2 bg-white text-gray-700"
            >
              <option value="">Birim Seç</option>
              {units.map((unit, index) => (
                <option key={index} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {/* Durum Alanı */}
          {activeTab === "archive" ? (
            <div>
              {/* Fiyat Alanları */}
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (TL)
                  </label>
                  <Input
                    type="number"
                    value={todoData.prizeTL}
                    onChange={(e) =>
                      handleInputChange("prizeTL", e.target.value)
                    }
                    placeholder="Fiyat (TL)"
                    className="w-full"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (USD)
                  </label>
                  <Input
                    type="number"
                    value={todoData.prizeUSD}
                    onChange={(e) =>
                      handleInputChange("prizeUSD", e.target.value)
                    }
                    placeholder="Fiyat (USD)"
                    className="w-full"
                  />
                </div>
              </div>
              {/* Marka ve Mağaza Alanları */}
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka
                  </label>
                  <Input
                    type="text"
                    value={todoData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="Marka"
                    className="w-full"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mağaza
                  </label>
                  <select
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={todoData.statue}
                  onChange={(e) => handleInputChange("statue", e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white text-gray-700"
                >
                  <option value="">Durum Seç</option>
                  <option value="archive">Arşiv</option>
                  <option value="active">Aktif</option>
                </select>
              </div>
              {/* Barcode / QR Code Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode / QR Code
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={todoData.barcode}
                    onChange={(e) =>
                      handleInputChange("barcode", e.target.value)
                    }
                    placeholder="Barcode number"
                    className="w-full"
                    disabled={isScanning} // Disable input while scanning
                  />
                  <Button
                    type="button"
                    onClick={toggleScanner}
                    variant="outline"
                    className="flex items-center gap-1"
                    disabled={!navigator.mediaDevices} // Disable if no camera support
                  >
                    {isScanning ? <X size={16} /> : <Camera size={16} />}
                    {isScanning ? "Close" : "Scan"}
                  </Button>
                </div>

                {/* Scanner Display */}
                {isScanning && (
                  <div className="mt-4">
                    <div
                      id="scanner-container"
                      className="border rounded overflow-hidden mx-auto"
                      style={{
                        height: "300px",
                        width: "100%",
                        maxWidth: "400px",
                      }}
                    ></div>
                    {scannerError && (
                      <div className="text-red-500 text-sm mt-2 text-center">
                        {scannerError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Butonlar */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose(); // Fonksiyon çağırılmalı
                stopScanner();
              }}
            >
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Prop validation
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
