import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export const useGroupTodos = (db, {
  user,
  selectedGroupId,
  activeTab
}) => {
  const [groupTodos, setGroupTodos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Early return if required conditions aren't met
    if (!user || !selectedGroupId || activeTab !== "group") {
      return;
    }

    // Create query for group todos
    const groupTodoQuery = query(
      collection(db, "todos"),
      where("groupId", "==", selectedGroupId),
      where("type", "==", "group"),
      where("statue", "==", "active"),
      orderBy("completed", "asc"), // Add this line
      orderBy("createdAt", "desc")
    );

    // Subscribe to group todos
    const unsubscribeGroupTodos = onSnapshot(
      groupTodoQuery,
      (snapshot) => {
        const groupTodosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroupTodos(groupTodosData);
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
    groupTodos,
    error
  };
};