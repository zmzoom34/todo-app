import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

export const useGroups = (user) => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!user) return;

    const groupQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(groupQuery, (snapshot) => {
      const groupsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsData);
    });

    return unsubscribe;
  }, [user]);

  return groups;
};