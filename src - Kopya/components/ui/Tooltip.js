import React, { useState } from 'react';

const Tooltip = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position-specific classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  // Arrow classes based on position
  const arrowClasses = {
    top: 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-gray-800',
    bottom: 'top-[-5px] left-1/2 -translate-x-1/2 border-b-gray-800',
    left: 'right-[-5px] top-1/2 -translate-y-1/2 border-l-gray-800',
    right: 'left-[-5px] top-1/2 -translate-y-1/2 border-r-gray-800',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute bg-white text-gray-800 px-4 py-2 rounded-md text-xs 
            z-20 whitespace-nowrap border border-gray-300 shadow-[0px_12px_30px_-4px_rgba(16,24,40,0.08)] 
            transition-opacity duration-300 ${positionClasses[position]}
          `}
        >
          {text}
          <span
            className={`
              absolute w-0 h-0 border-[5px] border-transparent 
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;