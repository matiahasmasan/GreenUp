import { useState } from "react";
import Modal from "./common/Modal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  role: "client",
  fullName: "",
  username: "",
  email: "",
  password: "",
};

export default function CreateUserModal({ isOpen, onClose, onSave, loading, error }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  const isClient = formData.role === "client";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (isClient) {
      if (!formData.fullName.trim()) {
        errors.fullName = "Full name is required";
      }
      if (!EMAIL_RE.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    } else {
      if (!formData.username.trim()) {
        errors.username = "Username is required";
      }
      if (formData.email.trim() && !EMAIL_RE.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        role: formData.role,
        password: formData.password,
        fullName: formData.fullName.trim() || undefined,
        username: formData.username.trim() || undefined,
        email: formData.email.trim() || undefined,
      });
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New User"
      variant="create"
      loading={loading}
      error={error}
      footerButtons={
        <>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          >
            <option value="client">Client</option>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
          </select>
          <p className="text-gray-500 text-xs mt-1">
            {isClient
              ? "Clients sign in with their email address."
              : "Staff sign in with their username."}
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Full Name{" "}
            {isClient ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-gray-400 font-normal">(optional)</span>
            )}
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              formErrors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter full name"
            disabled={loading}
          />
          {formErrors.fullName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
          )}
        </div>

        {/* Username — staff only */}
        {!isClient && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                formErrors.username ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter username"
              disabled={loading}
            />
            {formErrors.username && (
              <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email{" "}
            {isClient ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-gray-400 font-normal">(optional)</span>
            )}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              formErrors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="name@example.com"
            disabled={loading}
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              formErrors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="At least 6 characters"
            disabled={loading}
          />
          {formErrors.password && (
            <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
