import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input"

const TodoEditForm = ({ editText, setEditText, onSave }) => (
  <div className="flex-grow flex flex-col sm:flex-row w-full sm:w-auto gap-2">
    <Input
      type="text"
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
      className="flex-grow min-w-0"
    />
    <Button onClick={onSave} className="w-full sm:w-auto">
      Kaydet
    </Button>
  </div>
);

export default TodoEditForm