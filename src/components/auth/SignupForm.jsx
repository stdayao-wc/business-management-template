"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signup } from "@/services/auth";

const fieldClass =
  "w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-500";

const buttonClass =
  "w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

export default function SignupForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await signup({
        email,
        password,
        firstName,
        lastName,
      });

      /*
       * Supabase may require email confirmation.
       *
       * If there is no session, the account was created
       * but the user needs to confirm their email first.
       */
      if (!data.session) {
        setSuccess(
          "Account created. Please check your email to confirm your account.",
        );

        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Signup failed:", err);

      setError(err?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">First Name</label>

        <input
          type="text"
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Last Name</label>

        <input
          type="text"
          required
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>

        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Password</label>

        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Confirm Password
        </label>

        <input
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={fieldClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {success && <p className="text-sm text-green-600">{success}</p>}

      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <button
        type="button"
        onClick={() => router.push("/login")}
        className="w-full text-sm text-gray-500 hover:text-gray-700"
      >
        Already have an account? Sign In
      </button>
    </form>
  );
}
