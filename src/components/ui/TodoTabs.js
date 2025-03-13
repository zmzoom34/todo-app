import React from "react";
import AllTodos from "../icons/mark.png";
import NotCompleted from "../icons/unfinished.png";
import Completed from "../icons/completed-task.png";
import TodoTabsButton from "./TodoTabsButton";

const TodoTabs = ({ activeTab, setActiveTab, todoCounts }) => {
  return (
    <div className="flex flex-wrap gap-2 my-4 justify-center sm:justify-start">
      <TodoTabsButton
        img={AllTodos}
        counts={todoCounts.total}
        onClick={() => setActiveTab("all")}
        activeTab={activeTab}
        tabType="all"
        borderColor="indigo-600"
      />
      <TodoTabsButton
        img={Completed}
        counts={todoCounts.completed}
        onClick={() => setActiveTab("completed")}
        activeTab={activeTab}
        tabType="completed"
        borderColor="green-600"
      />
      <TodoTabsButton
        img={NotCompleted}
        counts={todoCounts.notCompleted}
        onClick={() => setActiveTab("notCompleted")}
        activeTab={activeTab}
        tabType="notCompleted"
        borderColor="orange-500"
      />
    </div>
  );
};

export default TodoTabs;