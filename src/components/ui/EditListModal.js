import React, { useState, useEffect } from "react";
import { Save, CircleX } from "lucide-react";
import PropTypes from "prop-types";
import { doc, updateDoc } from "firebase/firestore";
import ModalHeader from "./ModalHeader";
import ListNameField from "./ListNameField";
import FieldsSection from "./FieldsSection";
import ErrorMessage from "./ErrorMessage";
import SaveButton from "./SaveButton";

function EditListModal({
  isOpen,
  onClose,
  list,
  db,
  activeTab,
  user,
  selectedGroupId,
  onSave,
}) {
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
    // if (!validateForm()) {
    //   return;
    // }

    setIsSubmitting(true);

    try {
      const parentCollection = activeTab === "user" ? "users" : "groups";
      const parentId = activeTab === "user" ? user.uid : selectedGroupId;
      const listCollection = list.todoParameters === undefined ? "lists" : "listsAdvanced";

      console.log("listCollection", listCollection);
      console.log("parentCollection", parentCollection);
      console.log("parentId", parentId);
      console.log("list.id", list.id);  
      console.log("activeTab", activeTab);  

      const listDocRef = doc(
        db,
        parentCollection,
        parentId,
        listCollection,
        list.id
      );

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
        <ModalHeader title="Edit Advanced List" onClose={onClose} />
        
        <ListNameField 
          value={formValues.listName}
          onChange={handleInputChange}
          error={errors.listName}
        />
        
        {activeTab !== "user" && list.todoParameters != null && (
          <FieldsSection
            todoParameters={formValues.todoParameters}
            errors={errors}
            handleFieldConfigChange={handleFieldConfigChange}
            handleOptionsChange={handleOptionsChange}
            addNewField={addNewField}
            removeField={removeField}
          />
        )}

        {errors.submit && <ErrorMessage message={errors.submit} />}

        <SaveButton onClick={handleSave} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

EditListModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  list: PropTypes.object,
  db: PropTypes.object.isRequired,
  user: PropTypes.object,
  activeTab: PropTypes.string.isRequired,
  selectedGroupId: PropTypes.string,
  onSave: PropTypes.func,
};

export default EditListModal;