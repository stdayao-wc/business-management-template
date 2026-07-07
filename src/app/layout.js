import "./globals.css";

import AppLayout from "@/components/layout/AppLayout";

import navigation from "./config/navigation";
import themes from "./config/theme";
import layout from "./config/layout";

export const metadata = {
  title: "Business Management Template",
  description: "Reusable Inventory, POS, and Financial Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppLayout
          navigation={navigation}
          theme={themes.light}
          layout={layout}
        >
          {children}
        </AppLayout>
      </body>
    </html>
  );
}