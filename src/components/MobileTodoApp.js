import React from 'react';
import { 
  Bell, Menu, UserRoundPen, Settings, Ruler, Store, LogOut, 
  Users, User, Archive, CirclePlus, List, ListTodo
} from 'lucide-react';

const MobileTodoApp = () => {
  const [activeTab, setActiveTab] = React.useState("personal");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      {/* App Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Yapılacaklar Listesi</h1>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown Menu - Shown when menu button is clicked */}
      {isMenuOpen && (
        <div className="absolute right-4 mt-1 bg-white border rounded-md shadow-lg z-50 w-48">
          <div className="py-1">
            <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
              <Bell className="w-4 h-4 mr-2" />
              Bildirimleri Aç
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
              <UserRoundPen className="w-4 h-4 mr-2" />
              Profil Bilgileri
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
              <Settings className="w-4 h-4 mr-2" />
              Grup Ayarları
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
              <UserRoundPen className="w-4 h-4 mr-2" />
              Kategoriler
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
              <Ruler className="w-4 h-4 mr-2" />
              Birimler
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
              <Store className="w-4 h-4 mr-2" />
              Mağazalar
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
              <Bell className="w-4 h-4 mr-2" />
              Yedekle
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="grid grid-cols-3 w-full">
          <button 
            className={`flex items-center justify-center py-3 text-sm font-medium ${
              activeTab === "personal" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            <User className="w-4 h-4 mr-1" />
            Kişisel
          </button>
          
          <button 
            className={`flex items-center justify-center py-3 text-sm font-medium ${
              activeTab === "group" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("group")}
          >
            <Users className="w-4 h-4 mr-1" />
            Grup
          </button>
          
          <button 
            className={`flex items-center justify-center py-3 text-sm font-medium ${
              activeTab === "archive" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("archive")}
          >
            <Archive className="w-4 h-4 mr-1" />
            Arşiv
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "personal" && (
          <div>
            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <CirclePlus className="w-6 h-6" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <List className="w-6 h-6" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <ListTodo className="w-6 h-6" />
              </button>
            </div>
            
            {/* Todo Items (Example) */}
            <div className="space-y-2">
              <div className="p-3 bg-white border rounded-md shadow-sm">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Alışveriş yap</span>
                </div>
              </div>
              
              <div className="p-3 bg-white border rounded-md shadow-sm">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Faturaları öde</span>
                </div>
              </div>
              
              <div className="p-3 bg-white border rounded-md shadow-sm">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Spor yap</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "group" && (
          <div>
            {/* Group Selector */}
            <select className="w-full p-2 mb-4 text-sm border rounded-md">
              <option>Aile</option>
              <option>İş</option>
              <option>Arkadaşlar</option>
            </select>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <CirclePlus className="w-6 h-6" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <List className="w-6 h-6" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <ListTodo className="w-6 h-6" />
              </button>
            </div>
            
            {/* Todo Items (Example) */}
            <div className="space-y-2">
              <div className="p-3 bg-white border rounded-md shadow-sm">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Market alışverişi</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">Ayşe tarafından eklendi</div>
              </div>
              
              <div className="p-3 bg-white border rounded-md shadow-sm">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Temizlik malzemeleri al</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">Mehmet tarafından eklendi</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "archive" && (
          <div>
            {/* Group Selector */}
            <select className="w-full p-2 mb-4 text-sm border rounded-md">
              <option>Aile</option>
              <option>İş</option>
              <option>Arkadaşlar</option>
            </select>
            
            {/* Date Selector */}
            <div className="flex items-center gap-2 mb-4">
              <input type="month" className="flex-1 p-2 text-sm border rounded-md" />
              <button className="p-2 bg-white border rounded-md">📝</button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <CirclePlus className="w-6 h-6" />
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-2 mb-4">
              <input 
                type="text" 
                placeholder="Arşivde ara..." 
                className="w-full p-2 text-sm border rounded-md"
              />
              <select className="w-full p-2 text-sm border rounded-md">
                <option>Tüm Kategoriler</option>
                <option>Gıda</option>
                <option>Temizlik</option>
                <option>Elektronik</option>
              </select>
            </div>
            
            {/* Archived Items (Example) */}
            <div className="space-y-2">
              <div className="p-3 bg-white border rounded-md shadow-sm">
                <div className="flex justify-between">
                  <span>1kg Elma</span>
                  <span className="text-sm">12.99₺</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">10 Mart 2025</div>
              </div>
              
              <div className="p-3 bg-white border rounded-md shadow-sm">
                <div className="flex justify-between">
                  <span>Bulaşık Deterjanı</span>
                  <span className="text-sm">45.50₺</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">8 Mart 2025</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Action Button (Fixed) */}
      <div className="fixed bottom-4 right-4">
        <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <CirclePlus className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default MobileTodoApp;