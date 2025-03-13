import React from 'react';

const PlusButton = ({ onClick }) => {
  return (
    <div className="relative w-[35px] h-[35px] group my-4 mr-2">
      <button
        onClick={onClick}
        className="
          absolute
          w-full
          h-full
          bg-white
          border-2
          border-[#095776]
          top-1/2
          left-1/2
          -translate-x-1/2
          -translate-y-1/2
          cursor-pointer
          hover:bg-[#095776]
          transition-all
          duration-200"
      >
        {/* Horizontal line */}
        <span
          className="
            absolute
            w-1/2
            h-0.5
            bg-[#095776]
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            group-hover:bg-white
            transition-all
            duration-200"
        ></span>
        
        {/* Vertical line */}
        <span
          className="
            absolute
            w-0.5
            h-1/2
            bg-[#095776]
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            group-hover:bg-white
            transition-all
            duration-200"
        ></span>
      </button>
    </div>
  );
};

export default PlusButton;