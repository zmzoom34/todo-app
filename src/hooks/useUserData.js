import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

const useUserData = (user) => {
  const [todos, setTodos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    // Set initial states when there's no user
    if (!user) {
      setTodos([]);
      setGroups([]);
      setSelectedGroupId(null);
      setLoading(false);
      return;
    }

    // Only proceed with queries if we have a valid user
    try {
      const todoQuery = query(
        collection(db, "todos"),
        where("userId", "==", user.uid),
        where("type", "==", "personal"),
        orderBy("createdAt", "desc")
      );

      const unsubscribeTodos = onSnapshot(
        todoQuery,
        (snapshot) => {
          const todosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodos(todosData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching personal todos:", error);
          setTodos([]);
          setLoading(false);
        }
      );

      const groupQuery = query(
        collection(db, "groups"),
        where("members", "array-contains", user.uid)
      );

      const unsubscribeGroups = onSnapshot(
        groupQuery,
        (snapshot) => {
          const groupsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setGroups(groupsData);

          if (groupsData.length > 0 && !selectedGroupId) {
            setSelectedGroupId(groupsData[0].id);
          }
        },
        (error) => {
          console.error("Error fetching groups:", error);
          setGroups([]);
        }
      );

      // Cleanup function
      return () => {
        unsubscribeTodos();
        unsubscribeGroups();
      };
    } catch (error) {
      console.error("Error in useUserData hook:", error);
      setTodos([]);
      setGroups([]);
      setLoading(false);
    }
  }, [user, selectedGroupId]);

  return {
    todos,
    groups,
    loading,
    selectedGroupId,
    setSelectedGroupId
  };
};

export default useUserData;