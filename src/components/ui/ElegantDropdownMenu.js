import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  UserRoundPen, 
  Settings, 
  Ruler, 
  Store, 
  LogOut,
  ChevronDown,
  Save
} from 'lucide-react';
import { signOut } from 'firebase/auth';

const ElegantDropdownMenu = ({ auth, setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [isModalCategoriesOpen, setIsModalCategoriesOpen] = useState(false);
  const [isModalUnitsOpen, setIsModalUnitsOpen] = useState(false);
  const [isModalStoresOpen, setIsModalStoresOpen] = useState(false);
  
  // Check for existing notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.dropdown-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
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
  
  const backupCollectionToJson = (collectionName) => {
    // This would contain your backup logic
    console.log(`Backing up collection: ${collectionName}`);
    // Example implementation placeholder:
    // const data = await fetchCollectionData(collectionName);
    // const jsonString = JSON.stringify(data);
    // downloadAsFile(jsonString, `${collectionName}_backup.json`);
  };
  
  const menuItems = [
    {
      icon: <Bell className="w-4 h-4" />,
      text: notificationPermission === "granted" ? "Bildirimler Açık" : "Bildirimleri Aç",
      onClick: requestNotificationPermission
    },
    {
      icon: <UserRoundPen className="w-4 h-4" />,
      text: "Profil Bilgileri",
      onClick: () => setIsProfileModalOpen(true)
    },
    {
      icon: <Settings className="w-4 h-4" />,
      text: "Grup Ayarları",
      onClick: () => setShowGroupSettings(!showGroupSettings)
    },
    {
      icon: <UserRoundPen className="w-4 h-4" />,
      text: "Kategoriler",
      onClick: () => setIsModalCategoriesOpen(true)
    },
    {
      icon: <Ruler className="w-4 h-4" />,
      text: "Birimler",
      onClick: () => setIsModalUnitsOpen(true)
    },
    {
      icon: <Store className="w-4 h-4" />,
      text: "Mağazalar",
      onClick: () => setIsModalStoresOpen(true)
    },
    {
      icon: <Save className="w-4 h-4" />,
      text: "Verileri Yedekle",
      onClick: () => backupCollectionToJson("todos")
    },
    {
      icon: <LogOut className="w-4 h-4" />,
      text: "Çıkış Yap",
      onClick: handleSignOut,
      danger: true
    }
  ];

  return (
    <div className="relative dropdown-container">
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center p-2 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="mr-2 font-medium">Menü</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`${
                  item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                } group flex w-full items-center px-4 py-3 text-sm transition-colors duration-150`}
              >
                <div className={`${
                  item.danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                } p-2 rounded-full mr-3`}>
                  {item.icon}
                </div>
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Modal components would be imported and rendered here */}
      {/* Example:
      {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
      {isModalCategoriesOpen && <CategoriesModal onClose={() => setIsModalCategoriesOpen(false)} />}
      {isModalUnitsOpen && <UnitsModal onClose={() => setIsModalUnitsOpen(false)} />}
      {isModalStoresOpen && <StoresModal onClose={() => setIsModalStoresOpen(false)} />}
      */}
    </div>
  );
};

export default ElegantDropdownMenu;