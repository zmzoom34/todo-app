import React, { useState } from "react";
import { DropdownMenu, DropdownMenuItem } from "./ui/DropdownMenu";
import {
  LogOut,
  Settings,
  Users,
  User,
  X,
  UserRoundPen,
  Archive,
  Menu
} from "lucide-react";
import { LuCirclePlus } from "react-icons/lu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import ConfirmationModal from "../components/ConfirmationModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import CategorySelect from "./ui/CatagorySelect";
import CategoryModal from "./CategoryModal";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase-config";
import AuthComponent from "../components/AuthComponent";
import TodoInput from "../components/TodoInput";
import TodoList from "../components/TodoList";
import GroupSettingsModal from "../components/GroupSettingsModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import ProfileModal from "./ProfileModal";
import useFetchUserData from "../hooks/useFetchUserData";
import { useFirebaseSubscriptions } from "../hooks/useFirebaseSubscriptions";
import { useModalFocus } from "../hooks/useModalFocus";
import { useGroupTodos } from "../hooks/useGroupTodos";
import { useArchivedTodos } from "../hooks/useArchivedTodos";
import { useGroupCreation } from "../hooks/useGroupCreation";
import { useToast } from "../hooks/useToast";
import { useTodoOperations } from "../hooks/useTodoOperations";
//import { useTodoForm } from "../hooks/useTodoForm";

const TodoApp = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoCategory, setNewTodoCategory] = useState("");
  const [newTodoAmount, setNewTodoAmount] = useState("");
  const [newTodoUnit, setNewTodoUnit] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [activeTab, setActiveTab] = useState("group");
  const [groupIdToJoin, setGroupIdToJoin] = useState("");
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showCategoriesSettings, setCategoriesGroupSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isModalOpenArchive, setIsModalOpenArchive] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [selectedTodoArchive, setSelectedTodoArchive] = useState(null);
  const [isModalAddTodoOpen, setIsModalAddTodoOpen] = useState(false);
  const [isModalCategoriesOpen, setIsModalCategoriesOpen] = useState(false);
  const inputAddTodoRef = useModalFocus(isModalAddTodoOpen);
  const [nickName, setNickName] = useFetchUserData(user);
  //const [nickName, setNickName] = useState(null);
  const { todos, groups, selectedGroupId, setSelectedGroupId, loading } =
    useFirebaseSubscriptions(db, user);
  const { groupTodos } = useGroupTodos(db, {
    user,
    selectedGroupId,
    activeTab,
  });
  const { archivedTodos } = useArchivedTodos(db, {
    user,
    selectedGroupId,
    activeTab,
  });
  const { showToastMessage } = useToast();
  const { newGroupName, setNewGroupName, createGroup } = useGroupCreation(
    db,
    user,
    showToastMessage
  );

  const { deleteTodo, toggleComplete, archiveTodo } = useTodoOperations(
    db,
    showToastMessage
  );

  //const { addTodo } = useTodoForm(db, user, showToastMessage, newTodo, setNewTodo, nickName, selectedGroupId)
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const user = auth.currentUser;
  //     if (!user) return navigate("/");

  //     const userRef = doc(db, "users", user.uid);
  //     const userSnap = await getDoc(userRef);
  //     if (userSnap.exists() && userSnap.data().nickName) {
  //       setNickName(userSnap.data().nickName);
  //     }
  //   };

  //   fetchUserData();
  // }, [navigate, user]);

  const categories = [
    { id: "atistirmalikvetatlilar", name: "Atıştırmalık ve tatlılar" },
    { id: "baharatlarsoslar", name: "Baharatlar ve soslar" },
    { id: "bahcekendinyap", name: "Bahçe ve kendin yap" },
    { id: "balikdenizurunleri", name: "Balık ve deniz ürünleri" },
    { id: "bebek", name: "Bebek" },
    { id: "diger", name: "Diğer" },
    { id: "donukurunler", name: "Donuk ürünler" },
    { id: "elektronikofis", name: "Elektronik ve ofis" },
    { id: "etkumeshayvanlari", name: "Et ve kümes hayvanları" },
    { id: "evtemizligi", name: "Ev Temizliği" },
    { id: "evcilhayvanlar", name: "Evcil hayvanlar" },
    { id: "evdepisisirme", name: "Evde Pişirme" },
    { id: "firin", name: "Fırın" },
    { id: "giyim", name: "Giyim" },
    { id: "guzellikkisiselbakim", name: "Güzellik ve kişisel bakım" },
    { id: "haziryemekler", name: "Hazır yemekler" },
    { id: "icecekler", name: "İçecekler" },
    { id: "kahvaltilikgevrekmusli", name: "Kahvaltılık gevrek ve müsli" },
    { id: "kahvecay", name: "Kahve ve çay" },
    { id: "konservekavanoz", name: "Konserve ve kavanoz" },
    { id: "meyvesebzeler", name: "Meyve ve sebzeler" },
    { id: "saglik", name: "Sağlık" },
    { id: "sutyumurta", name: "Süt ve yumurta" },
    { id: "tahillarmakarna", name: "Tahıllar ve makarna" },
    { id: "yaglar", name: "Yağlar" },
  ];

  // Firestore'a kategorileri yükleme fonksiyonu
  async function uploadCategories() {
    try {
      for (const category of categories) {
        const categoryRef = doc(collection(db, "categories"), category.id);
        await setDoc(categoryRef, { name: category.name });
      }
      console.log("✅ Kategoriler başarıyla Firestore'a yüklendi!");
    } catch (error) {
      console.error("❌ Kategorileri yüklerken hata oluştu:", error);
    }
  }

  // uploadCategories()

  const joinGroup = async () => {
    if (!groupIdToJoin.trim()) return;

    try {
      const groupRef = doc(db, "groups", groupIdToJoin);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        //alert("Belirtilen ID ile bir grup bulunamadı.");
        showToastMessage("Belirtilen ID ile bir grup bulunamadı.", "warning");
        return;
      }

      const groupData = groupSnap.data();

      if (groupData.members.includes(user.uid)) {
        //alert("Bu gruba zaten üyesiniz.");
        showToastMessage("Bu gruba zaten üyesiniz.", "warning");
        return;
      }

      await updateDoc(groupRef, {
        members: [...groupData.members, user.uid],
      });

      setGroupIdToJoin("");
      setShowGroupSettings(false);
      setActiveTab("group");

      //alert("Gruba başarıyla katıldınız!");
      showToastMessage("Gruba başarıyla katıldınız :)", "success");
    } catch (error) {
      console.error("Grup katılma hatası:", error);
      //alert("Gruba katılırken bir hata oluştu. Lütfen grup ID'sini kontrol edin.");
      showToastMessage(
        "Gruba katılırken bir hata oluştu. Lütfen grup ID sini kontrol edin.",
        "warning"
      );
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const todoData = {
        text: newTodo,
        amount: newTodoAmount,
        unit: newTodoUnit,
        category: newTodoCategory,
        completed: false,
        statue: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.uid,
        type: activeTab === "personal" ? "personal" : "group",
        createdBy: nickName,
      };

      if (activeTab === "group") {
        if (!selectedGroupId) {
          alert("Lütfen bir grup seçin");
          return;
        }
        todoData.groupId = selectedGroupId;
      }

      await addDoc(collection(db, "todos"), todoData);
      setNewTodo("");
      showToastMessage("Görev başarıyla eklendi :)", "success");
    } catch (error) {
      console.error("Error adding todo:", error);
      //alert("Todo eklenirken bir hata oluştu.");
      showToastMessage("Todo eklenirken bir hata oluştu. :)", "warning");
    }
  };

  const saveEdit = async (todo) => {
    if (!editText.trim()) return;

    try {
      await updateDoc(doc(db, "todos", todo.id), {
        text: editText,
        updatedAt: new Date().toISOString(),
        updatedBy: nickName,
        amount: todo.amount,
        category: todo.category,
        unit: todo.unit,
      });
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating todo:", error);
      //alert("Todo güncellenirken bir hata oluştu.");
      showToastMessage("Todo güncellenirken bir hata oluştu: )", "warning");
    }
  };

  const handleDeleteClick = (todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleArchiveClick = (todo) => {
    setSelectedTodoArchive(todo);
    setIsModalOpenArchive(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedTodo) {
      await deleteTodo(selectedTodo);
    }
    setIsModalOpen(false);
    setSelectedTodo(null);
  };

  const handleConfirmArchive = async () => {
    if (selectedTodoArchive) {
      await archiveTodo(
        selectedTodoArchive,
        nickName,
        setIsModalOpenArchive(false)
      );
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo ? todo.id : null);
    setEditText(todo.text);
  };

  const leaveGroup = async (groupId) => {
    const confirmLeave = window.confirm(
      "Bu gruptan çıkmak istediğinize emin misiniz?"
    );
    if (!confirmLeave) return;

    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const updatedMembers = groupData.members.filter(
          (member) => member !== user.uid
        );

        await updateDoc(groupRef, { members: updatedMembers });
        //alert("Gruptan başarıyla çıkıldı.");
        showToastMessage("Gruptan başarıyla çıkıldı: )", "success");
      }
    } catch (error) {
      console.error("Grup üyeliğinden çıkılırken bir hata oluştu:", error);
      //alert("Gruptan çıkış işlemi sırasında bir hata oluştu.");
      showToastMessage(
        "Gruptan çıkış işlemi sırasında bir hata oluştu.",
        "warning"
      );
    }
  };

  const deleteGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      "Bu grubu silmek istediğinize emin misiniz?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "groups", groupId));
      //alert("Grup başarıyla silindi.");
      showToastMessage("Grup başarıyla silindi: )", "success");
    } catch (error) {
      console.error("Grup silinirken bir hata oluştu:", error);
      //alert("Grup silme işlemi sırasında bir hata oluştu.");
      //alert("Grup silme işlemi sırasında bir hata oluştu.");
      showToastMessage(
        "Grup silme işlemi sırasında bir hata oluştu.",
        "warning"
      );
    }
  };

  const renameGroup = async (groupId, newGroupName) => {
    if (!newGroupName.trim()) {
      alert("Grup adı boş olamaz.");
      return;
    }

    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        groupName: newGroupName,
        updatedAt: new Date().toISOString(),
      });
      //alert("Grup adı başarıyla güncellendi.");
      showToastMessage("Grup adı başarıyla güncellendi.", "success");
    } catch (error) {
      console.error("Grup adı güncellenirken bir hata oluştu:", error);
      //alert("Grup adı güncellenirken bir hata oluştu.");
      showToastMessage("Grup adı güncellenirken bir hata oluştu.", "warning");
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        //alert("Kopyalandı: " + text);
        const msg = "Kopyalandı: " + text;
        showToastMessage(msg, "success");
      })
      .catch(() => {
        showToastMessage("Kopyalama başarısız!!!", "warning");
      });
  };

  if (!user) {
    return <AuthComponent onAuthSuccess={setUser} />;
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center">Yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {/* <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">
          Yapılacaklar Listesi
        </CardTitle>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setIsProfileModalOpen(true)}>
            <UserRoundPen className="w-4 h-4 mr-2" />
            Profil Bilgileri
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowGroupSettings(!showGroupSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Grup Ayarları
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsModalCategoriesOpen(true)}
          >
            <UserRoundPen className="w-4 h-4 mr-2" />
            Kategoriler
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              signOut(auth)
                .then(() => {
                  setUser(null);
                })
                .catch((error) => {
                  console.error("Error signing out:", error);
                });
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </CardHeader> */}

<CardHeader className="flex flex-row items-center justify-between">
  <CardTitle className="text-2xl font-bold">Yapılacaklar Listesi</CardTitle>

  <DropdownMenu trigger={<Menu className="w-5 h-5" />}>
    <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
      <UserRoundPen className="w-4 h-4 mr-2" />
      Profil Bilgileri
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setShowGroupSettings(!showGroupSettings)}>
      <Settings className="w-4 h-4 mr-2" />
      Grup Ayarları
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setIsModalCategoriesOpen(true)}>
      <UserRoundPen className="w-4 h-4 mr-2" />
      Kategoriler
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={() => {
        signOut(auth)
          .then(() => {
            setUser(null);
          })
          .catch((error) => {
            console.error("Error signing out:", error);
          });
      }}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Çıkış Yap
    </DropdownMenuItem>
  </DropdownMenu>
</CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 border-b">
            <TabsTrigger
              value="group"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "group"
                  ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Users className="w-4 h-4" />
              Grup
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "personal"
                  ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <User className="w-4 h-4" />
              Kişisel
            </TabsTrigger>
            <TabsTrigger
              value="archive"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "archive"
                  ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Archive className="w-4 h-4" />
              Arşiv
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            {/* <form onSubmit={addTodo} className="flex gap-2 mb-6">
              <TodoInput
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onSubmit={addTodo}
                placeholder="Yeni kişisel görev ekle..."
              />
            </form> */}
            <div>
              {/* Modal Açma Butonu */}

              <LuCirclePlus
                onClick={() => setIsModalAddTodoOpen(true)}
                className="h-6 w-6 cursor-pointer"
              />

              {/* Modal */}
              {isModalAddTodoOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center"
                  onClick={() => setIsModalAddTodoOpen(false)}
                >
                  <div
                    className="bg-white p-6 rounded-lg w-full max-w-md mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Başlık ve Kapatma Butonu */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Yeni Görev Ekle</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsModalAddTodoOpen(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* TodoInput Formu */}
                    <form
                      onSubmit={(e) => {
                        addTodo(e);
                        setIsModalOpen(false);
                      }}
                    >
                      <TodoInput
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onSubmit={(e) => {
                          addTodo(e);
                          setIsModalAddTodoOpen(false);
                        }}
                        inputRef={inputAddTodoRef}
                        placeholder="Yeni kişi görevi ekle..."
                      />
                    </form>
                  </div>
                </div>
              )}
            </div>
            <TodoList
              todos={todos}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              saveEdit={saveEdit}
              toggleComplete={toggleComplete}
              startEditing={startEditing}
              handleDeleteClick={handleDeleteClick}
              handleArchiveClick={handleArchiveClick}
              activeTab={activeTab}
              nickName={nickName}
              setEditCategory={setEditCategory}
            />
          </TabsContent>

          <TabsContent value="group">
            {groups.length > 0 ? (
              <>
                <div className="mb-4">
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <form onSubmit={addTodo} className="flex gap-2 mb-6">
                  <TodoInput
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onSubmit={addTodo}
                    placeholder="Yeni grup görevi ekle..."
                  />
                </form> */}
                <div>
                  {/* Modal Açma Butonu */}
                  <LuCirclePlus
                    onClick={() => setIsModalAddTodoOpen(true)}
                    className="h-6 w-6 cursor-pointer m-3"
                  />

                  {/* Modal */}
                  {isModalAddTodoOpen && (
                    <div
                      className="fixed inset-0 bg-black/50 flex items-center justify-center"
                      onClick={() => setIsModalAddTodoOpen(false)}
                    >
                      <div
                        className="bg-white p-6 rounded-lg w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Modal Başlık ve Kapatma Butonu */}
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">
                            Yeni Görev Ekle
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsModalAddTodoOpen(false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* TodoInput Formu */}
                        <form
                          onSubmit={(e) => {
                            addTodo(e);
                            setIsModalAddTodoOpen(false);
                          }}
                        >
                          <TodoInput
                            value={newTodo}
                            amount={newTodoAmount}
                            unit={newTodoUnit}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onChangeAmount={(e) =>
                              setNewTodoAmount(e.target.value)
                            }
                            onChangeUnit={(e) => setNewTodoUnit(e.target.value)}
                            onSubmit={(e) => {
                              addTodo(e);
                              setIsModalAddTodoOpen(false);
                              setNewTodoAmount("");
                              setNewTodoUnit("");
                            }}
                            inputRef={inputAddTodoRef}
                            placeholder="Yeni görev ekle..."
                            setNewTodoCategory={setNewTodoCategory}
                          />
                        </form>
                      </div>
                    </div>
                  )}
                </div>
                <TodoList
                  todos={groupTodos}
                  editingId={editingId}
                  editText={editText}
                  setEditText={setEditText}
                  saveEdit={saveEdit}
                  toggleComplete={toggleComplete}
                  startEditing={startEditing}
                  handleDeleteClick={handleDeleteClick}
                  handleArchiveClick={handleArchiveClick}
                  activeTab={activeTab}
                  nickName={nickName}
                  setEditingId={setEditingId}
                  setEditCategory={setEditCategory}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Henüz bir gruba üye değilsiniz.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowGroupSettings(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gruplara Katıl
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archive">
            {groups.length > 0 ? (
              <>
                <div className="mb-4">
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                </div>
                <TodoList
                  todos={archivedTodos}
                  editingId={editingId}
                  editText={editText}
                  setEditText={setEditText}
                  saveEdit={saveEdit}
                  toggleComplete={toggleComplete}
                  startEditing={startEditing}
                  handleDeleteClick={handleDeleteClick}
                  handleArchiveClick={handleArchiveClick}
                  activeTab={activeTab}
                  nickName={nickName}
                  setEditingId={setEditingId}
                  setEditCategory={setEditCategory}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Henüz bir gruba üye değilsiniz.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowGroupSettings(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gruplara Katıl
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {showGroupSettings && (
          <GroupSettingsModal
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            groupIdToJoin={groupIdToJoin}
            setGroupIdToJoin={setGroupIdToJoin}
            createGroup={createGroup}
            joinGroup={joinGroup}
            groups={groups}
            leaveGroup={leaveGroup}
            deleteGroup={deleteGroup}
            renameGroup={renameGroup}
            handleCopyToClipboard={handleCopyToClipboard}
            setShowGroupSettings={setShowGroupSettings}
            user={user}
          />
        )}

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
          message={`'${selectedTodo?.text}' adlı görevi silmek istediğinize emin misiniz?`}
          confirmButtonText={"Sil"}
        />
        <ConfirmationModal
          isOpen={isModalOpenArchive}
          onClose={() => setIsModalOpenArchive(false)}
          onConfirm={handleConfirmArchive}
          message={`'${selectedTodoArchive?.text}' adlı görevi arşivlemek istediğinize emin misiniz?`}
          confirmButtonText={"Arşivle"}
        />
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          nickName={nickName}
          user={user}
          setNickName={setNickName}
        />
        <CategoryModal
          isOpen={isModalCategoriesOpen}
          onClose={() => setIsModalCategoriesOpen(false)}
          nickName={nickName}
          user={user}
          setNickName={setNickName}
        />
        <ToastContainer />
      </CardContent>
    </Card>
  );
};

export default TodoApp;
