import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import emailjs from "emailjs-com";
import { Users, User, Archive } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import ConfirmationModal from "../components/ConfirmationModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import CategoryModal from "./CategoryModal";
import UnitModal from "./UnitModal";
import AddListTodoModal from "./ui/AddListTodoModal";
import AddListTodoAdvancedModal from "./ui/AddListTodoAdvancedModal";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase-config";
import AuthComponent from "../components/AuthComponent";
import GroupSettingsModal from "../components/GroupSettingsModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import ProfileModal from "./ProfileModal";
import useFetchUserData from "../hooks/useFetchUserData";
import { useFirebaseSubscriptions } from "../hooks/useFirebaseSubscriptions";
import { useFirebaseUserData } from "../hooks/useFirebaseUserData";
import { useModalFocus } from "../hooks/useModalFocus";
import { useGroupTodos } from "../hooks/useGroupTodos";
import { useArchivedTodos } from "../hooks/useArchivedTodos";
import { useGroupCreation } from "../hooks/useGroupCreation";
import { useToast } from "../hooks/useToast";
import { useTodoOperations } from "../hooks/useTodoOperations";
import useFetchUserLists from "../hooks/useFetchUserLists";
import useFetchGroupLists from "../hooks/useFetchGroupLists";
import useFetchGroupListsAdvanced from "../hooks/useFetchGroupListsAdvanced";
import useUserData from "../hooks/useUserData";
import useFetchCategories from "../hooks/useFetchCategories";
import useFetchStores from "../hooks/useFetchStores";
import Notification from "./Notification";
import PriceInputModal from "./ui/PriceInputModal";
import StoreModal from "./StoreModal";
import useFetchUnits from "../hooks/useFetchUnits";
import AppHeader from "./AppHeader";
import TabContent from "./TabContent";

const TodoApp = ( {
  user, // App.js'den gelen user
  setUser, // App.js'den gelen setUser
}) => {
  const auth = getAuth();
  //const [user, setUser] = useState(null);
  const [newTodo, setNewTodo] = useState("");
  const [editTodo, setEditTodo] = useState(null);
  const [newTodoCategory, setNewTodoCategory] = useState("");
  const [newTodoAmount, setNewTodoAmount] = useState("");
  const [newTodoUnit, setNewTodoUnit] = useState("");
  const [newTodoPrice, setNewTodoPrice] = useState("");
  const [newTodoBrand, setNewTodoBrand] = useState("");
  const [newTodoStore, setNewTodoStore] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [activeTab, setActiveTab] = useState("group");
  const [groupIdToJoin, setGroupIdToJoin] = useState("");
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isModalOpenArchive, setIsModalOpenArchive] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [selectedTodoArchive, setSelectedTodoArchive] = useState(null);
  const [isModalAddTodoOpen, setIsModalAddTodoOpen] = useState(false);
  const [isModalAddListTodoOpen, setIsModalAddListTodoOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalAddListTodoAdvancedOpen, setIsModalAddListTodoAdvancedOpen] =
    useState(false);
  const [isModalAddTodoDirectArchiveOpen, setIsModalAddTodoDirectArchiveOpen] =
    useState(false);
  const [isModalCategoriesOpen, setIsModalCategoriesOpen] = useState(false);
  const [isModalUnitsOpen, setIsModalUnitsOpen] = useState(false);
  const [isModalStoresOpen, setIsModalStoresOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [newTodoDueDate, setNewTodoDueDate] = useState("");
  const [expandedListId, setExpandedListId] = useState(null);
  //

  // Add new state for notification permission
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM
  const [monthlyReport, setMonthlyReport] = useState(null);
  const inputAddTodoRef = useModalFocus(isModalAddTodoOpen);
  //const [nickName, setNickName, defaultGroupId, setDefaultGroup] = useFetchUserData(user);
  //const [nickName, setNickName, defaultGroupId, setDefaultGroup, loadingUserData, error] = useFetchUserData();

  const {
    nickName,
    setNickName,
    defaultGroupId,
    setDefaultGroupId,
    todos,
    groups,
    selectedGroupId,
    setSelectedGroupId,
    loading,
  } = useFirebaseUserData(db);

  //const { todos, groups, selectedGroupId, setSelectedGroupId, loading } = useFirebaseSubscriptions(db, user, defaultGroupId);
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

  useEffect(() => {
    const groupIdFromUrl = searchParams.get("groupId");
    if (groupIdFromUrl && user) {
      handleJoinGroupFromUrl(groupIdFromUrl);
      // Parametreleri URL'den temizle
      setSearchParams({});
    }
  }, [user, searchParams, setSearchParams]);

  const { newGroupName, setNewGroupName, createGroup } = useGroupCreation(
    db,
    user,
    showToastMessage
  );

  const { deleteTodo, toggleComplete, archiveTodo, archiveTodoDirect } =
    useTodoOperations(db, showToastMessage);

  const { todosAll } = useUserData(user);

  const { categories } = useFetchCategories();
  const { stores } = useFetchStores();
  const { units } = useFetchUnits();
  const { userLists, loadingUserList } = useFetchUserLists(db, user);
  const { groupLists, loadingGroupList } = useFetchGroupLists(
    db,
    selectedGroupId
  );
  const { groupListsAdvanced, loadingGroupListAdvanced } =
    useFetchGroupListsAdvanced(db, selectedGroupId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const todoParameters = [
    {
      id: "title",
      label: "Başlık",
      type: "text",
      required: true,
      placeholder: "Yapılacak görevin başlığını girin",
    },
    {
      id: "description",
      label: "Açıklama",
      type: "textarea",
      placeholder: "Detaylı açıklama",
      rows: 3,
    },
    {
      id: "priority",
      label: "Öncelik",
      type: "select",
      options: [
        { value: "low", label: "Düşük" },
        { value: "medium", label: "Orta" },
        { value: "high", label: "Yüksek" },
      ],
    },
    {
      id: "dueDate",
      label: "Bitiş Tarihi",
      type: "date",
    },
  ];

  

  useEffect(() => {
    const fetchUserDataAndSubscriptions = async () => {
      // Kullanıcı verilerini al
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.defaultGroup) {
          setDefaultGroupId(userData.defaultGroup)
          setSelectedGroupId(userData.defaultGroup)
        };
        
      }
    }

    if (!loading) {
      fetchUserDataAndSubscriptions()
    }
  }, [groups]);

  const handleSetDefaultGroup = async (groupId) => {
    try {
      setDefaultGroupId(groupId);
      setSelectedGroupId(groupId); // Varsayılan grup değiştiğinde seçili grubu da güncelle
      if (user && user.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { defaultGroup: groupId });
        showToastMessage("Varsayılan grup başarıyla güncellendi!", "success");
      }
    } catch (error) {
      console.error("Varsayılan grup ayarlanırken hata oluştu:", error);
      showToastMessage("Varsayılan grup ayarlanırken bir hata oluştu.", "error");
    }
  };

  // Function to send notification
  const sendNotification = (todoText, createdBy) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (notificationPermission === "granted") {
      const notification = new Notification("Yeni Görev Eklendi!", {
        body: `${createdBy} tarafından yeni bir görev eklendi: ${todoText}`,
        icon: "../../public/favicon.ico", // Add your app's icon path here
        badge: "../../public/favicon.ico", // Add your app's badge icon path here
        vibrate: [200, 100, 200],
      });

      notification.onclick = function () {
        window.focus();
        notification.close();
      };
    }
  };

  // Filtrelenmiş arşivlenen görevler
  const filteredArchivedTodos = archivedTodos.filter((todo) => {
    const matchesSearch = todo.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? todo.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // URL'den gelen groupId ile gruba katılma fonksiyonu
  const handleJoinGroupFromUrl = async (groupId) => {
    try {
      if (!user || !user.uid) {
        showToastMessage("Lütfen önce giriş yapın.", "warning");
        return;
      }

      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        showToastMessage("Geçersiz grup bağlantısı.", "warning");
        return;
      }

      const groupData = groupSnap.data();

      if (groupData.members.includes(user.uid)) {
        showToastMessage("Bu gruba zaten üyesiniz.", "info");
        setSelectedGroupId(groupId);
        return;
      }

      const updatedMembers = [...groupData.members, user.uid];
      await updateDoc(groupRef, { members: updatedMembers });

      setSelectedGroupId(groupId);
      setActiveTab("group");
      showToastMessage(
        `"${groupData.groupName}" grubuna katıldınız!`,
        "success"
      );
    } catch (error) {
      console.error("URL ile gruba katılma hatası:", error);
      showToastMessage("Gruba katılırken bir hata oluştu.", "error");
    }
  };

  const joinGroup = async () => {
    console.log(groupIdToJoin);

    if (!groupIdToJoin.trim()) return;

    try {
      // Kullanıcı giriş yapmış mı kontrol et
      if (!user || !user.uid) {
        showToastMessage("Lütfen önce giriş yapın.", "warning");
        return;
      }

      const groupRef = doc(db, "groups", groupIdToJoin);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        showToastMessage("Belirtilen ID ile bir grup bulunamadı.", "warning");
        return;
      }

      const groupData = groupSnap.data();

      console.log(groupData);

      // Kullanıcı zaten üye mi?
      if (groupData.members.includes(user.uid)) {
        showToastMessage("Bu gruba zaten üyesiniz.", "warning");
        return;
      }

      // Yeni üye dizisini oluştur
      const updatedMembers = [...groupData.members, user.uid];

      // Grubu güncelle
      await updateDoc(groupRef, {
        members: updatedMembers,
      });

      // State'leri sıfırla
      setGroupIdToJoin("");
      setShowGroupSettings(false);
      setActiveTab("group");

      showToastMessage("Gruba başarıyla katıldınız!", "success");
    } catch (error) {
      console.error("Grup katılma hatası:", error);
      showToastMessage(
        "Gruba katılırken bir hata oluştu. Lütfen grup ID'sini kontrol edin.",
        "error"
      );
    }
  };

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  const generateMonthlyReport = () => {
    const filteredTodos = archivedTodos.filter((todo) =>
      todo.archivedAt.startsWith(selectedMonth)
    );

    const totalArchived = filteredTodos.length;

    // Kategori bazlı istatistikler (Toplam Sayı ve Harcama)
    const categoryStats = filteredTodos.reduce((acc, todo) => {
      if (!acc[todo.category]) {
        acc[todo.category] = { count: 0, totalPrize: 0 };
      }
      acc[todo.category].count += 1;
      acc[todo.category].totalPrize += todo.prizeTL
        ? parseFloat(todo.prizeTL)
        : 0;
      return acc;
    }, {});

    // Kullanıcı bazlı istatistikler
    const userStats = filteredTodos.reduce((acc, todo) => {
      acc[todo.archivedBy] = (acc[todo.archivedBy] || 0) + 1;
      return acc;
    }, {});

    // Toplam harcanan ücret
    const totalPrize = filteredTodos.reduce(
      (sum, todo) => sum + (todo.prizeTL ? parseFloat(todo.prizeTL) : 0),
      0
    );

    // Detaylı görev listesi
    const taskDetails = filteredTodos.map((todo) => ({
      text: todo.text,
      archivedBy: todo.archivedBy,
      amount: todo.amount,
      unit: todo.unit,
      archivedAt: new Date(todo.archivedAt).toLocaleDateString(),
      category:
        categories.find((c) => c.value === todo.category)?.label ||
        todo.category,
      prize: todo.prizeTL ? todo.prizeTL : "—",
      categoryId: todo.category,
    }));

    setMonthlyReport({
      totalArchived,
      categoryStats,
      userStats,
      totalPrize,
      taskDetails,
      selectedMonth,
    });

    openReportModal();
  };

  const sendGroupEmail = async (groupId, todoText, creatorName) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        console.log("Grup bulunamadı.");
        return;
      }

      const groupData = groupSnap.data();
      const userIds = groupData.members || []; // UID dizisini al

      // Kullanıcı UID'lerine göre e-posta adreslerini al
      const emails = [];

      for (const userId of userIds) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.email) {
            emails.push(userData.email);
          }
        }
      }

      if (emails.length === 0) {
        console.log("Grup üyeleri için e-posta adresi bulunamadı.");
        return;
      }

      // EmailJS için diziyi string formatına çevir (virgülle ayır)
      const emailList = emails.join(",");

      //console.log("E-posta adresleri:", emails);

      const templateParams = {
        to_email: emailList, // Virgülle ayrılmış string formatında
        subject: "Yeni Bir Görev Eklendi!",
        message: `${creatorName} tarafından yeni bir görev eklendi: "${todoText}".`,
      };

      await emailjs.send(
        "service_k4vmxr7",
        "template_pdhcv8b",
        templateParams,
        "Gy3c-c1gdbL79CD8a"
      );

      console.log("E-posta başarıyla gönderildi!");
    } catch (error) {
      console.error("E-posta gönderme hatası:", error);
    }
  };

  const addTodoDirectArchive = async (e) => {
    e.preventDefault();

    if (!newTodo.trim()) return;

    // Validate amount if it's provided
    if (newTodoAmount) {
      // Remove any leading/trailing whitespace
      const trimmedAmount = newTodoAmount.trim();

      // Check if the amount is a valid number (integer or decimal)
      const isValidNumber = /^\d*\.?\d+$/.test(trimmedAmount);

      if (!isValidNumber) {
        showToastMessage(
          "Lütfen geçerli bir sayı giriniz (örn: 5 veya 5.5)",
          "warning"
        );
        return;
      }
    }

    try {
      const newTodoData = {
        text: newTodo || "Bilinmeyen görev", // Required
        completed: true, // Required
        userId: user?.uid, // Required
        createdAt: new Date().toISOString(), // Required
        updatedAt: new Date().toISOString(), // Required
        type: activeTab === "personal" ? "personal" : "group", // Required
        statue: "archive",
        archivedAt: new Date().toISOString(),
        archivedBy: nickName,
        completedBy: nickName,
        createdBy: nickName,
        updatedBy: nickName,
        prizeTL: newTodoPrice,
        prizeUSD: "",
        amount: newTodoAmount,
        unit: newTodoUnit,
        category: newTodoCategory,
        store: newTodoStore,
        brand: newTodoBrand,
      };

      if (activeTab === "archive") {
        if (!selectedGroupId) {
          alert("Lütfen bir grup seçin");
          return;
        }
        newTodoData.groupId = selectedGroupId;
      }

      await archiveTodoDirect(
        newTodoData,
        nickName,
        setIsModalAddTodoDirectArchiveOpen,
        activeTab
      );

      setIsPriceModalOpen(false);
      setIsModalOpenArchive(false);
      setSelectedTodoArchive(null);

      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo:", error);
      showToastMessage("Todo eklenirken bir hata oluştu. :)", "warning");
    }
  };

  const addListTodo = async (e) => {
    console.log(activeTab); // Log the input value

    if (!e.trim()) {
      console.log("Empty list name, aborting");
      return;
    }

    try {
      // Authentication check
      if (!user || !user.uid) {
        throw new Error("User not authenticated");
      }

      // Determine the parent collection and ID based on activeTab
      const parentCollection = activeTab === "personal" ? "users" : "groups"; // Fixed "group" to "groups"
      const parentId = activeTab === "personal" ? user.uid : selectedGroupId;

      // Create a reference to the parent document (user or group)
      const parentDocRef = doc(db, parentCollection, parentId);

      // Create a reference to the 'lists' subcollection
      const listsCollectionRef = collection(parentDocRef, "lists");

      // Prepare the data to be saved
      const listData = {
        listName: e,
        timestamp: new Date().toISOString(),
      };

      // Add the document to Firestore
      const docRef = await addDoc(listsCollectionRef, listData);

      console.log("List successfully added with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding list:", error);
    }
  };

  const addListTodoAdvanced = (todoData) => {
    console.log("Kaydedilen todo:", todoData);
    // Burada veritabanına kaydetme işlemleri yapılabilir
  };

  // Modify the addTodo function to include notification
  const addTodo = async (e) => {
    e.preventDefault();

    if (!newTodo.trim()) return;

    // Validate amount if it's provided
    if (newTodoAmount) {
      // Remove any leading/trailing whitespace
      const trimmedAmount = newTodoAmount.trim();

      // Check if the amount is a valid number (integer or decimal)
      const isValidNumber = /^\d*\.?\d+$/.test(trimmedAmount);

      if (!isValidNumber) {
        showToastMessage(
          "Lütfen geçerli bir sayı giriniz (örn: 5 veya 5.5)",
          "warning"
        );
        return;
      }
    }

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

      if (newTodoDueDate !== "") {
        // Tarihi Date nesnesine çevir ve ISO formatına dönüştür
        const dueDate = new Date(newTodoDueDate);
        todoData.dueDate = dueDate.toISOString(); // 2025-02-19T09:44:16.838Z formatında
      }

      await addDoc(collection(db, "todos"), todoData);

      // Send notification for new todo
      //sendNotification(newTodo, nickName)i;

      if (activeTab === "group") {
        sendGroupEmail(selectedGroupId, newTodo, nickName);
      }

      setNewTodo("");
      showToastMessage("Görev başarıyla eklendi :)", "success");
    } catch (error) {
      console.error("Error adding todo:", error);
      showToastMessage("Todo eklenirken bir hata oluştu. :)", "warning");
    }
  };

  // Add notification permission request button if needed
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        showToastMessage("Bildirim izni verildi!", "success");
      } else {
        showToastMessage("Bildirim izni reddedildi.", "warning");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      showToastMessage("Bildirim izni alınırken hata oluştu.", "error");
    }
  };

  const saveEdit = async (todo) => {
    console.log(editCategory);

    if (!editText.trim()) return;

    try {
      // Güncellenecek alanları bir nesne içinde toplayalım
      const updateData = {
        text: editText,
        updatedAt: new Date().toISOString(),
        updatedBy: nickName,
      };

      // Sadece değer varsa güncellenecek alanlara ekleyelim
      if (editAmount !== undefined && editAmount !== "") {
        updateData.amount = editAmount;
      } else if (todo.amount) {
        updateData.amount = todo.amount;
      }

      if (editCategory !== undefined && editCategory !== "") {
        updateData.category = editCategory;
      } else if (todo.category) {
        updateData.category = todo.category;
      }

      if (editUnit !== undefined && editUnit !== "") {
        updateData.unit = editUnit;
      } else if (todo.unit) {
        updateData.unit = todo.unit;
      }

      await updateDoc(doc(db, "todos", todo.id), updateData);

      // State'leri temizle
      setEditingId(null);
      setEditText("");
      setEditAmount("");
      setEditCategory("");
      setEditUnit("");

      showToastMessage("Görev başarıyla güncellendi", "success");
    } catch (error) {
      console.error("Error updating todo:", error);
      showToastMessage(
        "Todo güncellenirken bir hata oluştu: " + error.message,
        "error"
      );
    }
  };

  const saveEditTodo = async (todo) => {
    // Check if the todo has an id and text
    if (!todo.id) {
      console.error("Todo ID is missing");
      showToastMessage("Todo ID eksik", "error");
      return;
    }

    if (!todo.text || !todo.text.trim()) {
      showToastMessage("Görev detayı boş olamaz", "error");
      return;
    }

    try {
      // Update document with sanitized fields
      await updateDoc(doc(db, "todos", todo.id), todo);

      // State'leri temizle
      setEditTodo(null);

      showToastMessage("Görev başarıyla güncellendi", "success");
    } catch (error) {
      console.error("Error updating todo:", error);
      showToastMessage(
        "Todo güncellenirken bir hata oluştu: " + error.message,
        "error"
      );
    }
  };

  const handleDeleteClick = (todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleArchiveClick = (todo) => {
    console.log(todo.completed);
    if (todo.completed) {
      setSelectedTodoArchive(todo);
      setIsModalOpenArchive(true);
    } else {
      showToastMessage("Tamamlanmamış görevler arşivlenemez", "warning");
    }
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
      // if (!selectedTodoArchive.completed) {
      //   showToastMessage("Tamamlanmamış görev arşivlenemez", "warning");
      //   return false;
      // }
      //console.log(selectedTodoArchive)
      setIsPriceModalOpen(true);
    }
  };

  const handlePriceConfirm = async (price, store, brand) => {
    await archiveTodo(
      selectedTodoArchive,
      nickName,
      setIsModalOpenArchive,
      price,
      store,
      brand
    );
    setIsPriceModalOpen(false);
    setIsModalOpenArchive(false);
    setSelectedTodoArchive(null);
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

  const handleDeleteList = async (listId) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Reference to the specific list document
      const listDocRef = doc(db, "users", user.uid, "lists", listId);

      // Delete the document
      await deleteDoc(listDocRef);

      console.log("List deleted successfully");
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

// Varsayılan grup ayarlama fonksiyonu (Firebase'e kaydetme eklendi)
// const handleSetDefaultGroup = async (groupId) => {
//   try {
//     setDefaultGroup(groupId); // State'i güncelle
//     if (user && user.uid) {
//       const userRef = doc(db, "users", user.uid);
//       await updateDoc(userRef, { defaultGroup: groupId }); // Firebase'e kaydet
//       showToastMessage("Varsayılan grup başarıyla güncellendi!", "success");
//     }
//   } catch (error) {
//     console.error("Varsayılan grup ayarlanırken hata oluştu:", error);
//     showToastMessage("Varsayılan grup ayarlanırken bir hata oluştu.", "error");
//   }
// };

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
    <Card>
      <AppHeader
        auth={auth}
        user={user}
        db={db}
        requestNotificationPermission={requestNotificationPermission}
        notificationPermission={notificationPermission}
        setIsProfileModalOpen={setIsProfileModalOpen}
        setShowGroupSettings={setShowGroupSettings}
        setIsModalCategoriesOpen={setIsModalCategoriesOpen}
        setIsModalUnitsOpen={setIsModalUnitsOpen}
        setIsModalStoresOpen={setIsModalStoresOpen}
        groupLists={groupLists}
        selectedGroupId={selectedGroupId}
        activeTab={activeTab}
      />

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 border-b">
            <TabsTrigger
              value="group"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                activeTab === "group"
                  ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Users className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Grup</span>
              <span className="xs:hidden text-base">Grup</span>
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                activeTab === "personal"
                  ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <User className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Kişisel</span>
              <span className="xs:hidden text-base">Kişisel</span>
            </TabsTrigger>
            <TabsTrigger
              value="archive"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                activeTab === "archive"
                  ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Archive className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Arşiv</span>
              <span className="xs:hidden text-base">Arşiv</span>
            </TabsTrigger>
          </TabsList>

          <TabContent
            activeTab={activeTab}
            todos={todos}
            todosAll={todosAll}
            groupTodos={groupTodos}
            filteredArchivedTodos={filteredArchivedTodos}
            userLists={userLists}
            groupLists={groupLists}
            groupListsAdvanced={groupListsAdvanced}
            groups={groups}
            editingId={editingId}
            editText={editText}
            setEditText={setEditText}
            saveEdit={saveEdit}
            saveEditTodo={saveEditTodo}
            toggleComplete={toggleComplete}
            startEditing={startEditing}
            handleDeleteClick={handleDeleteClick}
            handleArchiveClick={handleArchiveClick}
            nickName={nickName}
            setEditingId={setEditingId}
            setEditCategory={setEditCategory}
            setEditAmount={setEditAmount}
            setEditUnit={setEditUnit}
            editAmount={editAmount}
            categories={categories}
            stores={stores}
            units={units}
            editTodo={editTodo}
            setEditTodo={setEditTodo}
            selectedGroupId={selectedGroupId}
            defaultGroupId={defaultGroupId}
            setSelectedGroupId={setSelectedGroupId}
            isModalAddTodoOpen={isModalAddTodoOpen}
            setIsModalAddTodoOpen={setIsModalAddTodoOpen}
            setIsModalAddListTodoOpen={setIsModalAddListTodoOpen}
            setIsModalAddListTodoAdvancedOpen={
              setIsModalAddListTodoAdvancedOpen
            }
            isModalAddTodoDirectArchiveOpen={isModalAddTodoDirectArchiveOpen}
            setIsModalAddTodoDirectArchiveOpen={
              setIsModalAddTodoDirectArchiveOpen
            }
            isReportModalOpen={isReportModalOpen}
            closeReportModal={closeReportModal}
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            newTodoAmount={newTodoAmount}
            setNewTodoAmount={setNewTodoAmount}
            newTodoUnit={newTodoUnit}
            setNewTodoUnit={setNewTodoUnit}
            newTodoCategory={newTodoCategory}
            setNewTodoCategory={setNewTodoCategory}
            newTodoPrice={newTodoPrice}
            setNewTodoPrice={setNewTodoPrice}
            newTodoBrand={newTodoBrand}
            setNewTodoBrand={setNewTodoBrand}
            newTodoStore={newTodoStore}
            setNewTodoStore={setNewTodoStore}
            newTodoDueDate={newTodoDueDate}
            setNewTodoDueDate={setNewTodoDueDate}
            inputAddTodoRef={inputAddTodoRef}
            addTodo={addTodo}
            addTodoDirectArchive={addTodoDirectArchive}
            handleDeleteList={handleDeleteList}
            expandedListId={expandedListId}
            setExpandedListId={setExpandedListId}
            setShowGroupSettings={setShowGroupSettings}
            loadingUserList={loadingUserList}
            loadingGroupList={loadingGroupList}
            loadingGroupListAdvanced={loadingGroupListAdvanced}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            generateMonthlyReport={generateMonthlyReport}
            monthlyReport={monthlyReport}
            user={user}
            db={db}
          />
        </Tabs>

        {/* All modals below - unchanged */}
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
            defaultGroupId={defaultGroupId} // Doğru prop: defaultGroupId state'i
            setDefaultGroup={handleSetDefaultGroup} // Doğru fonksiyon
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
          stores={stores}
          units={units}
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
        <AddListTodoModal
          isOpen={isModalAddListTodoOpen}
          onClose={() => setIsModalAddListTodoOpen(false)}
          onSave={addListTodo}
        />
        <AddListTodoAdvancedModal
          isOpen={isModalAddListTodoAdvancedOpen}
          onClose={() => setIsModalAddListTodoAdvancedOpen(false)}
          db={db}
          user={user}
          activeTab={activeTab}
          selectedGroupId={selectedGroupId}
          todoParameters={todoParameters}
        />
        <CategoryModal
          isOpen={isModalCategoriesOpen}
          onClose={() => setIsModalCategoriesOpen(false)}
          nickName={nickName}
          user={user}
          setNickName={setNickName}
        />
        <PriceInputModal
          isOpen={isPriceModalOpen}
          onClose={() => setIsPriceModalOpen(false)}
          onConfirm={handlePriceConfirm}
          stores={stores}
          units={units}
          todoText={selectedTodoArchive?.text || ""}
        />
        <UnitModal
          isOpen={isModalUnitsOpen}
          onClose={() => setIsModalUnitsOpen(false)}
        />
        <StoreModal
          isOpen={isModalStoresOpen}
          onClose={() => setIsModalStoresOpen(false)}
        />
        <ToastContainer />
      </CardContent>
    </Card>
  );
};

export default TodoApp;
