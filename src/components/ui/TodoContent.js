import React from "react";
import { ThumbsUp, Pen, Settings } from "lucide-react";
import TimelineItem from "./TimelineItem";

const TodoContent = ({ todo }) => (
  <div className="flex-grow min-w-0 w-full sm:w-auto">
    <div className="flex items-center gap-2">
      <p className={`${todo.completed ? "line-through text-gray-500" : ""} break-words`}>
        {todo.text}
      </p>
    </div>
    <div className="space-y-1 mt-2">
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
    </div>
  </div>
);

export default TodoContent