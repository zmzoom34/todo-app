import React from "react";
import PropTypes from "prop-types";
import { Plus } from "lucide-react";
import FieldItem from "./FieldItem";

function FieldsSection({
  todoParameters,
  errors,
  handleFieldConfigChange,
  handleOptionsChange,
  addNewField,
  removeField,
}) {
  const availableFieldTypes = [
    { id: "text", type: "text" },
    { id: "textarea", type: "textarea" },
    { id: "select", type: "select" },
    { id: "date", type: "date" },
    { id: "checkbox", type: "checkbox" },
  ];

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">Fields</label>
        <div className="flex items-center">
          <select
            onChange={(e) => {
              if (e.target.value) {
                addNewField(e.target.value);
                e.target.value = "";
              }
            }}
            value=""
            className="px-2 py-1 border border-gray-300 rounded-md text-sm mr-2"
          >
            <option value="" disabled>
              Add field
            </option>
            {availableFieldTypes.map((field) => (
              <option key={field.id} value={field.type}>
                {field.type}
              </option>
            ))}
          </select>
          <Plus
            size={20}
            className="text-blue-500 cursor-pointer"
            onClick={() => addNewField("text")}
          />
        </div>
      </div>

      {errors.todoParameters && (
        <p className="mt-1 text-sm text-red-600 mb-2">{errors.todoParameters}</p>
      )}

      <div className="space-y-3">
        {todoParameters.map((param, index) => (
          <FieldItem
            key={param.id || index}
            param={param}
            index={index}
            error={errors[`field-${index}`]}
            handleFieldConfigChange={handleFieldConfigChange}
            handleOptionsChange={handleOptionsChange}
            removeField={removeField}
          />
        ))}
      </div>
    </div>
  );
}

FieldsSection.propTypes = {
  todoParameters: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
  handleFieldConfigChange: PropTypes.func.isRequired,
  handleOptionsChange: PropTypes.func.isRequired,
  addNewField: PropTypes.func.isRequired,
  removeField: PropTypes.func.isRequired,
};

export default FieldsSection;