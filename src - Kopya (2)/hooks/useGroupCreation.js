import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';

export const useGroupCreation = (db, user, showToastMessage) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createGroup = async () => {
    // Return early if group name is empty
    if (!newGroupName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create new group document
      await addDoc(collection(db, "groups"), {
        groupName: newGroupName,
        createdBy: user.uid,
        members: [user.uid],
        createdAt: new Date().toISOString(),
      });

      // Reset form and show success message
      setNewGroupName("");
      console.log("Grup başarıyla oluşturuldu");
      
      // Optional: Show success toast
      if (showToastMessage) {
        showToastMessage("Grup başarıyla oluşturuldu", "success");
      }
    } catch (error) {
      console.error("Grup oluşturma hatası:", error);
      setError(error);
      
      // Show error toast if toast function is provided
      if (showToastMessage) {
        showToastMessage("Grup oluşturulurken bir hata oluştu.", "warning");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    newGroupName,
    setNewGroupName,
    createGroup,
    isLoading,
    error
  };
};