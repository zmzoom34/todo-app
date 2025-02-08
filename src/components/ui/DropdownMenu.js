import { useState, useRef, useEffect } from "react";

const DropdownMenu = ({ trigger, children }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Menü dışında tıklanınca kapatma işlevi
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-gray-200">
        {trigger}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md overflow-hidden border">
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 hover:bg-gray-100"
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuItem };
