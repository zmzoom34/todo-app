import React from "react";
import PropTypes from "prop-types";

function ListNameField({ value, onChange, error }) {
  return (
    <div className="mb-4">
      <label
        htmlFor="listName"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        List Name
      </label>
      <input
        id="listName"
        name="listName"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Enter list name"
        className={`w-full px-3 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

ListNameField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default ListNameField;