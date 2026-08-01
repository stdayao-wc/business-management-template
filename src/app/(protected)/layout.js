import { redirect } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";

import navigation from "../config/navigation";
import themes from "../config/theme";
import layout from "../config/layout";

import { getCurrentAuth } from "@/services/auth-server";
import { AuthProvider } from "@/context/AuthContext";

export default async function ProtectedLayout({ children }) {
  const auth = await getCurrentAuth();

  if (!auth.user) {
    redirect("/login");
  }

  return (
    <AuthProvider auth={auth}>
        <AppLayout
        navigation={navigation}
        theme={themes.light}
        layout={layout}
        >
        {children}
        </AppLayout>
    </AuthProvider>
  );
}