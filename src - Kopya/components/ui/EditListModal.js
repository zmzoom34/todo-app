import React, { useState, useEffect } from "react";
import { Save, CircleX, Plus, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { doc, updateDoc } from "firebase/firestore";

function EditAdvancedListModal({
  isOpen,
  onClose,
  list,
  db,
  activeTab,
  user,
  selectedGroupId,
  onSave,
}) {
  const availableFieldTypes = [
    { id: "text", type: "text" },
    { id: "textarea", type: "textarea" },
    { id: "select", type: "select" },
    { id: "date", type: "date" },
    { id: "checkbox", type: "checkbox" },
  ];

  console.log(activeTab)

  const [formValues, setFormValues] = useState({
    listName: "",
    todoParameters: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && list) {
      setFormValues({
        listName: list.listName || "",
        todoParameters: list.todoParameters || [],
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, list]);

  if (!isOpen || !list) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name] && value.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFieldConfigChange = (index, key, value) => {
    setFormValues((prev) => {
      const updatedParameters = [...prev.todoParameters];
      updatedParameters[index] = {
        ...updatedParameters[index],
        [key]: value,
      };
      return {
        ...prev,
        todoParameters: updatedParameters,
      };
    });
  };

  const handleOptionsChange = (index, optionsInput) => {
    const options = optionsInput
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt);
    handleFieldConfigChange(index, "options", options);
  };

  const addNewField = (type) => {
    const fieldId = `field_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setFormValues((prev) => ({
      ...prev,
      todoParameters: [
        ...prev.todoParameters,
        {
          id: fieldId,
          label: "",
          type: type,
          options: type === "select" ? [] : null,
          value: null,
          required: false,
        },
      ],
    }));
  };

  const removeField = (index) => {
    setFormValues((prev) => {
      const updatedParameters = [...prev.todoParameters];
      updatedParameters.splice(index, 1);
      return {
        ...prev,
        todoParameters: updatedParameters,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.listName.trim()) {
      newErrors.listName = "List name is required";
    }

    if (
      !Array.isArray(formValues.todoParameters) ||
      formValues.todoParameters.length === 0
    ) {
      newErrors.todoParameters = "At least one field must be selected";
    }

    formValues.todoParameters.forEach((param, index) => {
      if (!param.label.trim()) {
        newErrors[`field-${index}`] = "Field label is required";
      }

      if (
        param.type === "select" &&
        (!param.options || param.options.length === 0)
      ) {
        newErrors[`field-${index}`] =
          "At least one option is required for select fields";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for authentication
      // if (!user || !user.uid) {
      //   console.warn("User not authenticated, using alternative save method");

      //   // If onSave prop is provided, use it as an alternative method
      //   if (typeof onSave === 'function') {
      //     // Update each parameter to ensure it has required property based on title
      //     const updatedParameters = formValues.todoParameters.map(param => ({
      //       ...param,
      //       required: param.label.toLowerCase().includes("title") ? true : false,
      //     }));

      //     const updatedList = {
      //       ...list,
      //       listName: formValues.listName,
      //       todoParameters: updatedParameters,
      //       lastUpdated: new Date().toISOString(),
      //     };

      //     onSave(updatedList);
      //     onClose();
      //     return;
      //   } else {
      //     throw new Error("User not authenticated and no fallback save method provided");
      //   }
      // }

      // Normal Firebase save path
      const parentCollection = activeTab === "user" ? "users" : "groups";
      const parentId = activeTab === "user" ? user.uid : selectedGroupId;
      const listCollection = activeTab === "user" ? "lists" : "listsAdvanced";
      const listDocRef = doc(
        db,
        parentCollection,
        parentId,
        listCollection,
        list.id
      );
      console.log(listDocRef);

      // Update each parameter to ensure it has required property based on title
      const updatedParameters = formValues.todoParameters.map((param) => ({
        ...param,
        required: param.label.toLowerCase().includes("title") ? true : false,
      }));

      await updateDoc(listDocRef, {
        listName: formValues.listName,
        todoParameters: updatedParameters,
        lastUpdated: new Date().toISOString(),
      });

      onClose();
    } catch (error) {
      console.error("Error updating list structure:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Advanced List</h2>
          <div onClick={onClose}>
            <CircleX
              size={24}
              color="#ff0000"
              className="cursor-pointer hover:opacity-80"
            />
          </div>
        </div>

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
            value={formValues.listName}
            onChange={handleInputChange}
            placeholder="Enter list name"
            className={`w-full px-3 py-2 border ${
              errors.listName ? "border-red-500" : "border-gray-300"
            } rounded-md`}
          />
          {errors.listName && (
            <p className="mt-1 text-sm text-red-600">{errors.listName}</p>
          )}
        </div>

        {activeTab !== "user" && formValues.todoParameters != null && (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-medium text-gray-700">
        Fields
      </label>
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
      <p className="mt-1 text-sm text-red-600 mb-2">
        {errors.todoParameters}
      </p>
    )}

    <div className="space-y-3">
      {formValues.todoParameters.map((param, index) => (
        <div
          key={param.id || index}
          className="border p-3 rounded-md bg-gray-50"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Field ({param.type})
            </span>
            <Trash2
              size={18}
              className="text-red-500 cursor-pointer"
              onClick={() => removeField(index)}
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Label
              </label>
              <input
                type="text"
                value={param.label}
                onChange={(e) =>
                  handleFieldConfigChange(index, "label", e.target.value)
                }
                placeholder="Enter field label"
                className={`w-full px-2 py-1 border ${
                  errors[`field-${index}`] ? "border-red-500" : "border-gray-300"
                } rounded-md text-sm`}
              />
              {errors[`field-${index}`] && (
                <p className="mt-1 text-xs text-red-600">
                  {errors[`field-${index}`]}
                </p>
              )}
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
      ))}
    </div>
  </div>
)}

        {errors.submit && (
          <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <div
            onClick={isSubmitting ? null : handleSave}
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
      </div>
    </div>
  );
}

EditAdvancedListModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  list: PropTypes.object,
  db: PropTypes.object.isRequired,
  user: PropTypes.object,
  activeTab: PropTypes.string.isRequired,
  selectedGroupId: PropTypes.string,
  onSave: PropTypes.func, // Added this as an alternative save method
};

export default EditAdvancedListModal;
