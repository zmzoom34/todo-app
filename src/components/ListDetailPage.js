import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { CheckCircle, Circle, Edit, Trash, ArrowLeft, Plus } from "lucide-react";
import { getAuth } from "firebase/auth";
import { db } from "../firebase-config"; // Adjust this import

function ListDetailPage() {
  const { listId, groupId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodoText, setNewTodoText] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;
  
  const isGroupList = !!groupId;
  
  useEffect(() => {
    if (!user && !isGroupList) {
      navigate("/login");
      return;
    }

    // Fetch list details
    const listPath = isGroupList 
      ? `groups/${groupId}/lists/${listId}`
      : `users/${user.uid}/lists/${listId}`;
    
    const listDocRef = doc(db, listPath);
    const unsubscribeList = onSnapshot(listDocRef, (doc) => {
      if (doc.exists()) {
        setList({ id: doc.id, ...doc.data() });
      } else {
        // List not found
        navigate(-1);
      }
    });

    // Fetch todos
    const todosPath = `${listPath}/todos`;
    const todosRef = collection(db, todosPath);
    
    const unsubscribeTodos = onSnapshot(todosRef, (snapshot) => {
      const todosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort todos: uncompleted first, then by creation time
      todosData.sort((a, b) => {
        if (a.completed === b.completed) {
          return new Date(b.timestamp) - new Date(a.timestamp);
        }
        return a.completed ? 1 : -1;
      });
      
      setTodos(todosData);
      setLoading(false);
    });

    return () => {
      unsubscribeList();
      unsubscribeTodos();
    };
  }, [listId, groupId, user, navigate]);

  const handleToggleComplete = async (todoId, currentStatus) => {
    try {
      const todoPath = isGroupList
        ? `groups/${groupId}/lists/${listId}/todos/${todoId}`
        : `users/${user.uid}/lists/${listId}/todos/${todoId}`;
      
      await updateDoc(doc(db, todoPath), {
        completed: !currentStatus
      });
    } catch (error) {
      console.error("Error toggling todo status:", error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      const todoPath = isGroupList
        ? `groups/${groupId}/lists/${listId}/todos/${todoId}`
        : `users/${user.uid}/lists/${listId}/todos/${todoId}`;
      
      await deleteDoc(doc(db, todoPath));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    
    try {
      const todosPath = isGroupList
        ? `groups/${groupId}/lists/${listId}/todos`
        : `users/${user.uid}/lists/${listId}/todos`;
      
      await addDoc(collection(db, todosPath), {
        text: newTodoText,
        completed: false,
        timestamp: new Date().toISOString()
      });
      
      setNewTodoText("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 text-green-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">{list?.listName}</h1>
      </div>

      {/* Add new todo form */}
      <form onSubmit={handleAddTodo} className="mb-6 flex">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new item..."
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded-r-md hover:bg-green-600 flex items-center"
        >
          <Plus size={20} />
        </button>
      </form>

      {/* Todo list */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No items in this list yet.</p>
        ) : (
          todos.map((todo) => (
            <div 
              key={todo.id} 
              className={`flex items-center justify-between p-3 border rounded-md ${
                todo.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => handleToggleComplete(todo.id, todo.completed)}
                  className={`mr-3 ${todo.completed ? "text-green-500" : "text-gray-400"}`}
                >
                  {todo.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                </button>
                <span className={todo.completed ? "line-through text-gray-500" : ""}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ListDetailPage;