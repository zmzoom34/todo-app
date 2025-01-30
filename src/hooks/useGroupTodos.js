import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";

const useGroupTodos = (user, selectedGroupId, activeTab) => {
  const [groupTodos, setGroupTodos] = useState([]);
  const [archivedTodos, setArchivedTodos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !selectedGroupId) return;

    const fetchTodos = (status, setter) => {
      try {
        const groupTodoQuery = query(
          collection(db, "todos"),
          where("groupId", "==", selectedGroupId),
          where("type", "==", "group"),
          where("statue", "==", status),
          orderBy("createdAt", "desc")
        );

        return onSnapshot(
          groupTodoQuery,
          (snapshot) => {
            const todosData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setter(todosData);
          },
          (error) => {
            console.error("Error fetching group todos:", error);
            setError(error);
          }
        );
      } catch (err) {
        console.error("Unexpected error fetching group todos:", err);
        setError(err);
      }
    };

    const unsubscribeActive = activeTab === "group" ? fetchTodos("active", setGroupTodos) : null;
    const unsubscribeArchived = activeTab === "archive" ? fetchTodos("archive", setArchivedTodos) : null;

    return () => {
      if (unsubscribeActive) unsubscribeActive();
      if (unsubscribeArchived) unsubscribeArchived();
    };
  }, [selectedGroupId, user, activeTab]);

  return { groupTodos, archivedTodos, error };
};

export default useGroupTodos;
