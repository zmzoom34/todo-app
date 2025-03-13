import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";

const useTodos = (user) => {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.uid) {
      setError("Kullanıcı giriş yapmamış.");
      return;
    }

    try {
      const todoCollection = collection(db, "todos");

      const unsubscribe = onSnapshot(
        todoCollection,
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

      return () => unsubscribe();
    } catch (err) {
      console.error("Unexpected error fetching todos:", err);
      setError(err);
    }
  }, [user]);

  return { todos, error };
};

export default useTodos;
