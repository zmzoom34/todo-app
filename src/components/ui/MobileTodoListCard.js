import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Copy,
  Edit,
  Trash,
  MoreVertical,
  ChevronRight,
} from "lucide-react";

const MobileTodoListCard = ({
  list,
  totalTodos,
  completedTodos,
  handleSpeak,
  openCopyModal,
  openEditListModal,
  handleDeleteList,
  setIsTodoListModalOpen,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsRef = useRef(null); // Create a ref to track the actions menu

  const toggleActions = (e) => {
    e.stopPropagation();
    setIsActionsOpen(!isActionsOpen);
  };

  // Handle clicks outside the actions menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    };

    // Add event listener when menu is open
    if (isActionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionsOpen]); // Dependency array includes isActionsOpen

  return (
    <div className="border rounded-md mb-2 bg-stone-100 border-green-400">
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsTodoListModalOpen(true)}
      >
        <div className="flex items-center space-x-2 flex-1">
          <span className="font-medium truncate">{list.listName}</span>
          {totalTodos > 0 && (
            <span className="text-sm text-gray-500">
              ({completedTodos}/{totalTodos})
            </span>
          )}
        </div>

        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSpeak();
            }}
            className="p-2 text-green-500 hover:text-green-700"
            aria-label="Read list name"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Wrap the button and menu in a relative container */}
          <div className="relative">
            <button
              onClick={toggleActions}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isActionsOpen && (
              <div
                ref={actionsRef}
                className="absolute bottom-full right-0 mb-2 bg-white shadow-lg rounded-md border border-gray-200 z-10 w-40"
              >
                <button
                  onClick={(e) => {
                    openCopyModal(e);
                    setIsActionsOpen(false);
                  }}
                  className="flex items-center p-3 w-full text-left hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4 mr-2 text-purple-500" />
                  <span>Copy list</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditListModal();
                    setIsActionsOpen(false);
                  }}
                  className="flex items-center p-3 w-full text-left hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Edit list</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList();
                    setIsActionsOpen(false);
                  }}
                  className="flex items-center p-3 w-full text-left hover:bg-gray-100"
                >
                  <Trash className="w-4 h-4 mr-2 text-red-500" />
                  <span>Delete list</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTodoListCard;
