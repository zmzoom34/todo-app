import React from "react";
import { CircleX } from "lucide-react";
import PropTypes from "prop-types";

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex justify-between items-center mb-4 relative">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button
        onClick={onClose}
        className="p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2"
        aria-label="Close"
      >
        <CircleX size={24} />
      </button>
    </div>
  );
}

ModalHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalHeader;