import React from "react";
import { LogOut, Trash, Edit, Link as LinkIcon } from "lucide-react"; // LinkIcon eklendi
import { Tooltip } from "@mui/material";

const GroupList = ({
  groups,
  leaveGroup,
  deleteGroup,
  renameGroup,
  handleCopyToClipboard,
  user,
}) => {
  // Kullanıcı kontrolü
  if (!user) {
    return <p>Loading...</p>; // veya başka bir fallback UI
  }

  const generateInviteLink = (groupId) => {
    const baseUrl = window.location.origin; // Uygulamanızın base URL'si
    return `${baseUrl}/join?groupId=${groupId}`;
  };


  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Üye Olduğunuz Gruplar</h3>
      <ul className="space-y-2 overflow-y-auto" style={{ maxHeight: "40vh" }}>
        {groups.map((group) => (
          <li key={group.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-lg">{group.groupName}</h4>
                <p className="text-sm text-gray-500">
                  Grup ID:
                  <span
                    className="text-gray-700 font-semibold ml-2"
                    onClick={() => handleCopyToClipboard(group.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {group.id}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                {/* Davet Linkini Kopyala Butonu */}
                <Tooltip title="Davet Linkini Kopyala">
                  <LinkIcon
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() =>
                      handleCopyToClipboard(generateInviteLink(group.id))
                    }
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>

                <Tooltip title="Grubu Terk Et">
                  <LogOut
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => leaveGroup(group.id)}
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>

                {group.createdBy === user.uid && (
                  <>
                    <Tooltip title="Grubu Sil">
                      <Trash
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteGroup(group.id)}
                        style={{ cursor: "pointer" }}
                      />
                    </Tooltip>
                    <Tooltip title="Grubu Yeniden Adlandır">
                      <Edit
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          const newName = prompt(
                            "Yeni grup adını girin:",
                            group.groupName
                          );
                          if (newName) {
                            renameGroup(group.id, newName);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;