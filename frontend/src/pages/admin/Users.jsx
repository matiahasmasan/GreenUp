import { useState, useEffect, useMemo } from "react";
import { authFetch } from "../../utils/authUtils";
import "../../App.css";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/SearchBar";
import CreateUserModal from "../../components/CreateUserModal";
import ViewUserModal from "../../components/ViewUserModal";
import EditUserModal from "../../components/EditUserModal";

const API_BASE_URL = "/api";

const ROLE_LABELS = {
  admin: "Admin",
  operator: "Operator",
  client: "Client",
  viewer: "Viewer",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/users`);

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load users");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async (payload) => {
    try {
      setCreateLoading(true);
      setCreateError("");

      const res = await authFetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      await fetchUsers();
      setCreateModalOpen(false);
    } catch (err) {
      setCreateError(err.message || "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedUser(null);
  };

  // Placeholder action handlers (not wired up yet)

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditError("");
  };

  const handleUpdateUser = async (payload) => {
    if (!selectedUser) return;
    try {
      setEditLoading(true);
      setEditError("");

      const res = await authFetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      await fetchUsers();
      handleCloseEditModal();
    } catch (err) {
      setEditError(err.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (user) => {
    console.log("Delete user", user);
  };

  const getUserName = (user) =>
    user.full_name?.trim() || user.username || "Unknown";

  const getRoleLabel = (role) => ROLE_LABELS[role] || role || "Unknown";

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const needle = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const haystack = `${user.full_name ?? ""} ${user.username ?? ""} ${
        user.email ?? ""
      } ${user.role ?? ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [users, searchTerm]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="checkout-section mt-2">
      <div className="flex justify-between items-center mb-2">
        <h1 className="checkout-section-title">Users</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCreateError("");
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center gap-2"
            title="Add User"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4">
        <SearchBar
          variant="simple"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading && <p className="text-gray-500 mt-4">Loading users...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <p className="text-gray-600 mt-4">
          {searchTerm ? "No users match your search." : "No users found."}
        </p>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className="mt-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-sm bg-white">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-3 font-semibold text-gray-800">
                      {getUserName(user)}
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {getRoleLabel(user.role)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center gap-2">
                        {/* VIEW BUTTON */}
                        <button
                          onClick={() => handleView(user)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-blue-600 transition"
                          title="View user"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-yellow-600 transition"
                          title="Edit user"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(user)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                          title="Delete user"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={usersPerPage}
            itemName={filteredUsers.length === 1 ? "user" : "users"}
          />
        </div>
      )}

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setCreateError("");
        }}
        onSave={handleCreateUser}
        loading={createLoading}
        error={createError}
      />

      <ViewUserModal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        selectedUser={selectedUser}
        loading={false}
        error=""
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        selectedUser={selectedUser}
        loading={editLoading}
        error={editError}
        onSave={handleUpdateUser}
      />
    </div>
  );
}
