import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const useFetchGroupListsAdvanced = (db, selectedGroupId) => {
   const [groupListsAdvanced, setGroupListsAdvanced] = useState([]);
   const [loadingGroupListAdvanced, setLoadingGroupListAdvanced] = useState(true);

   useEffect(() => {
     if (!selectedGroupId) {
       setLoadingGroupListAdvanced(false);
       return;
     }

     // Create a query reference to the listsAdvanced subcollection
     const listsQuery = query(
       collection(db, "groups", selectedGroupId, "listsAdvanced"),
       orderBy("timestamp", "desc") // Order by timestamp descending
     );

     // Set up real-time listener
     const unsubscribe = onSnapshot(
       listsQuery,
       (snapshot) => {
         const listData = snapshot.docs.map((doc) => ({
           id: doc.id,
           ...doc.data(),
         }));

         setGroupListsAdvanced(listData);
         setLoadingGroupListAdvanced(false);
       },
       (error) => {
         console.error("Advanced lists could not be retrieved:", error);
         setGroupListsAdvanced([]);
         setLoadingGroupListAdvanced(false);
       }
     );

     // Cleanup subscription
     return () => unsubscribe();
   }, [db, selectedGroupId]);

   // Return the data and loading state
   return { groupListsAdvanced, loadingGroupListAdvanced };
};

export default useFetchGroupListsAdvanced;