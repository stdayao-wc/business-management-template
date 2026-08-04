import { requirePermission } from "@/services/auth-server";

import ProductsPage from "./ProductsPage";

export default async function Page() {
  await requirePermission("products.read");

  return <ProductsPage />;
}