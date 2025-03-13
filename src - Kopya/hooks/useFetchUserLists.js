import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const useFetchUserLists = (db, user) => {
   const [userLists, setUserLists] = useState([]);
   const [loadingUserList, setLoadingUserList] = useState(true);

   useEffect(() => {
     if (!user) {
       setLoadingUserList(false);
       return;
     }

     // Create a query reference to the lists subcollection
     const listsQuery = query(
       collection(db, "users", user.uid, "lists"),
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

         console.log("Fetched lists:", listData);
         setUserLists(listData);
         setLoadingUserList(false);
       },
       (error) => {
         console.error("Lists could not be retrieved:", error);
         setUserLists([]);
         setLoadingUserList(false);
       }
     );

     // Cleanup subscription
     return () => unsubscribe();
   }, [db, user]);

   return { userLists, loadingUserList };
};

export default useFetchUserLists;