import { useEffect, useState } from "react";

function RightNavBar({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="right-nav-bar">
      <div className="modal-dialog modal-center" role="document">
        yes
      </div>
    </div>
  );
}