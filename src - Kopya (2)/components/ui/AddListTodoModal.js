import React, { useState, useEffect } from 'react'; // useEffect'i ekledik
import PropTypes from 'prop-types';

function AddListTodoModal({ isOpen, onClose, listName, onSave }) {
    const [inputValue, setInputValue] = useState("");

    // Modal açıldığında inputValue'yu sıfırla
    useEffect(() => {
        if (isOpen) {
            setInputValue(""); // Her açılışta boş hale getir
        }
    }, [isOpen]); // isOpen değiştiğinde tetiklenir

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSave?.(inputValue.trim());
            onClose();
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
                        {listName ? 'Edit List' : 'Add New List'}
                    </h2>
                    <button
                        className="text-2xl text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label 
                            htmlFor="listNameInput" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            List Name
                        </label>
                        <input
                            id="listNameInput"
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Enter list name"
                            autoFocus
                            required
                            maxLength={50}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {listName ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

AddListTodoModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    listName: PropTypes.string,
    user: PropTypes.object,
    onSave: PropTypes.func.isRequired,
};

export default AddListTodoModal;