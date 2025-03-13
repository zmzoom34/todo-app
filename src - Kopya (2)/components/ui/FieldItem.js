import React from "react";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";

function FieldItem({
  param,
  index,
  error,
  handleFieldConfigChange,
  handleOptionsChange,
  removeField,
}) {
  return (
    <div className="border p-3 rounded-md bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Field ({param.type})</span>
        <Trash2
          size={18}
          className="text-red-500 cursor-pointer"
          onClick={() => removeField(index)}
        />
      </div>

      <div className="space-y-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Label</label>
          <input
            type="text"
            value={param.label}
            onChange={(e) =>
              handleFieldConfigChange(index, "label", e.target.value)
            }
            placeholder="Enter field label"
            className={`w-full px-2 py-1 border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-md text-sm`}
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        {param.type === "select" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Options (comma-separated)
            </label>
            <input
              type="text"
              value={param.options?.join(", ") || ""}
              onChange={(e) => handleOptionsChange(index, e.target.value)}
              placeholder="e.g., low, medium, high"
              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

FieldItem.propTypes = {
  param: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  error: PropTypes.string,
  handleFieldConfigChange: PropTypes.func.isRequired,
  handleOptionsChange: PropTypes.func.isRequired,
  removeField: PropTypes.func.isRequired,
};

export default FieldItem;