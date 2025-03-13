// components/ExpandableListAll.js
import React, { useState } from "react";
import { useConfirm } from "../../hooks/useConfirm";
import { doc, collection, getDocs, deleteDoc } from "firebase/firestore";
import EditListModal from "./EditListModal";
import TodoListModal from "./TodoListModal";

function ExpandableListAll({ list, onEdit, onDelete, user, db, type = "user", groupId = null, listType }) {
  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [isTodoListModalOpen, setIsTodoListModalOpen] = useState(false);
  const [ListConfirmationDialog, confirmDeleteList] = useConfirm(
    "Are you sure?",
    `Are you sure you want to delete the list "${list.listName}"?`
  );

  const handleDeleteList = async () => {
    const confirmed = await confirmDeleteList();
    if (confirmed) {
      const listDocRef = doc(db, type === "group" ? `groups/${groupId}/` : `users/${user.uid}/`, listType, list.id);
      const todosRef = collection(db, `${listDocRef.path}/todos`);
      const todosSnapshot = await getDocs(todosRef);
      const deleteTodoPromises = todosSnapshot.docs.map((todoDoc) => deleteDoc(todoDoc.ref));
      await Promise.all(deleteTodoPromises);
      await deleteDoc(listDocRef);
    }
  };

  return (
    <>
      <ListConfirmationDialog />
      <div className="border rounded-md mb-2 bg-stone-100">
        <div className="flex justify-between items-center p-3 cursor-pointer" onClick={() => setIsTodoListModalOpen(true)}>
          <span>{list.listName}</span>
          <div className="flex space-x-2">
            <button onClick={(e) => { e.stopPropagation(); setIsEditListModalOpen(true); }} className="text-blue-500">
              Edit
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteList(); }} className="text-red-500">
              Delete
            </button>
          </div>
        </div>
      </div>
      <EditListModal
        isOpen={isEditListModalOpen}
        onClose={() => setIsEditListModalOpen(false)}
        list={list}
        onSave={onEdit}
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
      />
    </>
  );
}

export default ExpandableListAll;