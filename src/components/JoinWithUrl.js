import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useToast } from "../hooks/useToast";
import AuthComponent from "./AuthComponent"; // Import your AuthComponent

function JoinWithUrl({ db, user, setUser, setSelectedGroupId, setActiveTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const groupId = queryParams.get("groupId");
  const { showToastMessage } = useToast();
  const [error, setError] = useState(null);

  const defaultShowToastMessage = (message, type) =>
    console.log(`${type}: ${message}`);
  const toast = showToastMessage || defaultShowToastMessage;

  useEffect(() => {
    if (user === null) return; // Still loading

    if (user && user.uid && groupId) {
      console.log(`Joining group: ${groupId}`);
      handleJoinGroupFromUrl(groupId);
    }
  }, [groupId, navigate, user]);

  const handleJoinGroupFromUrl = async (groupId) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        toast("Invalid group link.", "warning");
        setError("Invalid group link.");
        return;
      }

      const groupData = groupSnap.data();

      if (groupData.members.includes(user.uid)) {
        toast("You are already a member of this group.", "info");
        setError("You are already a member of this group.");
        setSelectedGroupId(groupId);
        navigate("/"); // Redirect to home since they're already a member
        return;
      }

      const updatedMembers = [...groupData.members, user.uid];
      await updateDoc(groupRef, { members: updatedMembers });

      setSelectedGroupId(groupId);
      setActiveTab("group");
      toast(`Joined "${groupData.groupName}" successfully!`, "success");
      navigate("/"); // Redirect to home after successful join
    } catch (error) {
      console.error("Error joining group from URL:", error);
      toast(`Failed to join group: ${error.message}`, "error");
    }
  };

  // If user is not authenticated, show AuthComponent
  if (!user) {
    return <AuthComponent onAuthSuccess={setUser} />;
  }

  // Loading state
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Join Group</h1>
        {groupId ? (
          <div>
            <p className="text-gray-600">
              Joining group <span className="font-semibold">{groupId}</span>...
            </p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <div>
            <p className="text-red-500 mb-4">
              Invalid or missing group ID. Please use a valid invite link.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default JoinWithUrl;