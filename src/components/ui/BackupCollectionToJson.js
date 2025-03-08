import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../firebase-config"

const BackupCollectionToJson = ({ collectionName }) => {
    const handleBackup = async () => {
      try {
        // collectionName boşsa hata fırlat
        if (!collectionName) {
          throw new Error('Koleksiyon adı belirtilmedi.');
        }
  
        // Firestore koleksiyonuna erişim
        const querySnapshot = await getDocs(collection(db, collectionName));
  
        // Verileri JSON formatına dönüştürme
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // JSON dosyasını oluşturma
        const jsonString = JSON.stringify(data, null, 2); // İkinci parametre, JSON'u daha okunabilir hale getirir
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
  
        // Dosyayı indirme
        const link = document.createElement('a');
        link.href = url;
        link.download = `${collectionName}_backup.json`;
        link.click();
  
        // URL'yi temizleme
        URL.revokeObjectURL(url);
  
        console.log(`${collectionName} koleksiyonu başarıyla yedeklendi.`);
      } catch (error) {
        console.error('Yedekleme sırasında bir hata oluştu:', error.message);
        alert(`Yedekleme hatası: ${error.message}`); // Kullanıcıya hata mesajı göster
      }
    };
  
    return (
      <div>
        <button onClick={handleBackup} disabled={!collectionName}>
          {collectionName ? `${collectionName} Koleksiyonunu JSON Olarak Yedekle` : 'Koleksiyon Adı Belirtilmedi'}
        </button>
      </div>
    );
  };
  
  export default BackupCollectionToJson;