import { requirePermission } from "@/services/auth-server";
import POSPage from "./POSPage";

export default async function Page() {
    await requirePermission("pos.read");

    return <POSPage />;
}