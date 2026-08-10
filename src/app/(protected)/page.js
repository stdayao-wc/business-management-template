import { redirect } from "next/navigation";

import Dashboard from "@/components/dashboard/Dashboard";
import { getCurrentAuth } from "@/services/auth-server";

export default async function Home() {
    const auth = await getCurrentAuth();

    if (auth.permissions.includes("dashboard.read")) {
        return <Dashboard />;
    }

    if (auth.permissions.includes("inventory.read")) {
        redirect("/inventory");
    }

    if (auth.permissions.includes("pos.read")) {
        redirect("/pos");
    }

    if (auth.permissions.includes("sales.read")) {
        redirect("/orders");
    }

    redirect("/login");
}