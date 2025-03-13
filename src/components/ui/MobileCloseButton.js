import React from "react";
import { CircleX } from "lucide-react";

function MobileCloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
      aria-label="Close"
    >
      <CircleX size={24} />
    </button>
  );
}

export default MobileCloseButton;
