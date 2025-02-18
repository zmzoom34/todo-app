import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

const CategorySelect = ({ onValueChange, value, categories = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);

  const selectedLabel = categories.find(cat => cat.value === value)?.label || "Kategori seçin";

  // Dışarıya tıklanınca menüyü kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Arama kutusundaki değere göre kategori listesini filtreleme
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

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
        <span className="text-gray-700">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Açılır menü içeriği */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-300 shadow-lg max-h-60 overflow-auto">
          {/* Arama Kutusu */}
          <div className="flex items-center px-3 py-2 border-b">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>

          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div
                key={category.value}
                onClick={() => handleSelect(category.value)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {category.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">Sonuç bulunamadı</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
