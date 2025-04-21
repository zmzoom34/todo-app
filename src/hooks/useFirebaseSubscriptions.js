import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export const useFirebaseSubscriptions = (db, user, defaultGroupId) => {
  const [todos, setTodos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query for personal todos
    const todoQuery = query(
      collection(db, "todos"),
      where("userId", "==", user.uid),
      where("type", "==", "personal"),
      where("statue", "==", "active"),
      orderBy("completed", "asc"),
      orderBy("createdAt", "desc")
    );

    // Subscribe to todos
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
        setLoading(false);
      }
    );

    // Query for groups
    const groupQuery = query(
      collection(db, "groups"),
      where("members", "array-contains", user.uid)
    );

    // Subscribe to groups
    const unsubscribeGroups = onSnapshot(
      groupQuery,
      (snapshot) => {
        const groupsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupsData);

        // İlk yüklemede varsayılan grubu seç, ama sadece selectedGroupId yoksa
        if (groupsData.length > 0 && !selectedGroupId) {
          const defaultGroupExists = defaultGroupId && groupsData.some((group) => group.id === defaultGroupId);
          if (defaultGroupExists) {
            setSelectedGroupId(defaultGroupId); // Varsayılan grup varsa onu seç
          } else {
            setSelectedGroupId(groupsData[0].id); // Yoksa ilk grubu seç
          }
        }
      },
      (error) => {
        console.error("Error fetching groups:", error);
        setLoading(false);
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeTodos();
      unsubscribeGroups();
    };
  }, [user, db, defaultGroupId]); // selectedGroupId bağımlılığını kaldırdık

  return {
    todos,
    setTodos,
    groups,
    setGroups,
    selectedGroupId,
    setSelectedGroupId,
    loading,
    setLoading,
  };
};