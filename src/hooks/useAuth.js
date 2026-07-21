"use client";

import { useEffect, useState } from "react";

import {
  getCurrentUser,
} from "@/services/auth";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      setLoading(true);

      const user = await getCurrentUser();

      setUser(user);
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    loading,
    refresh: loadUser,
  };
}