import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo Better Auth",
  description: "Next.js + Better Auth + GitHub OAuth + SQLite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
