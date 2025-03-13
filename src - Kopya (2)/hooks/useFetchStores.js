import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";

const useFetchStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "stores"));
        const storeList = querySnapshot.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().name,
        }));

        setStores(storeList);
      } catch (error) {
        console.error("Mağazalar alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading };
};

export default useFetchStores;
