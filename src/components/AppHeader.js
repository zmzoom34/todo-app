import React, { useState } from "react";
import {
  Menu,
  Bell,
  UserRoundPen,
  Settings,
  Ruler,
  Store,
  LogOut,
  X,
  FileJson,
  Sheet,
  FileSpreadsheet,
} from "lucide-react";
import { signOut } from "firebase/auth";
import BackupCollectionToJson from "./ui/BackupCollectionToJson";
import ListsWithReports from "./ui/ListsWithReport";

const AppHeader = ({
  db,
  user,
  auth,
  setUser,
  notificationPermission,
  requestNotificationPermission,
  setIsProfileModalOpen,
  setShowGroupSettings,
  setIsModalCategoriesOpen,
  setIsModalUnitsOpen,
  setIsModalStoresOpen,
  groupLists,
  selectedGroupId,
  activeTab,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Todo App</h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Menü</h2>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col p-2">
          {/* <button
            onClick={() => {
              requestNotificationPermission();
              toggleSidebar();
            }}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <Bell className="w-4 h-4 mr-3" />
            {notificationPermission === "granted"
              ? "Bildirimler Açık"
              : "Bildirimleri Aç"}
          </button> */}

          <button
            onClick={() => {
              setIsProfileModalOpen(true);
              toggleSidebar();
            }}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <UserRoundPen className="w-4 h-4 mr-3" />
            Profil Bilgileri
          </button>

          <button
            onClick={() => {
              setShowGroupSettings((prev) => !prev);
              toggleSidebar();
            }}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <Settings className="w-4 h-4 mr-3" />
            Grup Ayarları
          </button>

          <button
            onClick={() => {
              setIsModalCategoriesOpen(true);
              toggleSidebar();
            }}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <UserRoundPen className="w-4 h-4 mr-3" />
            Kategoriler
          </button>

          <button
            onClick={() => {
              setIsModalUnitsOpen(true);
              toggleSidebar();
            }}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <Ruler className="w-4 h-4 mr-3" />
            Birimler
          </button>

          <button
            onClick={() => {
              setIsModalStoresOpen(true);
              toggleSidebar();
            }}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <Store className="w-4 h-4 mr-3" />
            Mağazalar
          </button>

          <button className="flex flex-row items-center p-3 rounded-md hover:bg-gray-100 w-full text-left">
            <FileJson className="w-4 h-4 mr-3" />
            <BackupCollectionToJson collectionName={"todos"} />
          </button>

          <button className="flex flex-row items-center p-3 rounded-md hover:bg-gray-100 w-full text-left">
            <FileSpreadsheet className="w-4 h-4 mr-3" />
            <ListsWithReports
              lists={groupLists}
              user={user}
              db={db}
              type={activeTab === "personal" ? "personal" : "group"}
              groupId={selectedGroupId}
              toggleSidebar={toggleSidebar}
            />
          </button>

          <button
            onClick={() => {
              handleSignOut();
              toggleSidebar();
            }}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
