import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata = {
  title: "Business Management Template",
  description: "Reusable Inventory, POS, and Financial Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}