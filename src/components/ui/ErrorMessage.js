import React from "react";
import PropTypes from "prop-types";

function ErrorMessage({ message }) {
  return (
    <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
      {message}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export default ErrorMessage;