import React, { useState } from 'react';
import { ThumbsUp, Pen, Settings, Clock, X } from 'lucide-react';
import TimelineItem from "./TimelineItem";

const TodoContent = ({ todo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex-grow min-w-0 w-full sm:w-auto">
      <div className="flex items-center gap-2">
        <p className={`${todo.completed ? "line-through text-gray-500" : ""} break-words`}>
          {todo.text}
          <span className="text-xs text-gray-600"> {todo.amount}</span>
          <span className="text-xs text-gray-600"> {todo.unit}</span>
        </p>
        
        <button 
          onClick={openModal}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Timeline History</h2>
              <button 
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3">
              {todo.completedBy && (
                <TimelineItem
                  icon={<ThumbsUp className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                  text={todo.completedBy}
                  date={todo.updatedAt}
                />
              )}
              <TimelineItem
                icon={<Pen className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                text={todo.createdBy}
                date={todo.createdAt}
              />
              {todo.updatedBy && (
                <TimelineItem
                  icon={<Settings className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                  text={todo.updatedBy}
                  date={todo.updatedAt}
                />
              )}
              {todo.prizeTL && (
                <p className='text-xs text-gray-600'>{todo.prizeTL} TL === {todo.prizeUSD} $ </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoContent;