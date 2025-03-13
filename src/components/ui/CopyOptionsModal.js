import React from 'react';
import Modal from 'react-modal';
import { User, Users, X } from 'lucide-react';

// Set app element for accessibility (you should call this in your app's entry point)
// Modal.setAppElement('#root');

const CopyOptionsModal = ({ 
  isOpen, 
  onClose, 
  list, 
  groups, 
  onCopy,
}) => {
  const [copyTarget, setCopyTarget] = React.useState("personal");
  const [selectedGroupId, setSelectedGroupId] = React.useState(
    groups.length > 0 ? groups[0].id : ""
  );

  const handleCopyList = () => {
    onCopy({
      target: copyTarget,
      groupId: copyTarget === "group" ? selectedGroupId : null
    });
    onClose();
  };

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      position: 'relative',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      maxWidth: '450px',
      width: '100%',
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: 'white',
      border: 'none'
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Copy List Options"
    >
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold mb-5 pr-6">
          Copy List: {list?.listName}
        </h2>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Select where to copy this list:
          </p>
          
          <div className="flex space-x-3 mb-5">
            <button
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                copyTarget === "personal"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setCopyTarget("personal")}
            >
              <User className="w-4 h-4 mr-2" />
              Personal List
            </button>
            
            <button
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                copyTarget === "group"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setCopyTarget("group")}
              disabled={groups.length === 0}
            >
              <Users className="w-4 h-4 mr-2" />
              Group List
            </button>
          </div>
          
          {copyTarget === "group" && (
            <div className="mb-2 transition-all">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Group:
              </label>
              
              {groups.length > 0 ? (
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-500 p-2 bg-red-50 rounded">
                  You are not a member of any groups.
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            onClick={handleCopyList}
            disabled={
              copyTarget === "group" &&
              (groups.length === 0 || !selectedGroupId)
            }
          >
            Copy List
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CopyOptionsModal;