import type { Metadata } from "next";
import "./globals.css";
import GlobalTheme from "./GlobalTheme";

export const metadata: Metadata = {
  title: "Pencatatan Keuangan",
  description: "Aplikasi pencatatan keuangan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/* Warna global: default putih terang, dark mode hitam pekat (#000000) */}
      <body className="bg-white text-gray-900 transition-colors duration-300 dark:bg-black dark:text-white">
        <GlobalTheme>{children}</GlobalTheme>
      </body>
    </html>
  );
}