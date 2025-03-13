import React from "react";
import { CircleX } from "lucide-react";
import PropTypes from "prop-types";

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div onClick={onClose}>
        <CircleX
          size={24}
          color="#ff0000"
          className="cursor-pointer hover:opacity-80"
        />
      </div>
    </div>
  );
}

ModalHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalHeader;