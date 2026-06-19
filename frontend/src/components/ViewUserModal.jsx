import Modal from "./common/Modal";

const ROLE_LABELS = {
  admin: "Admin",
  operator: "Operator",
  client: "Client",
  viewer: "Viewer",
};

const ROLE_BADGE_CLASSES = {
  admin: "bg-purple-50 text-purple-700",
  operator: "bg-blue-50 text-blue-700",
  client: "bg-green-50 text-green-700",
  viewer: "bg-gray-100 text-gray-600",
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

export default function ViewUserModal({ isOpen, onClose, selectedUser, loading, error }) {
  const role = selectedUser?.role;
  const displayName = selectedUser?.full_name?.trim() || selectedUser?.username || "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`User: ${displayName}`}
      variant="view"
      loading={loading}
      error={error}
      footerButtons={
        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
        >
          Close
        </button>
      }
    >
      {selectedUser && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Full Name</p>
              <p className="text-gray-800">
                {selectedUser.full_name?.trim() || (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Role</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  ROLE_BADGE_CLASSES[role] || "bg-gray-100 text-gray-600"
                }`}
              >
                {ROLE_LABELS[role] || role || "Unknown"}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Username</p>
              <p className="text-gray-800 break-all">{selectedUser.username || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
              <p className="text-gray-800 break-all">
                {selectedUser.email?.trim() || (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">User ID</p>
              <p className="text-gray-800">{selectedUser.id}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Created</p>
              <p className="text-gray-800">{formatDate(selectedUser.created_at)}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
