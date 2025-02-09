import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { db } from "../../firebase-config"; // Firebase bağlantısını içeri aktar
import { collection, getDocs } from "firebase/firestore";

const CategorySelect = ({ onValueChange, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoryList = querySnapshot.docs.map(doc => {
          // console.log("Kategori Verisi:", doc.data()); // Debug için
          return {
            value: doc.id,
            label: doc.data().name
          };
        });
  
        setCategories(categoryList);
        setLoading(false);
      } catch (error) {
        console.error("Kategoriler alınırken hata oluştu:", error);
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, []);
  

  const selectedLabel = categories.find(cat => cat.value === value)?.label || "Kategori seçin";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(selectedValue);
    }
  };

  return (
    <div ref={selectRef} className="relative w-full">
      {/* Açılır menü düğmesi */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-gray-700">
          {loading ? "Yükleniyor..." : selectedLabel}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Açılır menü içeriği */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-300 shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-700">Yükleniyor...</div>
          ) : (
            categories.map((category) => (
              <div
                key={category.value}
                onClick={() => handleSelect(category.value)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {category.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
