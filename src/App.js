import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TodoApp from "./components/TodoApp";
import MobileTodoApp from "./components/MobileTodoApp";
import ProfilePage from "./components/ProfilePage";
import JoinWithUrl from "./components/JoinWithUrl";
import { db } from "./firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const auth = getAuth();
  const [user, setUser] = useState(null); // Initial state is null
  const [selectedGroupId, setSelectedGroupId] = useState(""); // Define state
  const [activeTab, setActiveTab] = useState("group"); // Define state

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state when auth changes
    });
    return () => unsubscribe(); // Cleanup
  }, [auth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoApp />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/join"
          element={
            <JoinWithUrl
              db={db}
              user={user}
              setUser={setUser} // Correctly passed
              setSelectedGroupId={setSelectedGroupId} // Pass actual state setter
              setActiveTab={setActiveTab} // Pass actual state setter
            />
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;