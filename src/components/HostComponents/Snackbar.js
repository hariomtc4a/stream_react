import React, { useEffect } from "react";

function Snackbar({ message, type = "info", open, onClose, duration = 3000 }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  const getColor = () => {
    switch (type) {
      case "done":
        return "#4caf4f98";
      case "fail":
        return "#ff11008a";
      case "warning":
        return "#b19000c5";
      default:
        return "#2195f391";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        right: "0px",
        transform: "translateX(-50%)",
        backgroundColor: getColor(),
        color: "#fff",
        fontWeight: "600",
        padding: "12px 24px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: 1000,
        transition: "all 0.3s ease-in-out",
        minWidth: "200px",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

export default Snackbar;
