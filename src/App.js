import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TodoApp from "./components/TodoApp";
import MobileTodoApp from "./components/MobileTodoApp";
import ProfilePage from "./components/ProfilePage";
import AuthComponent from "./components/AuthComponent";
import JoinWithUrl from "./components/JoinWithUrl";
import { db } from "./firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [activeTab, setActiveTab] = useState("group");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Firebase'den gelen kullanıcıyı güncelle
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <TodoApp
              user={user} // user durumunu props olarak geçir
              setUser={setUser} // setUser'ı da geçir
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/login"
          element={<AuthComponent onAuthSuccess={setUser} />}
        />
        <Route
          path="/join"
          element={
            <JoinWithUrl
              db={db}
              user={user}
              setUser={setUser}
              setSelectedGroupId={setSelectedGroupId}
              setActiveTab={setActiveTab}
            />
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;