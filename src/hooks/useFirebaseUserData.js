import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { auth } from "../firebase-config"; // Firebase config file

export const useFirebaseUserData = (db) => {
    const [nickName, setNickName] = useState(null);
    const [defaultGroupId, setDefaultGroupId] = useState(null);
    const [todos, setTodos] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const user = auth.currentUser
  
    useEffect(() => {
      const fetchUserDataAndSubscriptions = async () => {
        if (!user) {
          setLoading(false);
          return navigate("/");
        }
  
        setLoading(true);
  
        // Kullanıcı verilerini al
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.nickName) setNickName(userData.nickName);
          if (userData.defaultGroup) setDefaultGroupId(userData.defaultGroup);
        }
  
        let todosLoaded = false;
        let groupsLoaded = false;
  
        // Kişisel todos sorgusu
        const todoQuery = query(
          collection(db, "todos"),
          where("userId", "==", user.uid),
          where("type", "==", "personal"),
          where("statue", "==", "active"),
          orderBy("completed", "asc"),
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
            todosLoaded = true;
            if (todosLoaded && groupsLoaded) setLoading(false); // Her ikisi de yüklendiğinde loading false olur
          },
          (error) => {
            console.error("Error fetching personal todos:", error);
            todosLoaded = true;
            if (todosLoaded && groupsLoaded) setLoading(false);
          }
        );
  
        // Gruplar sorgusu
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
  
            // Varsayılan grup mantığını burada güncelle
            if (defaultGroupId) {
              //const defaultGroupExists = defaultGroupId;
              setSelectedGroupId(defaultGroupId);
            }

            if (groupsData.length > 0 && !defaultGroupId) {
              setSelectedGroupId(groupsData[0].id);
            }
  
            groupsLoaded = true;
            if (todosLoaded && groupsLoaded) setLoading(false); // Her ikisi de yüklendiğinde loading false olur
          },
          (error) => {
            console.error("Error fetching groups:", error);
            groupsLoaded = true;
            if (todosLoaded && groupsLoaded) setLoading(false);
          }
        );
  
        return () => {
          unsubscribeTodos();
          unsubscribeGroups();
        };
      };
  
      fetchUserDataAndSubscriptions();
    }, [db, navigate, user]);
  
    return {
      nickName,
      setNickName,
      defaultGroupId,
      setDefaultGroupId,
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