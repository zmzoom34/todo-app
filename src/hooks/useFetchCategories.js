import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const useFetchCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Kategorileri görmek için giriş yapmalısınız.");
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoryList = querySnapshot.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().name,
        }));

        setCategories(categoryList);
      } catch (error) {
        console.error("Kategoriler alınırken hata oluştu:", error);
        setError("Kategoriler yüklenemedi: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export default useFetchCategories;