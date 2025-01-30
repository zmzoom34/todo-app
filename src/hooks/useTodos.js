import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";

const useTodos = (user, filters, dateRange = null, completedStatus = null, orderField = "createdAt", orderDirection = "desc") => {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !filters) return;

    const fetchTodos = () => {
      try {
        let todoQuery = query(collection(db, "todos"));

        filters.forEach((filter) => {
          todoQuery = query(todoQuery, where(filter.field, filter.operator, filter.value));
        });

        if (dateRange) {
          todoQuery = query(todoQuery, where("createdAt", ">=", dateRange.start), where("createdAt", "<=", dateRange.end));
        }

        if (completedStatus !== null) {
          todoQuery = query(todoQuery, where("completed", "==", completedStatus));
        }

        if (orderField) {
          todoQuery = query(todoQuery, orderBy(orderField, orderDirection));
        }

        return onSnapshot(
          todoQuery,
          (snapshot) => {
            const todosData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTodos(todosData);
          },
          (error) => {
            console.error("Error fetching todos:", error);
            setError(error);
          }
        );
      } catch (err) {
        console.error("Unexpected error fetching todos:", err);
        setError(err);
      }
    };

    const unsubscribe = fetchTodos();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, filters, dateRange, completedStatus, orderField, orderDirection]);

  return { todos, error };
};

export default useTodos;
