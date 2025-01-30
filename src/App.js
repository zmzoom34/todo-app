import React, { useState, useEffect, useRef } from "react";
import {
  LogOut,
  Settings,
  Users,
  User,
  X,
  Plus,
  CircleFadingPlus,
} from "lucide-react";
import { LuCirclePlus } from "react-icons/lu";
import { Tooltip } from "@mui/material";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import ConfirmationModal from "./components/ConfirmationModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebase-config";
import AuthComponent from "./components/AuthComponent";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import GroupSettingsModal from "./components/GroupSettingsModal";
import GroupList from "./components/GroupList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

const TodoApp = () => {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [groupTodos, setGroupTodos] = useState([]);
  const [archivedTodos, setArchivedTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [activeTab, setActiveTab] = useState("group");
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupIdToJoin, setGroupIdToJoin] = useState("");
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenArchive, setIsModalOpenArchive] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [selectedTodoArchive, setSelectedTodoArchive] = useState(null);
  const [isModalAddTodoOpen, setIsModalAddTodoOpen] = useState(false);
  const inputAddTodoRef = useRef(null);

  const auth = getAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const todoQuery = query(
      collection(db, "todos"),
      where("userId", "==", user.uid),
      where("type", "==", "personal"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeTodos = onSnapshot(
      todoQuery,
      (snapshot) => {
        const todosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodos(todosData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching personal todos:", error);
        setLoading(false);
      }
    );

    const groupQuery = query(
      collection(db, "groups"),
      where("members", "array-contains", user.uid)
    );

    const unsubscribeGroups = onSnapshot(
      groupQuery,
      (snapshot) => {
        const groupsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupsData);

        if (groupsData.length > 0 && !selectedGroupId) {
          setSelectedGroupId(groupsData[0].id);
        }
      },
      (error) => {
        console.error("Error fetching groups:", error);
      }
    );

    return () => {
      unsubscribeTodos();
      unsubscribeGroups();
    };
  }, [user]);

  // Modal açıldığında inputa otomatik odaklanma
  useEffect(() => {
    if (isModalAddTodoOpen && inputAddTodoRef.current) {
      inputAddTodoRef.current.focus();
    }
  }, [isModalAddTodoOpen]);

  useEffect(() => {
    if (!user || !selectedGroupId || activeTab !== "group") return;

    const groupTodoQuery = query(
      collection(db, "todos"),
      where("groupId", "==", selectedGroupId),
      where("type", "==", "group"),
      where("statue", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeGroupTodos = onSnapshot(
      groupTodoQuery,
      (snapshot) => {
        const groupTodosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroupTodos(groupTodosData);
      },
      (error) => {
        console.error("Error fetching group todos:", error);
      }
    );

    return () => unsubscribeGroupTodos();
  }, [selectedGroupId, user, activeTab]);

  useEffect(() => {
    if (!user || !selectedGroupId || activeTab !== "archive") return;

    const groupTodoQuery = query(
      collection(db, "todos"),
      where("groupId", "==", selectedGroupId),
      where("type", "==", "group"),
      where("statue", "==", "archive"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeGroupTodos = onSnapshot(
      groupTodoQuery,
      (snapshot) => {
        const archivedTodosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArchivedTodos(archivedTodosData);
      },
      (error) => {
        console.error("Error fetching group todos:", error);
      }
    );

    return () => unsubscribeGroupTodos();
  }, [selectedGroupId, user, activeTab]);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      await addDoc(collection(db, "groups"), {
        groupName: newGroupName,
        createdBy: user.uid,
        members: [user.uid],
        createdAt: new Date().toISOString(),
      });

      setNewGroupName("");
      console.log("Grup başarıyla oluşturuldu");
    } catch (error) {
      console.error("Grup oluşturma hatası:", error);
      //alert("Grup oluşturulurken bir hata oluştu.");
      showToastMessage("Grup oluşturulurken bir hata oluştu.", "warning");
    }
  };

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

  const showToastMessage = (msg, type) => {
    if (type === "warning") {
      toast.warning(msg, { position: "top-right" });
    } else if (type === "success") {
      toast.success(msg, { position: "top-right" });
    } else if (type === "info") {
      toast.info(msg, { position: "bottom-right" });
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const todoData = {
        text: newTodo,
        completed: false,
        statue: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.uid,
        type: activeTab === "personal" ? "personal" : "group",
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

  const deleteTodo = async (todo) => {
    try {
      await deleteDoc(doc(db, "todos", todo.id));
      //alert("Görev başarıyla silindi.");
      showToastMessage("Görev başarıyla silindi :)", "success");
    } catch (error) {
      console.error("Error deleting todo:", error);
      //alert("Todo silinirken bir hata oluştu.");
      showToastMessage("Todo silinirken bir hata oluştu: )", "warning");
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
      try {
        await updateDoc(doc(db, "todos", selectedTodoArchive.id), {
          statue: "archive",
          archivedAt: new Date().toISOString(),
        });
        setIsModalOpenArchive(false);
        setSelectedTodoArchive(null);
        showToastMessage("Görev arşivlendi...", "info");
      } catch (error) {
        console.error("Error updating todo:", error);
        //alert("Todo güncellenirken bir hata oluştu.");
        showToastMessage("Todo güncellenirken bir hata oluştu: )", "warning");
      }
    }
  };

  const saveEdit = async (todo) => {
    if (!editText.trim()) return;

    try {
      await updateDoc(doc(db, "todos", todo.id), {
        text: editText,
        updatedAt: new Date().toISOString(),
      });
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating todo:", error);
      //alert("Todo güncellenirken bir hata oluştu.");
      showToastMessage("Todo güncellenirken bir hata oluştu: )", "warning");
    }
  };

  const toggleComplete = async (todo) => {
    try {
      await updateDoc(doc(db, "todos", todo.id), {
        completed: !todo.completed,
        updatedAt: new Date().toISOString(),
      }).then(() => {
        if (todo.completed) {
          showToastMessage("Görev yapılmadı", "success");
        } else {
          showToastMessage("Görev yapıldı", "success");
        }
        console.log(todo.completed);
      });
      
    } catch (error) {
      console.error("Error updating todo:", error);
      //alert("Todo güncellenirken bir hata oluştu.");
      showToastMessage("Todo güncellenirken bir hata oluştu: )", "warning");
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">
          Yapılacaklar Listesi
        </CardTitle>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setShowGroupSettings(!showGroupSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Grup Ayarları
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
              Grup Todoları
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
              Kişisel Todolar
            </TabsTrigger>
            <TabsTrigger
              value="archive"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "archive"
                  ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <User className="w-4 h-4" />
              Arşiv Todolar
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
              <Button
                onClick={() => setIsModalAddTodoOpen(true)}
                className="m-1"
              >
                <LuCirclePlus />
              </Button>

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
                  <Button
                    onClick={() => setIsModalAddTodoOpen(true)}
                    className="m-1"
                  >
                    <LuCirclePlus />
                  </Button>

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
                            onChange={(e) => setNewTodo(e.target.value)}
                            onSubmit={(e) => {
                              addTodo(e);
                              setIsModalAddTodoOpen(false);
                            }}
                            inputRef={inputAddTodoRef}
                            placeholder="Yeni grup görevi ekle..."
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
        <ToastContainer />
      </CardContent>
    </Card>
  );
};

export default TodoApp;
