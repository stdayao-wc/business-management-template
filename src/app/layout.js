import "./globals.css";

import { LayoutProvider } from "@/context/LayoutContext";
import { Toaster } from "sonner";

export const metadata = {
  title: "Business Management Template",
  description: "Reusable Inventory, POS, and Financial Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutProvider>
          {children}

          <Toaster
            position="bottom-right"
            richColors
            closeButton
          />
        </LayoutProvider>
      </body>
    </html>
  );
}