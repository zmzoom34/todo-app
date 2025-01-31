import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import GroupList from "./GroupList";

const GroupSettingsModal = ({
  newGroupName,
  setNewGroupName,
  groupIdToJoin,
  setGroupIdToJoin,
  createGroup,
  joinGroup,
  groups,
  leaveGroup,
  deleteGroup,
  renameGroup,
  handleCopyToClipboard,
  setShowGroupSettings,
  user
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={() => setShowGroupSettings(false)}
    >
      <div
        className="bg-white rounded-lg p-8 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={() => setShowGroupSettings(false)}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Grup Yönetimi</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Yeni Grup Oluştur</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createGroup();
            }}
            className="flex gap-2"
          >
            <Input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Grup adı girin"
            />
            <Button type="submit">Oluştur</Button>
          </form>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Gruba Katıl</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              joinGroup();
            }}
            className="flex gap-2"
          >
            <Input
              type="text"
              value={groupIdToJoin}
              onChange={(e) => setGroupIdToJoin(e.target.value)}
              placeholder="Grup ID'si girin"
            />
            <Button type="submit">Katıl</Button>
          </form>
        </div>

        <GroupList
          groups={groups}
          leaveGroup={leaveGroup}
          deleteGroup={deleteGroup}
          renameGroup={renameGroup}
          handleCopyToClipboard={handleCopyToClipboard}
          user={user}
        />
      </div>
    </div>
  );
};

export default GroupSettingsModal;