import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config"; // Firebase yapılandırma dosyası

const useFetchUserData = (user) => {
    const [nickName, setNickName] = useState(null);
    const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/");

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().nickName) {
        setNickName(userSnap.data().nickName);
      }
    };

    fetchUserData();
  }, [navigate, user]);
  
    return [ nickName, setNickName ];
  };
  
  export default useFetchUserData;