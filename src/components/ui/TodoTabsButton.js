import React from "react";

function TodoTabsButton({ img, counts, activeTab, onClick, tabType, borderColor }) {
  // Create a mapping of color values to their corresponding Tailwind classes
  const colorMap = {
    'indigo-600': 'border-indigo-600',
    'green-600': 'border-green-600',
    'orange-500': 'border-orange-500',
    // Add other colors as needed
  };

  // Get the border class from the map or use a default
  const borderClass = activeTab === tabType ? colorMap[borderColor] || 'border-gray-300' : '';

  return (
    <button
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${borderClass}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className="mr-1">
          <img src={img} width={20} height={20} alt="" />
        </span>
        <span>({counts})</span>
      </div>
    </button>
  );
}

export default TodoTabsButton;