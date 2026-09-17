import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trust Health.care - Pharmacy",
  description: "Pharmacy Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  );
}
