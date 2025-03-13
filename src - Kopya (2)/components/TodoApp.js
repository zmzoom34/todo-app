import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { DropdownMenu, DropdownMenuItem } from "./ui/DropdownMenu";
import {
  LogOut,
  Settings,
  Users,
  User,
  UserRoundPen,
  Archive,
  Menu,
  Ruler,
  Bell,
  Plus,
  CirclePlus,
  Store,
  List,
  Edit,
  Trash,
  Save,
  CircleX,
  ListTodo,
} from "lucide-react";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import ConfirmationModal from "../components/ConfirmationModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import CategoryModal from "./CategoryModal";
import UnitModal from "./UnitModal";
import AddTodoModal from "./ui/AddTodoModal";
import AddListTodoModal from "./ui/AddListTodoModal";
import AddListTodoAdvancedModal from "./ui/AddListTodoAdvancedModal";
import AddTodoDirectArchiveModal from "./ui/AddTodoDirectArchiveModal";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  //setDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase-config";
import AuthComponent from "../components/AuthComponent";
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
import useFetchUserLists from "../hooks/useFetchUserLists";
import useFetchGroupLists from "../hooks/useFetchGroupLists";
import useFetchGroupListsAdvanced from "../hooks/useFetchGroupListsAdvanced";
import useUserData from "../hooks/useUserData";
import useFetchCategories from "../hooks/useFetchCategories";
import useFetchStores from "../hooks/useFetchStores";
import ReportModal from "../components/ReportModal"; // Rapor modal bileşeni
import Notification from "./Notification";
import PriceInputModal from "./ui/PriceInputModal";
import { requestNotificationPermission } from "../firebase-config";
import BackupCollectionToJson from "./ui/BackupCollectionToJson";
import StoreModal from "./StoreModal";
import useFetchUnits from "../hooks/useFetchUnits";
import ExpandableListAll from "./ui/ExpandableListAll";
import ListsWithReports from "./ui/ListsWithReport";
import Tooltip from "./ui/Tooltip";
//import ReportModal from "../../public/"; // Rapor modal bileşeni

const TodoApp = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
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

  // const resendApiKey = process.env.REACT_APP_RESEND_API_KEY;
  // console.log(resendApiKey)
  //const resend = new Resend("re_NgSMPyhN_2fG4eZjY1sgBZZJ2QrmygfWs");

  // Add new state for notification permission
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM
  const [monthlyReport, setMonthlyReport] = useState(null);
  const inputAddTodoRef = useModalFocus(isModalAddTodoOpen);
  const [nickName, setNickName] = useFetchUserData(user);
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
  const { groupListsAdvanced, loadingGroupListAdvanced } = useFetchGroupListsAdvanced(
    db,
    selectedGroupId
  );
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

  // Request notification permission on component mount
  // useEffect(() => {
  //   if ("Notification" in window) {
  //     // Check if we already have permission
  //     setNotificationPermission(Notification.permission);

  //     if (Notification.permission === "default") {
  //       Notification.requestPermission().then((permission) => {
  //         setNotificationPermission(permission);
  //       });
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   requestNotificationPermission();
  // }, []);

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
      prize: todo.prizeTL ? `${todo.prizeTL} TL` : "—",
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

        <DropdownMenu trigger={<Menu className="w-5 h-5" />}>
          <DropdownMenuItem onClick={requestNotificationPermission}>
            <Bell className="w-4 h-4 mr-2" />
            {notificationPermission === "granted"
              ? "Bildirimler Açık"
              : "Bildirimleri Aç"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
            <UserRoundPen className="w-4 h-4 mr-2" />
            Profil Bilgileri
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowGroupSettings(!showGroupSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Grup Ayarları
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsModalCategoriesOpen(true)}>
            <UserRoundPen className="w-4 h-4 mr-2" />
            Kategoriler
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsModalUnitsOpen(true)}>
            <Ruler className="w-4 h-4 mr-2" />
            Birimler
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsModalStoresOpen(true)}>
            <Store className="w-4 h-4 mr-2" />
            Mağazalar
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BackupCollectionToJson collectionName={"todos"} />
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
            <div>
              {/* Modal Açma Butonu */}
              <div className="flex  justify-between">
                <Tooltip text={"Todo ekle"} position={"top"}>
                  <CirclePlus
                    onClick={() => setIsModalAddTodoOpen(true)}
                    className="h-8 w-8 cursor-pointer mb-2"
                  />
                </Tooltip>
                <Tooltip text={"Yeni todo listesi"} position={"top"}>
                  <List
                    onClick={() => setIsModalAddListTodoOpen(true)}
                    className="h-8 w-8 cursor-pointer mb-2"
                  />
                </Tooltip>
                <Tooltip text={"Excel rapor"} position={"top"}>
                  <ListsWithReports
                    lists={userLists}
                    user={user}
                    db={db}
                    type="personal"
                  />
                </Tooltip>
              </div>

              {/* Modal */}
              <AddTodoModal
                todos={todosAll}
                isOpen={isModalAddTodoOpen}
                onClose={() => setIsModalAddTodoOpen(false)}
                addTodo={addTodo}
                newTodo={newTodo}
                setNewTodo={setNewTodo}
                newTodoAmount={newTodoAmount}
                setNewTodoAmount={setNewTodoAmount}
                newTodoUnit={newTodoUnit}
                setNewTodoUnit={setNewTodoUnit}
                setNewTodoCategory={setNewTodoCategory}
                newTodoCategory={newTodoCategory}
                inputRef={inputAddTodoRef}
                categories={categories}
                stores={stores}
                units={units}
                newTodoDueDate={newTodoDueDate} // Yeni prop
                setNewTodoDueDate={setNewTodoDueDate} // Yeni prop
                todoType={"personal"}
              />
            </div>

            <div className="mb-2">
              {loadingUserList ? (
                <div>Loading lists...</div>
              ) : userLists.length > 0 ? (
                <div className="space-y-2">
                  {userLists.map((list) => (
                    // <ExpandableListItem
                    //   key={list.id}
                    //   list={list}
                    //   onEdit={(list) => {
                    //     setCurrentEditList(list);
                    //     setIsEditListModalOpen(true);
                    //   }}
                    //   onDelete={handleDeleteList}
                    //   user={user}
                    //   db={db}
                    // />
                    <ExpandableListAll
                      list={list}
                      onDelete={handleDeleteList}
                      user={user}
                      db={db}
                      expandedListId={expandedListId}
                      setExpandedListId={setExpandedListId}
                      listType={"lists"}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4"></div>
              )}
            </div>

            <TodoList
              todos={todos}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              saveEdit={saveEdit}
              saveEditTodo={saveEditTodo}
              toggleComplete={toggleComplete}
              startEditing={startEditing}
              handleDeleteClick={handleDeleteClick}
              handleArchiveClick={handleArchiveClick}
              activeTab={activeTab}
              nickName={nickName}
              setEditCategory={setEditCategory}
              setEditingId={setEditingId}
              setEditAmount={setEditAmount}
              setEditUnit={setEditUnit}
              editAmount={editAmount}
              categories={categories}
              stores={stores}
              units={units}
              editTodo={editTodo}
              setEditTodo={setEditTodo}
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
                <div>
                  {/* Modal Açma Butonu */}
                  <div className="flex  justify-between">
                    <Tooltip text="Todo ekle" position="top">
                      <CirclePlus
                        onClick={() => setIsModalAddTodoOpen(true)}
                        className="h-8 w-8 cursor-pointer mb-3"
                      />
                    </Tooltip>
                    <Tooltip text="Yeni todo listesi" position="top">
                      <List
                        onClick={() => setIsModalAddListTodoOpen(true)}
                        className="h-8 w-8 cursor-pointer mb-2"
                      />
                    </Tooltip>
                    <Tooltip text="Yeni gelişmiş todo listesi" position="left">
                      <ListTodo
                        onClick={() => setIsModalAddListTodoAdvancedOpen(true)}
                        className="h-8 w-8 cursor-pointer mb-2"
                      />
                    </Tooltip>
                    <Tooltip text="Excel rapor" position="top">
                      <ListsWithReports
                        lists={groupLists}
                        user={user}
                        db={db}
                        type="group"
                        groupId={selectedGroupId}
                      />
                    </Tooltip>
                  </div>

                  {/* Modal */}
                  <AddTodoModal
                    todos={todosAll}
                    isOpen={isModalAddTodoOpen}
                    onClose={() => {
                      setIsModalAddTodoOpen(false);
                      setNewTodo("");
                      setNewTodoCategory("");
                      setNewTodoAmount("");
                      setNewTodoUnit("");
                      setNewTodoPrice("");
                    }}
                    addTodo={addTodo}
                    newTodo={newTodo}
                    setNewTodo={setNewTodo}
                    newTodoAmount={newTodoAmount}
                    setNewTodoAmount={setNewTodoAmount}
                    newTodoUnit={newTodoUnit}
                    setNewTodoUnit={setNewTodoUnit}
                    setNewTodoCategory={setNewTodoCategory}
                    newTodoCategory={newTodoCategory}
                    inputRef={inputAddTodoRef}
                    categories={categories}
                    todoType={"group"}
                    units={units}
                  />
                </div>
                <div className="mb-2">
                  {loadingGroupListAdvanced ? (
                    <div>Loading lists Advanced...</div>
                  ) : groupListsAdvanced.length > 0 ? (
                    <div className="space-y-2">
                      {groupListsAdvanced.map((list) => (
                        // <ExpandableListItemGroup
                        //   key={list.id}
                        //   list={list}
                        //   onEdit={(list) => {
                        //     setCurrentEditList(list);
                        //     setIsEditListModalOpen(true);
                        //   }}
                        //   onDelete={handleDeleteList}
                        //   user={user}
                        //   db={db}
                        //   selectedGroupId={selectedGroupId}
                        // />
                        <ExpandableListAll
                          list={list}
                          onDelete={handleDeleteList}
                          user={user}
                          db={db}
                          type="group"
                          groupId={selectedGroupId}
                          expandedListId={expandedListId}
                          setExpandedListId={setExpandedListId}
                          listType={"listsAdvanced"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4"></div>
                  )}
                </div>
                <div className="mb-2">
                  {loadingGroupList ? (
                    <div>Loading lists...</div>
                  ) : groupLists.length > 0 ? (
                    <div className="space-y-2">
                      {groupLists.map((list) => (
                        // <ExpandableListItemGroup
                        //   key={list.id}
                        //   list={list}
                        //   onEdit={(list) => {
                        //     setCurrentEditList(list);
                        //     setIsEditListModalOpen(true);
                        //   }}
                        //   onDelete={handleDeleteList}
                        //   user={user}
                        //   db={db}
                        //   selectedGroupId={selectedGroupId}
                        // />
                        <ExpandableListAll
                          list={list}
                          onDelete={handleDeleteList}
                          user={user}
                          db={db}
                          type="group"
                          groupId={selectedGroupId}
                          expandedListId={expandedListId}
                          setExpandedListId={setExpandedListId}
                          listType={"lists"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4"></div>
                  )}
                </div>
                <TodoList
                  todos={groupTodos}
                  editingId={editingId}
                  editText={editText}
                  setEditText={setEditText}
                  saveEdit={saveEdit}
                  saveEditTodo={saveEditTodo}
                  toggleComplete={toggleComplete}
                  startEditing={startEditing}
                  handleDeleteClick={handleDeleteClick}
                  handleArchiveClick={handleArchiveClick}
                  activeTab={activeTab}
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
                <div className="mb-4 flex items-center justify-between gap-2">
                  {/* Tarih Seçici ve Rapor Butonu */}
                  <div className="flex items-center gap-2">
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="p-2 border rounded-md"
                    />
                    <button
                      onClick={generateMonthlyReport}
                      className="text-white px-4 py-2 rounded-md"
                    >
                      📝
                    </button>
                  </div>

                  {/* Direkt Arşive Ekle Butonu (En sağda ve ortalanmış) */}
                  <CirclePlus
                    className="w-8 h-8 cursor-pointer"
                    onClick={() => setIsModalAddTodoDirectArchiveOpen(true)}
                  />
                  {/* Modal */}
                  <AddTodoDirectArchiveModal
                    todos={todosAll}
                    isOpen={isModalAddTodoDirectArchiveOpen}
                    onClose={() => {
                      setIsModalAddTodoDirectArchiveOpen(false);
                      setNewTodo("");
                      setNewTodoCategory("");
                      setNewTodoAmount("");
                      setNewTodoUnit("");
                      setNewTodoPrice("");
                      setNewTodoBrand("");
                      setNewTodoStore("");
                    }}
                    addTodoDirectArchive={addTodoDirectArchive}
                    newTodo={newTodo}
                    setNewTodo={setNewTodo}
                    newTodoAmount={newTodoAmount}
                    setNewTodoAmount={setNewTodoAmount}
                    newTodoPrice={newTodoPrice}
                    setNewTodoPrice={setNewTodoPrice}
                    newTodoUnit={newTodoUnit}
                    setNewTodoUnit={setNewTodoUnit}
                    setNewTodoCategory={setNewTodoCategory}
                    newTodoCategory={newTodoCategory}
                    inputRef={inputAddTodoRef}
                    categories={categories}
                    todoType={"archive"}
                    stores={stores}
                    units={units}
                    newTodoBrand={newTodoBrand} // Yeni prop
                    setNewTodoBrand={setNewTodoBrand} // Yeni prop
                    newTodoStore={newTodoStore} // Yeni prop
                    setNewTodoStore={setNewTodoStore} // Yeni prop
                  />
                </div>

                {/* Rapor Modalı */}
                {isReportModalOpen && (
                  <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={closeReportModal}
                    reportData={monthlyReport}
                    categories={categories}
                  />
                )}

                <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                  {/* Arama Kutusu */}
                  <input
                    type="text"
                    placeholder="Arşivde ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />

                  {/* Kategori Seçici */}
                  <select
                    className="p-2 border rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <TodoList
                  todos={filteredArchivedTodos} // Filtrelenmiş görevleri göster
                  editingId={editingId}
                  editText={editText}
                  setEditText={setEditText}
                  saveEdit={saveEdit}
                  saveEditTodo={saveEditTodo}
                  toggleComplete={toggleComplete}
                  startEditing={startEditing}
                  handleDeleteClick={handleDeleteClick}
                  handleArchiveClick={handleArchiveClick}
                  activeTab={activeTab}
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
        {/* <Notification /> */}
      </CardContent>
    </Card>
  );
};

export default TodoApp;
