import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { X } from "lucide-react";

const ProfileModal = ({ isOpen, onClose, nickName, user, setNickName }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError("");
    setLoading(true);

    try {
      const trimmedNickName = nickName.trim();
      if (!trimmedNickName) {
        throw new Error("Kullanıcı adı boş bırakılamaz");
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { nickName: trimmedNickName }, { merge: true });

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
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
                className="w-full"
                disabled={loading}
              />

              {error && (
                <div className="text-sm text-red-500 animate-pulse">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileModal;
