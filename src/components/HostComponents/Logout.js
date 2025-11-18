function LogoutModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className={`modal fade ${open ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-center" role="document">
        <div className="modal-content">
          <div className="modal-body">
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={onConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
