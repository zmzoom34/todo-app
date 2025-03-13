import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./custom-dialog-components";
import { Input } from "./input";
import { Button } from "./button";

const PriceInputModal = ({ isOpen, onClose, onConfirm, todoText, stores }) => {
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [brand, setBrand] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Alfabetik sıralama
  const sortedStores = [...stores].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    // Remove any leading/trailing whitespace
    const trimmedPrice = price.trim();

    // Validate if empty
    if (!trimmedPrice) {
      setError("Fiyat alanı boş bırakılamaz");
      return;
    }

    // Validate if it's a valid number (integer or decimal)
    const isValidNumber = /^\d*\.?\d+$/.test(trimmedPrice);

    if (!isValidNumber) {
      setError("Lütfen geçerli bir sayı giriniz (örn: 5 veya 5.5)");
      return;
    }

    // Clear error and call onConfirm with the validated price
    setError("");
    onConfirm(parseFloat(trimmedPrice), store, brand);
    setPrice("");
  };

  const handleClose = () => {
    setPrice("");
    setStore("");
    setBrand("");
    setError("");
    onClose();
  };

  // Check if price is empty or contains only whitespace
  const isSubmitDisabled = !price.trim() || !store.trim() || !brand.trim();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arşivleme Fiyatı</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            "{todoText}" görevi için fiyat, mağaza, marka giriniz
          </p>
          <Input
            ref={inputRef}
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setError("");
            }}
            placeholder="Fiyat (TL)"
            className={error ? "border-red-500" : ""}
          />
          <select
            value={store}
            onChange={(e) => {
              setStore(e.target.value);
              setError("");
            }}
            className={`w-full p-2 border rounded ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Mağaza seçiniz</option>
            {sortedStores.map((store) => (
              <option key={store.value} value={store.value}>
                {store.label}
              </option>
            ))}
          </select>
          <Input
            type="text"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setError("");
            }}
            placeholder="Marka?"
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceInputModal;