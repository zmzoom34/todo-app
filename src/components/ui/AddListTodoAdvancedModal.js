import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, collection, addDoc } from 'firebase/firestore';

function AddListTodoAdvancedModal({ isOpen, onClose, listName, db, user, activeTab, selectedGroupId }) {
    const availableFieldTypes = [
        { id: "text", type: "text" },
        { id: "textarea", type: "textarea" },
        { id: "select", type: "select" },
        { id: "date", type: "date" },
    ];

    const createInitialState = () => ({
        listName: listName || "",
        selectedFields: [],
        fieldConfigs: {},
    });

    const [formValues, setFormValues] = useState(createInitialState());
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormValues(createInitialState());
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, listName]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name] && value.trim()) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const addNewField = (type) => {
        const fieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setFormValues(prev => ({
            ...prev,
            selectedFields: [...prev.selectedFields, fieldId],
            fieldConfigs: {
                ...prev.fieldConfigs,
                [fieldId]: { type, label: "", options: type === "select" ? [] : null },
            },
        }));
    };

    const handleFieldRemove = (fieldId) => {
        setFormValues(prev => {
            const newSelectedFields = prev.selectedFields.filter(id => id !== fieldId);
            const newFieldConfigs = { ...prev.fieldConfigs };
            delete newFieldConfigs[fieldId];
            return { ...prev, selectedFields: newSelectedFields, fieldConfigs: newFieldConfigs };
        });
    };

    const handleFieldConfigChange = (fieldId, key, value) => {
        setFormValues(prev => ({
            ...prev,
            fieldConfigs: {
                ...prev.fieldConfigs,
                [fieldId]: {
                    ...prev.fieldConfigs[fieldId],
                    [key]: value,
                },
            },
        }));
    };

    const handleOptionsChange = (fieldId, optionsInput) => {
        const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt);
        handleFieldConfigChange(fieldId, 'options', options);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formValues.listName.trim()) {
            newErrors.listName = "List name is required";
        }

        if (!Array.isArray(formValues.selectedFields) || formValues.selectedFields.length === 0) {
            newErrors.selectedFields = "At least one field must be selected";
        }

        formValues.selectedFields.forEach(fieldId => {
            const config = formValues.fieldConfigs[fieldId];
            if (!config.label.trim()) {
                newErrors[fieldId] = "Field label is required";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addListTodoAdvanced = async () => {
        console.log("Saving list structure:", formValues);

        if (!formValues.listName.trim()) {
            console.log("Empty list name, aborting");
            return;
        }

        setIsSubmitting(true);

        try {
            if (!user || !user.uid) {
                throw new Error("User not authenticated");
            }

            const parentCollection = activeTab === "personal" ? "users" : "groups";
            const parentId = activeTab === "personal" ? user.uid : selectedGroupId;
            const parentDocRef = doc(db, parentCollection, parentId);
            const listsCollectionRef = collection(parentDocRef, "listsAdvanced");

            const selectedFieldDefinitions = formValues.selectedFields.map(fieldId => {
                const config = formValues.fieldConfigs[fieldId];
                return {
                    id: fieldId,
                    label: config.label,
                    type: config.type,
                    options: config.options || null,
                    value: null, // Always null as per request
                    required: config.label.toLowerCase().includes("title") ? true : false,
                };
            });

            const listData = {
                listName: formValues.listName,
                todoParameters: selectedFieldDefinitions,
                timestamp: new Date().toISOString(),
            };

            const docRef = await addDoc(listsCollectionRef, listData);

            console.log("List structure added with ID:", docRef.id);
            onClose();
        } catch (error) {
            console.error("Error adding list structure:", error);
            setErrors(prev => ({
                ...prev,
                submit: error.message,
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            addListTodoAdvanced();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onKeyDown={handleKeyDown}
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {listName ? 'Edit List Structure' : 'Create New List Structure'}
                    </h2>
                    <button
                        className="text-2xl text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="listNameInput"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            List Name
                        </label>
                        <input
                            id="listNameInput"
                            name="listName"
                            type="text"
                            value={formValues.listName}
                            onChange={handleInputChange}
                            placeholder="Enter list name"
                            autoFocus
                            maxLength={50}
                            className={`w-full px-3 py-2 border ${errors.listName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                        {errors.listName && (
                            <p className="mt-1 text-sm text-red-600">{errors.listName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Todo Fields
                        </label>
                        <div className="mb-4">
                            <select
                                onChange={(e) => addNewField(e.target.value)}
                                value=""
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="" disabled>Select field type to add</option>
                                {availableFieldTypes.map(field => (
                                    <option key={field.id} value={field.type}>
                                        {field.type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-4">
                            {formValues.selectedFields.map(fieldId => {
                                const config = formValues.fieldConfigs[fieldId];
                                return (
                                    <div key={fieldId} className="flex flex-col border p-2 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                Field ({config.type})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleFieldRemove(fieldId)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <label
                                                    htmlFor={`${fieldId}-label`}
                                                    className="block text-xs text-gray-600"
                                                >
                                                    Label
                                                </label>
                                                <input
                                                    id={`${fieldId}-label`}
                                                    type="text"
                                                    value={config.label}
                                                    onChange={(e) => handleFieldConfigChange(fieldId, 'label', e.target.value)}
                                                    placeholder="Enter field label"
                                                    className={`w-full px-2 py-1 border ${errors[fieldId] ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
                                                />
                                                {errors[fieldId] && (
                                                    <p className="mt-1 text-xs text-red-600">{errors[fieldId]}</p>
                                                )}
                                            </div>
                                            {config.type === "select" && (
                                                <div>
                                                    <label
                                                        htmlFor={`${fieldId}-options`}
                                                        className="block text-xs text-gray-600"
                                                    >
                                                        Options (comma-separated)
                                                    </label>
                                                    <input
                                                        id={`${fieldId}-options`}
                                                        type="text"
                                                        value={config.options?.join(", ") || ""}
                                                        onChange={(e) => handleOptionsChange(fieldId, e.target.value)}
                                                        placeholder="e.g., low, medium, high"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.selectedFields && (
                            <p className="mt-1 text-sm text-red-600">{errors.selectedFields}</p>
                        )}
                    </div>

                    {errors.submit && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                            {errors.submit}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Saving...' : (listName ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

AddListTodoAdvancedModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    listName: PropTypes.string,
    db: PropTypes.object.isRequired,
    user: PropTypes.object,
    activeTab: PropTypes.string.isRequired,
    selectedGroupId: PropTypes.string,
};

export default AddListTodoAdvancedModal;