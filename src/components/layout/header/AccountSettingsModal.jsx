"use client";

import { useState } from "react";

import Modal from "@/components/common/Modal";
import { changePassword } from "@/services/auth";

export default function AccountSettingsModal({ open, onClose }) {
  const [changingPassword, setChangingPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function resetPasswordForm() {
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setSuccess("");
    setLoading(false);
  }

  function handleClose() {
    if (changingPassword) {
      setChangingPassword(false);
      resetPasswordForm();
      return;
    }

    onClose();
  }

  function handleOpenChangePassword() {
    setError("");
    setSuccess("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setChangingPassword(true);
  }

  function handleBack() {
    setChangingPassword(false);
    resetPasswordForm();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await changePassword(newPassword);

      setSuccess("Your password has been changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Change password failed:", error);

      setError(error?.message || "Failed to change your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} title="Account Settings" onClose={handleClose}>
      {!changingPassword ? (
        <div className="space-y-4">
          {" "}
          <div>
            {" "}
            <h3 className="font-semibold text-gray-900">Security </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account security settings.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-gray-900">Change Password</p>

              <p className="mt-1 text-sm text-gray-500">
                Update your account password.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenChangePassword}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Change Password
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h3 className="font-semibold text-gray-900">Change Password</h3>

            <p className="mt-1 text-sm text-gray-500">
              Enter your new password below.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-gray-700"
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                >
                  {showNewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M10.584 10.587a2 2 0 002.829 2.829M9.88 4.24A10.94 10.94 0 0112 4c5.5 0 9.5 5 9.5 5s-1.39 2.09-3.84 3.72M6.23 6.23C3.8 7.8 2.5 9.5 2.5 9.5S5.5 14 12 14c1.12 0 2.15-.17 3.08-.44"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.5 9.5S5.5 4 12 4s9.5 5.5 9.5 5.5S18.5 15 12 15 2.5 9.5 2.5 9.5z"
                      />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-gray-700"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M10.584 10.587a2 2 0 002.829 2.829M9.88 4.24A10.94 10.94 0 0112 4c5.5 0 9.5 5 9.5 5s-1.39 2.09-3.84 3.72M6.23 6.23C3.8 7.8 2.5 9.5 2.5 9.5S5.5 14 12 14c1.12 0 2.15-.17 3.08-.44"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.5 9.5S5.5 4 12 4s9.5 5.5 9.5 5.5S18.5 15 12 15 2.5 9.5 2.5 9.5z"
                      />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />

                  <span>Changing Password...</span>
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
