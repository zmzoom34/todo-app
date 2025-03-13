import React from "react";
import PropTypes from "prop-types";
import { Save } from "lucide-react";

function SaveButton({ onClick, isSubmitting }) {
  return (
    <div className="flex justify-end mt-4">
      <div
        onClick={isSubmitting ? null : onClick}
        className={`flex items-center ${
          isSubmitting ? "opacity-50" : "cursor-pointer hover:opacity-80"
        }`}
      >
        <Save size={24} color="#0000ff" className="mr-1" />
        <span className="text-blue-600 font-medium">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </span>
      </div>
    </div>
  );
}

SaveButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default SaveButton;