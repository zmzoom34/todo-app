import React from "react";
import "./Checkbox.css"; // CSS dosyasını import ediyoruz

function Checkbox({ label, type = "checkbox", checked, onChange, className }) {
  return (
    <div className="checkbox-wrapper">
      <label>
        <input
          type={type}
          checked={checked} // checked prop'unu kullanıyoruz
          onChange={onChange}
          className={className}
        />
        {label && <span>{label}</span>} {/* Label opsiyonel */}
      </label>
    </div>
  );
}

export default Checkbox;