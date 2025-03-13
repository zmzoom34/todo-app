import React from "react";
import {
  Users,
  CirclePlus,
  List,
  ListTodo,
} from "lucide-react";
import { Button } from "../components/ui/button";
import AddTodoModal from "./ui/AddTodoModal";
import AddTodoDirectArchiveModal from "./ui/AddTodoDirectArchiveModal";
import TodoList from "../components/TodoList";
import "react-toastify/ReactToastify.css";
import ExpandableListAll from "./ui/ExpandableListAll";
import ListsWithReports from "./ui/ListsWithReport";
import Tooltip from "./ui/Tooltip";
import ReportModal from "./ReportModal";

const TabContent = ({
  activeTab,
  todos,
  todosAll,
  groupTodos,
  filteredArchivedTodos,
  userLists,
  groupLists,
  groupListsAdvanced,
  groups,
  editingId,
  editText,
  setEditText,
  saveEdit,
  saveEditTodo,
  toggleComplete,
  startEditing,
  handleDeleteClick,
  handleArchiveClick,
  nickName,
  setEditingId,
  setEditCategory,
  setEditAmount,
  setEditUnit,
  editAmount,
  categories,
  stores,
  units,
  editTodo,
  setEditTodo,
  selectedGroupId,
  setSelectedGroupId,
  isModalAddTodoOpen,
  setIsModalAddTodoOpen,
  setIsModalAddListTodoOpen,
  setIsModalAddListTodoAdvancedOpen,
  isModalAddTodoDirectArchiveOpen,
  setIsModalAddTodoDirectArchiveOpen,
  isReportModalOpen,
  closeReportModal,
  newTodo,
  setNewTodo,
  newTodoAmount,
  setNewTodoAmount,
  newTodoUnit,
  setNewTodoUnit,
  newTodoCategory,
  setNewTodoCategory,
  newTodoPrice,
  setNewTodoPrice,
  newTodoBrand,
  setNewTodoBrand,
  newTodoStore,
  setNewTodoStore,
  newTodoDueDate,
  setNewTodoDueDate,
  inputAddTodoRef,
  addTodo,
  addTodoDirectArchive,
  handleDeleteList,
  expandedListId,
  setExpandedListId,
  setShowGroupSettings,
  loadingUserList,
  loadingGroupList,
  loadingGroupListAdvanced,
  selectedMonth,
  setSelectedMonth,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  generateMonthlyReport,
  monthlyReport,
  user,
  db
}) => {
  // Ortak renderlanacak TodoList bileşeni
  const renderTodoList = (todoItems) => (
    <TodoList
      todos={todoItems}
      editingId={editingId}
      editText={editText}
      setEditText={setEditText}
      saveEdit={saveEdit}
      saveEditTodo={saveEditTodo}
      toggleComplete={toggleComplete}
      startEditing={startEditing}
      handleDeleteClick={handleDeleteClick}
      handleArchiveClick={handleArchiveClick}
      activeTab={activeTab}
      nickName={nickName}
      setEditingId={setEditingId}
      setEditCategory={setEditCategory}
      setEditAmount={setEditAmount}
      setEditUnit={setEditUnit}
      editAmount={editAmount}
      categories={categories}
      stores={stores}
      units={units}
      editTodo={editTodo}
      setEditTodo={setEditTodo}
    />
  );

  // Ortak renderlanacak ExpandableListAll bileşeni
  const renderExpandableLists = (lists, type = null, groupId = null, listType = "lists") => (
    <div className="space-y-2 mb-2">
      {lists.map((list) => (
        <ExpandableListAll
          key={list.id}
          list={list}
          onDelete={handleDeleteList}
          user={user}
          db={db}
          type={type}
          groupId={groupId}
          expandedListId={expandedListId}
          setExpandedListId={setExpandedListId}
          listType={listType}
          groups={type === "group" && listType === "listsAdvanced" ? groups : undefined}
        />
      ))}
    </div>
  );

  // Kişisel tab içeriği
  const renderPersonalTab = () => (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <Tooltip text="Todo ekle" position="right">
            <CirclePlus
              onClick={() => setIsModalAddTodoOpen(true)}
              className="h-6 w-6 sm:h-8 sm:w-8 cursor-pointer"
            />
          </Tooltip>
          <Tooltip text="Yeni todo listesi" position="right">
            <List
              onClick={() => setIsModalAddListTodoOpen(true)}
              className="h-6 w-6 sm:h-8 sm:w-8 cursor-pointer"
            />
          </Tooltip>
        </div>

        <AddTodoModal
          todos={todosAll}
          isOpen={isModalAddTodoOpen}
          onClose={() => setIsModalAddTodoOpen(false)}
          addTodo={addTodo}
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          newTodoAmount={newTodoAmount}
          setNewTodoAmount={setNewTodoAmount}
          newTodoUnit={newTodoUnit}
          setNewTodoUnit={setNewTodoUnit}
          setNewTodoCategory={setNewTodoCategory}
          newTodoCategory={newTodoCategory}
          inputRef={inputAddTodoRef}
          categories={categories}
          stores={stores}
          units={units}
          newTodoDueDate={newTodoDueDate}
          setNewTodoDueDate={setNewTodoDueDate}
          todoType="personal"
        />
      </div>

      <div className="mb-2">
        {loadingUserList ? (
          <div className="text-sm">Loading lists...</div>
        ) : userLists.length > 0 ? (
          renderExpandableLists(userLists, "user", selectedGroupId, "lists")
        ) : (
          <></>
        )}
      </div>

      {renderTodoList(todos)}
    </>
  );

  // Grup tab içeriği
  const renderGroupTab = () => (
    <>
      {groups.length > 0 ? (
        <>
          <div className="mb-4">
            <select
              className="w-full p-2 text-sm sm:text-base border rounded-md"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between z-40">
              <Tooltip text="Todo ekle" position="right">
                <CirclePlus
                  onClick={() => setIsModalAddTodoOpen(true)}
                  className="h-6 w-6 sm:h-8 sm:w-8 cursor-pointer mb-3"
                />
              </Tooltip>
              <Tooltip text="Yeni todo listesi" position="left">
                <List
                  onClick={() => setIsModalAddListTodoOpen(true)}
                  className="h-6 w-6 sm:h-8 sm:w-8 cursor-pointer mb-2"
                />
              </Tooltip>
              <Tooltip text="Yeni gelişmiş todo listesi" position="left">
                <ListTodo
                  onClick={() => setIsModalAddListTodoAdvancedOpen(true)}
                  className="h-6 w-6 sm:h-8 sm:w-8 cursor-pointer mb-2"
                />
              </Tooltip>
            </div>

            <AddTodoModal
              todos={todosAll}
              isOpen={isModalAddTodoOpen}
              onClose={() => {
                setIsModalAddTodoOpen(false);
                setNewTodo("");
                setNewTodoCategory("");
                setNewTodoAmount("");
                setNewTodoUnit("");
                setNewTodoPrice("");
              }}
              addTodo={addTodo}
              newTodo={newTodo}
              setNewTodo={setNewTodo}
              newTodoAmount={newTodoAmount}
              setNewTodoAmount={setNewTodoAmount}
              newTodoUnit={newTodoUnit}
              setNewTodoUnit={setNewTodoUnit}
              setNewTodoCategory={setNewTodoCategory}
              newTodoCategory={newTodoCategory}
              inputRef={inputAddTodoRef}
              categories={categories}
              todoType="group"
              units={units}
            />
          </div>

          {renderTodoList(groupTodos)}
          
          <div className="mb-2">
            {loadingGroupListAdvanced ? (
              <div className="text-sm">Loading lists Advanced...</div>
            ) : groupListsAdvanced.length > 0 ? (
              renderExpandableLists(groupListsAdvanced, "group", selectedGroupId, "listsAdvanced")
            ) : (
              <></>
            )}
          </div>
          
          <div className="mb-2">
            {loadingGroupList ? (
              <div className="text-sm">Loading lists...</div>
            ) : groupLists.length > 0 ? (
              renderExpandableLists(groupLists, "group", selectedGroupId, "lists")
            ) : (
              <div className="text-gray-500 text-center py-4"></div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <p className="text-gray-500 text-sm sm:text-base">
            Henüz bir gruba üye değilsiniz.
          </p>
          <Button
            variant="outline"
            className="mt-3 sm:mt-4 text-xs sm:text-sm"
            onClick={() => setShowGroupSettings(true)}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Gruplara Katıl
          </Button>
        </div>
      )}
    </>
  );

  // Arşiv tab içeriği
  const renderArchiveTab = () => (
    <>
      {groups.length > 0 ? (
        <>
          <div className="mb-4">
            <select
              className="w-full p-2 text-sm sm:text-base border rounded-md"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-1 sm:p-2 text-xs sm:text-sm border rounded-md"
              />
              <button
                onClick={generateMonthlyReport}
                className="text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md"
              >
                📝
              </button>
            </div>

            <CirclePlus
              className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer"
              onClick={() => setIsModalAddTodoDirectArchiveOpen(true)}
            />
            
            <AddTodoDirectArchiveModal
              todos={todosAll}
              isOpen={isModalAddTodoDirectArchiveOpen}
              onClose={() => {
                setIsModalAddTodoDirectArchiveOpen(false);
                setNewTodo("");
                setNewTodoCategory("");
                setNewTodoAmount("");
                setNewTodoUnit("");
                setNewTodoPrice("");
                setNewTodoBrand("");
                setNewTodoStore("");
              }}
              addTodoDirectArchive={addTodoDirectArchive}
              newTodo={newTodo}
              setNewTodo={setNewTodo}
              newTodoAmount={newTodoAmount}
              setNewTodoAmount={setNewTodoAmount}
              newTodoPrice={newTodoPrice}
              setNewTodoPrice={setNewTodoPrice}
              newTodoUnit={newTodoUnit}
              setNewTodoUnit={setNewTodoUnit}
              setNewTodoCategory={setNewTodoCategory}
              newTodoCategory={newTodoCategory}
              inputRef={inputAddTodoRef}
              categories={categories}
              todoType="archive"
              stores={stores}
              units={units}
              newTodoBrand={newTodoBrand}
              setNewTodoBrand={setNewTodoBrand}
              newTodoStore={newTodoStore}
              setNewTodoStore={setNewTodoStore}
            />
          </div>

          {isReportModalOpen && (
            <ReportModal
              isOpen={isReportModalOpen}
              onClose={closeReportModal}
              reportData={monthlyReport}
              categories={categories}
            />
          )}

          <div className="mb-4 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Arşivde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm sm:text-base border rounded-md"
            />

            <select
              className="p-2 text-sm sm:text-base border rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <TodoList
            classList="mb-2"
            todos={filteredArchivedTodos}
            editingId={editingId}
            editText={editText}
            setEditText={setEditText}
            saveEdit={saveEdit}
            saveEditTodo={saveEditTodo}
            toggleComplete={toggleComplete}
            startEditing={startEditing}
            handleDeleteClick={handleDeleteClick}
            handleArchiveClick={handleArchiveClick}
            activeTab={activeTab}
            nickName={nickName}
            setEditingId={setEditingId}
            setEditCategory={setEditCategory}
            setEditAmount={setEditAmount}
            setEditUnit={setEditUnit}
            editAmount={editAmount}
            categories={categories}
            stores={stores}
            units={units}
            editTodo={editTodo}
            setEditTodo={setEditTodo}
          />
        </>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <p className="text-gray-500 text-sm sm:text-base">
            Henüz bir gruba üye değilsiniz.
          </p>
          <Button
            variant="outline"
            className="mt-3 sm:mt-4 text-xs sm:text-sm"
            onClick={() => setShowGroupSettings(true)}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Gruplara Katıl
          </Button>
        </div>
      )}
    </>
  );

  // Aktif taba göre içerik render etme
  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalTab();
      case 'group':
        return renderGroupTab();
      case 'archive':
        return renderArchiveTab();
      default:
        return renderPersonalTab();
    }
  };

  return (
    <div className="tab-content">
      {renderContent()}
    </div>
  );
};

export default TabContent;