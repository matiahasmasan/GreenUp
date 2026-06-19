import Modal from "./common/Modal";

const ROLE_LABELS = {
  admin: "Admin",
  operator: "Operator",
  client: "Client",
  viewer: "Viewer",
};

export default function DeleteUserModal({
  isOpen,
  onClose,
  user,
  deleteLoading,
  deleteError,
  onConfirmDelete,
}) {
  const displayName = user?.full_name?.trim() || user?.username || "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete User #${user?.id || ""}`}
      variant="delete"
      loading={false}
      error={deleteError}
      maxWidth="max-w-lg"
      footerButtons={
        <>
          <button
            onClick={onClose}
            disabled={deleteLoading}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            disabled={deleteLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteLoading ? "Deleting..." : "Delete User"}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-gray-700">
        <p className="font-semibold text-red-700">This action cannot be undone.</p>
        <p>
          Are you sure you want to delete
          <span className="font-semibold"> {displayName}</span>?
        </p>
        <p className="text-sm text-gray-600">
          Role: {ROLE_LABELS[user?.role] || user?.role || "-"} | Username:{" "}
          {user?.username || "-"}
        </p>
        <p className="text-sm text-gray-500">
          Their past orders will be kept but no longer linked to this account.
        </p>
      </div>
    </Modal>
  );
}
