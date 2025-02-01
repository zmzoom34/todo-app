import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export const useArchivedTodos = (db, {
  user,
  selectedGroupId,
  activeTab
}) => {
  const [archivedTodos, setArchivedTodos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Early return if required conditions aren't met
    if (!user || !selectedGroupId || activeTab !== "archive") {
      return;
    }

    // Create query for archived group todos
    const groupTodoQuery = query(
      collection(db, "todos"),
      where("groupId", "==", selectedGroupId),
      where("type", "==", "group"),
      where("statue", "==", "archive"),
      orderBy("createdAt", "desc")
    );

    // Subscribe to archived todos
    const unsubscribeGroupTodos = onSnapshot(
      groupTodoQuery,
      (snapshot) => {
        const archivedTodosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArchivedTodos(archivedTodosData);
        setError(null);
      },
      (error) => {
        console.error("Error fetching group todos:", error);
        setError(error);
      }
    );

    // Cleanup subscription
    return () => unsubscribeGroupTodos();
  }, [selectedGroupId, user, activeTab, db]);

  return {
    archivedTodos,
    setArchivedTodos,
    error
  };
};