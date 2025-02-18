import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CategorySelect from "./CatagorySelect";
import { db } from "../../firebase-config"; // Firestore bağlantısı
import { collection, getDocs } from "firebase/firestore";

const TodoEditModal = ({
  isOpen,
  onClose,
  todo,
  editText,
  setEditText,
  onSave,
  setEditCategory,
  setEditAmount,
  setEditUnit,
  categories
}) => {
  const [selectedCategory, setSelectedCategory] = useState(todo?.category || "");
  const [amount, setAmount] = useState(todo?.amount || "");
  const [unit, setUnit] = useState(todo?.unit || "");
  const [unitOptions, setUnitOptions] = useState([]); // Firestore'dan gelen birimler

  useEffect(() => {
    if (todo) {
      setEditText(todo.text);
      setSelectedCategory(todo.category || "");
      setAmount(todo.amount || "");
      setUnit(todo.unit || "");
    }
  }, [todo, setEditText]);

  // Firestore'dan birimleri çek
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "units"));
        const unitsList = querySnapshot.docs.map((doc) => doc.data().name); // 'name' alanını al
        setUnitOptions(unitsList);
      } catch (error) {
        console.error("Birimleri çekerken hata oluştu:", error);
      }
    };

    fetchUnits();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();

    setEditCategory(selectedCategory);
    setEditAmount(amount);
    setEditUnit(unit);

    onSave({
      ...todo,
      text: editText,
      category: selectedCategory,
      amount: amount,
      unit: unit
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Görevi Düzenle</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Görev Detayı
            </label>
            <Input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Görevi düzenle..."
              className="w-full"
            />
          </div>

          <div className="w-full max-w-xs">
            <CategorySelect
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setEditCategory(value);
              }}
              categories={categories}
            />
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setEditAmount(e.target.value);
              }}
              placeholder="Miktar"
              className="w-1/2"
            />
            <select
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                setEditUnit(e.target.value);
              }}
              className="w-1/2 border rounded-lg p-2 bg-white text-gray-700"
            >
              <option value="">Birim Seç</option>
              {unitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoEditModal;
