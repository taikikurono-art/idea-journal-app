import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "アイデア帳",
  description: "知人と考え中のアイデアを共有するノート",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-hand">{children}</body>
    </html>
  );
}
