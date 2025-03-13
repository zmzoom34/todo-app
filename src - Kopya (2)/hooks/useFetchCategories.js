import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const useFetchCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Kullanıcı durumunu konsola yazdırarak kontrol edebilirsiniz
      console.log("Current user:", user);

      if (!user) {
        setError("Kategorileri görmek için giriş yapmalısınız.");
        setLoading(false);
        return;
      }

      const fetchCategories = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "categories"));
          const categoryList = querySnapshot.docs.map((doc) => ({
            value: doc.id,
            label: doc.data().name,
          }));
          console.log("Fetched categories:", categoryList);
          setCategories(categoryList);
        } catch (error) {
          console.error("Kategoriler alınırken hata oluştu:", error);
          setError("Kategoriler yüklenemedi: " + error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    });

    // Cleanup: Aboneliği kaldır
    return () => unsubscribe();
  }, []);

  return { categories, loading, error };
};

export default useFetchCategories;