import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const AuthComponent = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onAuthSuccess(user);
      }
    });
    return () => unsubscribe();
  }, [auth, onAuthSuccess]);

  const saveUserData = async (user, isNewUser) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      const userData = {
        email: user.email,
        lastLogin: new Date().toISOString(),
        createdAt: isNewUser ? new Date().toISOString() : user.metadata.creationTime,
      };
      if (isNewUser) {
        userData.role = "user";
      }
      await setDoc(userRef, userData, { merge: true });
  
      // Only redirect to profile if nickName is missing AFTER saving data
      if (!userSnap.exists() || !userSnap.data().nickName) {
        navigate("/profile");
      }
    } catch (err) {
      console.error("Error saving user data:", err);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccessMessage('');
    if (!email) {
      setError("Lütfen şifrenizi sıfırlamak için e-posta adresinizi girin.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    } catch (err) {
      setError("Şifre sıfırlama başarısız oldu. Lütfen geçerli bir e-posta adresi girin.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      let result;
      let isNewUser = false;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
        isNewUser = true;
        setSuccessMessage("Kayıt başarılı! Hoş geldiniz.");
      }

      await saveUserData(result.user, isNewUser);
      onAuthSuccess(result.user);
    } catch (err) {
      const errorMessages = {
        "auth/invalid-email": "Geçersiz e-posta adresi.",
        "auth/user-disabled": "Bu hesap devre dışı bırakılmıştır.",
        "auth/user-not-found": "Kullanıcı bulunamadı.",
        "auth/wrong-password": "Şifre hatalı.",
        "auth/email-already-in-use": "Bu e-posta adresi zaten kullanımda.",
        "auth/weak-password": "Şifre en az 6 karakter olmalıdır."
      };
      setError(errorMessages[err.code] || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-green-500 text-sm">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
            </Button>

            {isLogin && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Şifrenizi mi unuttunuz?
                </button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthComponent;
