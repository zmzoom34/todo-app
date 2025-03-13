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

const StoreModal = ({ isOpen, onClose }) => {
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState("");
  const [newUnitId, setNewUnitId] = useState("");
  const [editingUnit, setEditingUnit] = useState(null);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    const querySnapshot = await getDocs(collection(db, "stores"));
    const unitList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setUnits(unitList);
  };

  const handleAddUnit = async () => {
    if (newUnit.trim() === "" || newUnitId.trim() === "") return;

    await setDoc(doc(db, "stores", newUnitId), { name: newUnit });
    setNewUnit("");
    setNewUnitId("");
    fetchUnits();
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit || editText.trim() === "" || editId.trim() === "") return;

    if (editingUnit.id === editId) {
      await updateDoc(doc(db, "stores", editingUnit.id), {
        name: editText,
      });
    } else {
      await deleteDoc(doc(db, "stores", editingUnit.id));
      await setDoc(doc(db, "stores", editId), { name: editText });
    }

    setEditingUnit(null);
    setEditText("");
    setEditId("");
    fetchUnits();
  };

  const handleDeleteUnit = async (unitId) => {
    await deleteDoc(doc(db, "stores", unitId));
    fetchUnits();
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
        <h2 className="text-xl font-bold mb-4">Mağazaları Yönet</h2>
        <div className="flex flex-col gap-2 mb-4">
          <Input
            type="text"
            value={newUnitId}
            onChange={(e) => setNewUnitId(e.target.value)}
            placeholder="Yeni mağaza ID..."
          />
          <Input
            type="text"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="Yeni mağaza adı..."
          />
          <Button onClick={handleAddUnit}>Ekle</Button>
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
              {units.map((unit) => (
                <tr key={unit.id} className="border border-gray-300">
                  {editingUnit?.id === unit.id ? (
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
                        <Button size="sm" onClick={handleUpdateUnit}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUnit(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border border-gray-300 p-2">{unit.id}</td>
                      <td className="border border-gray-300 p-2">{unit.name}</td>
                      <td className="border border-gray-300 p-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUnit(unit);
                            setEditId(unit.id);
                            setEditText(unit.name);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUnit(unit.id)}
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
      </div>
    </div>
  );
};

export default StoreModal;
