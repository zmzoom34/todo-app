import React, { useState, useEffect } from "react";
import { Edit, Trash, Volume2, Copy, Users, User } from "lucide-react";
import {
  collection,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import EditListModal from "./EditListModal";
import TodoListModal from "./TodoListModal";
import useConfirm from "../../hooks/useConfirm";
import { useFirebaseSubscriptions } from "../../hooks/useFirebaseSubscriptions";
import MobileTodoListCard from "./MobileTodoListCard";
import Modal from "react-modal";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
//import CopyOptionsModal from "./CopyOptionsModal";

function ExpandableListAll({
  list,
  onEdit,
  onDelete,
  user,
  db,
  type = "user",
  groupId = null,
  listType,
}) {
  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [isTodoListModalOpen, setIsTodoListModalOpen] = useState(false);
  const [currentEditList, setCurrentEditList] = useState(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [copyTarget, setCopyTarget] = useState("personal");
  const [isCopying, setIsCopying] = useState(false);

  const { groups } = useFirebaseSubscriptions(db, user);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const [ListConfirmationDialog, confirmDeleteList] = useConfirm(
    "Are you sure?",
    `Are you sure you want to delete the list "${list.listName}"?`
  );

  const openEditListModal = () => {
    setCurrentEditList(list);
    setIsEditListModalOpen(true);
  };

  const handleEditList = async (updatedList) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }
      const listCollectionPath =
        type === "group"
          ? `groups/${groupId}/lists`
          : `users/${user.uid}/lists`;
      const listDocRef = doc(db, listCollectionPath, updatedList.id);
      await updateDoc(listDocRef, {
        listName: updatedList.listName,
        timestamp: new Date().toISOString(),
      });
      console.log("List updated successfully");
      setIsEditListModalOpen(false);
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  const handleDeleteList = async () => {
    const confirmed = await confirmDeleteList();
    if (confirmed) {
      try {
        const listDocRef = doc(
          db,
          type === "group" ? `groups/${groupId}/` : `users/${user.uid}/`,
          listType,
          list.id
        );
        const todosRef = collection(db, `${listDocRef.path}/todos`);
        const todosSnapshot = await getDocs(todosRef);
        const deleteTodoPromises = todosSnapshot.docs.map((todoDoc) =>
          deleteDoc(todoDoc.ref)
        );
        await Promise.all(deleteTodoPromises);
        await deleteDoc(listDocRef);
        console.log("List document deleted successfully");
      } catch (error) {
        console.error("Error deleting list and its subcollections:", error);
      }
    }
  };

  const openCopyModal = (e) => {
    e.stopPropagation();
    if (groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
    setIsCopyModalOpen(true);
  };

  const handleCopyList = async () => {
    try {
      setIsCopyModalOpen(false); // Kopyalama modunu kapat
      setIsProcessModalOpen(true); // İşlem modunu aç
      setIsCopying(true);

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      let targetListCollectionPath;
      if (copyTarget === "personal") {
        targetListCollectionPath = `users/${user.uid}/${listType}`;
      } else if (copyTarget === "group" && selectedGroupId) {
        targetListCollectionPath = `groups/${selectedGroupId}/${listType}`;
      } else {
        console.error("Invalid copy target or no group selected");
        return;
      }

      // Yeni liste oluşturma
      const newListRef = await addDoc(
        collection(db, targetListCollectionPath),
        {
          listName: `${list.listName} (Copy)`,
          timestamp: new Date().toISOString(),
          createdBy: user.uid,
        }
      );

      // Orijinal liste todo'larını alma
      const originalTodosPath =
        type === "group"
          ? `groups/${groupId}/${listType}/${list.id}/todos`
          : `users/${user.uid}/${listType}/${list.id}/todos`;
      const originalTodosRef = collection(db, originalTodosPath);
      const todosSnapshot = await getDocs(originalTodosRef);

      // Yeni todo koleksiyonu yolu
      const newTodosCollectionPath = `${targetListCollectionPath}/${newListRef.id}/todos`;

      // Her todo'yu kopyalama
      const copyPromises = todosSnapshot.docs.map(async (todoDoc) => {
        const todoData = todoDoc.data();
        await addDoc(collection(db, newTodosCollectionPath), {
          ...todoData,
          timestamp: new Date().toISOString(),
        });
      });

      await Promise.all(copyPromises);

      // İşlem tamamlandı
      setIsCopying(false);
      setCopyTarget("personal");
      //alert(`List "${list.listName}" copied successfully!`);
    } catch (error) {
      console.error("Error copying list and its todos:", error);
      setIsCopying(false);
      setIsProcessModalOpen(false);
    }
  };

  // Hook to fetch todo counts
  const useTodoCount = () => {
    const [counts, setCounts] = useState({
      total: 0,
      completed: 0,
      notCompleted: 0,
    });

    useEffect(() => {
      if (!user || !list.id) return;

      const collectionPath =
        type === "group"
          ? `groups/${groupId}/${listType}/${list.id}/todos`
          : `users/${user.uid}/lists/${list.id}/todos`;

      const todosRef = collection(db, collectionPath);

      const unsubscribe = onSnapshot(todosRef, (snapshot) => {
        const todosData = snapshot.docs.map((doc) => ({ ...doc.data() }));
        const total = todosData.length;
        const completed = todosData.filter((todo) => todo.completed).length;
        const notCompleted = total - completed;
        setCounts({ total, completed, notCompleted });
      });

      return () => unsubscribe();
    }, [user, list.id, type, groupId]);

    return counts;
  };

  const {
    total: totalTodos,
    completed: completedTodos,
    notCompleted: notCompletedTodos,
  } = useTodoCount();

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(list.listName);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const CopyOptionsModal = () => {
    if (!isCopyModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">
            Copy List: {list.listName}
          </h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Select where to copy this list:
            </p>
            <div className="flex space-x-4 mb-4">
              <button
                className={`flex items-center px-3 py-2 rounded ${
                  copyTarget === "personal"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setCopyTarget("personal")}
              >
                <User className="w-4 h-4 mr-2" />
                Personal List
              </button>
              <button
                className={`flex items-center px-3 py-2 rounded ${
                  copyTarget === "group"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setCopyTarget("group")}
                disabled={groups.length === 0}
              >
                <Users className="w-4 h-4 mr-2" />
                Group List
              </button>
            </div>
            {copyTarget === "group" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Group:
                </label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
                {groups.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    You are not a member of any groups.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setIsCopyModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleCopyList}
              disabled={
                copyTarget === "group" &&
                (groups.length === 0 || !selectedGroupId)
              }
            >
              Copy List
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ListConfirmationDialog />
      <CopyOptionsModal 
        // isOpen={isCopyModalOpen}
        // onClose={() => setIsCopyModalOpen(false)}
        // list={list}
        // groups={groups}
        // onCopy={handleCopyList} 
      />
      <MobileTodoListCard
        list={list}
        totalTodos={totalTodos}
        completedTodos={completedTodos}
        openEditListModal={openEditListModal}
        handleDeleteList={handleDeleteList}
        openCopyModal={openCopyModal}
        handleSpeak={handleSpeak}
        setIsTodoListModalOpen={setIsTodoListModalOpen}
      />

      <EditListModal
        isOpen={isEditListModalOpen}
        onClose={() => {
          setIsEditListModalOpen(false);
          setCurrentEditList(null);
        }}
        list={currentEditList}
        onSave={handleEditList}
        db={db}
        activeTab={type}
        user={user}
        selectedGroupId={groupId}
      />

      <TodoListModal
        isOpen={isTodoListModalOpen}
        onClose={() => setIsTodoListModalOpen(false)}
        list={list}
        user={user}
        db={db}
        type={type}
        groupId={groupId}
        listType={listType}
        todoCounts={{ totalTodos, completedTodos, notCompletedTodos }}
      />

      {/* İşlem Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        contentLabel="Kopyalama İşlemi"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "300px",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        {isCopying && (
          <>
            <h3 className="text-lg font-medium mb-4">Liste Kopyalanıyor</h3>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <CircularProgress />
            </Box>
            <p className="text-gray-600">
              Lütfen bekleyin, liste ve içeriği kopyalanıyor...
            </p>
          </>
        )}
        {!isCopying && (
          <>
            <p className="text-gray-600 mt-2 mb-2">Kopyalama işlemi tamamlandı.</p>
            <Button
              onClick={() => setIsProcessModalOpen(false)}
              variant="outlined"
            >
              Kapat
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}

export default ExpandableListAll;
