// hooks/useListTodos.js
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export const useListTodos = (user, list, collectionPath, type, groupId, db) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !list?.id) {
      console.error("Invalid user or list:", { user, list });
      setLoading(false);
      return;
    }

    const listTodosRef = collection(db, collectionPath);
    console.log("Fetching todos from:", collectionPath);

    const fetchTodos = async () => {
      const unsubscribe = onSnapshot(
        query(listTodosRef, orderBy("sortOrder", "asc")),
        (snapshot) => {
          const todosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodos(todosData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching list todos:", error);
          setLoading(false);
        }
      );

      return unsubscribe;
    };

    fetchTodos();
  }, [user, list?.id, collectionPath, type, groupId]);

  return { todos, loading };
};