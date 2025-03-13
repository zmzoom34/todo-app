import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase-config";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const ProfilePage = () => {
  const [nickName, setNickName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return navigate('/');

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().nickName) {
        //navigate('/');
        setNickName(userSnap.data().nickName)
      }
    };
    fetchUserData();
  }, [auth, db, navigate]);

  const handleNavigateMainPage = () => {
    navigate('/')
  }

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Kullanıcı bulunamadı");
      if (!nickName.trim()) throw new Error("Lütfen bir kullanıcı adı girin");
      
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { nickName }, { merge: true });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <button onClick={handleNavigateMainPage}>Ana Sayfa</button>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Profil Bilgilerini Güncelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Kullanıcı Adı"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              required
              className="w-full"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;