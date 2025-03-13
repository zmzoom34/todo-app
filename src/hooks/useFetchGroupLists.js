import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const useFetchGroupLists = (db, selectedGroupId) => {
   const [groupLists, setGroupLists] = useState([]);
   const [loadingGroupList, setLoadingGroupList] = useState(true);

   useEffect(() => {
     if (!selectedGroupId) {
       setLoadingGroupList(false);
       return;
     }

     // Create a query reference to the lists subcollection
     const listsQuery = query(
       collection(db, "groups", selectedGroupId, "lists"),
       orderBy("timestamp", "desc") // Optional: order by timestamp
     );

     // Set up real-time listener
     const unsubscribe = onSnapshot(
       listsQuery,
       (snapshot) => {
         const listData = snapshot.docs.map((doc) => ({
           id: doc.id,
           ...doc.data(),
         }));

         setGroupLists(listData);
         setLoadingGroupList(false);
       },
       (error) => {
         console.error("Lists could not be retrieved:", error);
         setGroupLists([]);
         setLoadingGroupList(false);
       }
     );

     // Cleanup subscription
     return () => unsubscribe();
   }, [db, selectedGroupId]);

   return { groupLists, loadingGroupList };
};

export default useFetchGroupLists;