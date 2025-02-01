import { useState } from 'react';

export const useModalState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenArchive, setIsModalOpenArchive] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [isModalAddTodoOpen, setIsModalAddTodoOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [selectedTodoArchive, setSelectedTodoArchive] = useState(null);

  const handleModalOpen = (type, todo = null) => {
    switch (type) {
      case 'delete':
        setSelectedTodo(todo);
        setIsModalOpen(true);
        break;
      case 'archive':
        setSelectedTodoArchive(todo);
        setIsModalOpenArchive(true);
        break;
      case 'profile':
        setIsProfileModalOpen(true);
        break;
      case 'groupSettings':
        setShowGroupSettings(true);
        break;
      case 'addTodo':
        setIsModalAddTodoOpen(true);
        break;
    }
  };

  const handleModalClose = (type) => {
    switch (type) {
      case 'delete':
        setIsModalOpen(false);
        setSelectedTodo(null);
        break;
      case 'archive':
        setIsModalOpenArchive(false);
        setSelectedTodoArchive(null);
        break;
      case 'profile':
        setIsProfileModalOpen(false);
        break;
      case 'groupSettings':
        setShowGroupSettings(false);
        break;
      case 'addTodo':
        setIsModalAddTodoOpen(false);
        break;
    }
  };

  return {
    modalStates: {
      isModalOpen,
      isModalOpenArchive,
      isProfileModalOpen,
      showGroupSettings,
      isModalAddTodoOpen,
      selectedTodo,
      selectedTodoArchive
    },
    handleModalOpen,
    handleModalClose
  };
};