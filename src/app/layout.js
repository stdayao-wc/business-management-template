import "./globals.css";

export const metadata = {
  title: "Business Management Template",
  description: "Reusable Inventory, POS, and Financial Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}