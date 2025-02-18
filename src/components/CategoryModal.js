import React, { useState, useEffect } from "react";
import { db } from "../firebase-config"; // Firebase bağlantısı
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Edit, Trash2, X, Save } from "lucide-react";
import { Input } from "../components/ui/input";

const CategoryModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categoryList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setCategories(categoryList);
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() === "" || newCategoryId.trim() === "") return;

    await setDoc(doc(db, "categories", newCategoryId), { name: newCategory });
    setNewCategory("");
    setNewCategoryId("");
    fetchCategories();
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || editText.trim() === "" || editId.trim() === "")
      return;

    if (editingCategory.id === editId) {
      await updateDoc(doc(db, "categories", editingCategory.id), {
        name: editText,
      });
    } else {
      await deleteDoc(doc(db, "categories", editingCategory.id));
      await setDoc(doc(db, "categories", editId), { name: editText });
    }

    setEditingCategory(null);
    setEditText("");
    setEditId("");
    fetchCategories();
  };

  const confirmDeleteCategory = (category) => {
    setCategoryToDelete(category);
  };
  

  const handleDeleteConfirmed = async () => {
    if (!categoryToDelete) return;
  
    await deleteDoc(doc(db, "categories", categoryToDelete.id));
    setCategoryToDelete(null);
    fetchCategories();
  };
  

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 w-full max-w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Kategorileri Yönet</h2>
        <div className="flex flex-col gap-2 mb-4">
          <Input
            type="text"
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            placeholder="Yeni kategori ID..."
          />
          <Input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Yeni kategori adı..."
          />
          <Button onClick={handleAddCategory}>Ekle</Button>
        </div>
        <div className="max-h-60 overflow-y-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">ID</th>
                <th className="border border-gray-300 p-2">Adı</th>
                <th className="border border-gray-300 p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border border-gray-300">
                  {editingCategory?.id === category.id ? (
                    <>
                      <td className="border border-gray-300 p-2">
                        <Input
                          type="text"
                          value={editId}
                          onChange={(e) => setEditId(e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 flex gap-2">
                        <Button size="sm" onClick={handleUpdateCategory}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border border-gray-300 p-2">
                        {category.id}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {category.name}
                      </td>
                      <td className="border border-gray-300 p-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(category);
                            setEditId(category.id);
                            setEditText(category.name);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
  size="sm"
  variant="destructive"
  onClick={() => confirmDeleteCategory(category)}
>
  <Trash2 className="w-4 h-4" />
</Button>

                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categoryToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-bold mb-4">Silme Onayı</h2>
              <p>
                <strong>{categoryToDelete.name}</strong> kategorisini silmek
                istediğinize emin misiniz?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCategoryToDelete(null)}
                >
                  İptal
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirmed}>
                  Sil
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryModal;
