import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AZZA - İş Makineleri ERP",
  description: "AZZA İş Makineleri Yönetim Sistemi - Stok, Satış ve Lojistik Yönetimi",
  keywords: ["ERP", "İş Makineleri", "Stok Yönetimi", "Finans", "Lojistik"],
  authors: [{ name: "AZZA Machinery" }],
  openGraph: {
    title: "AZZA - İş Makineleri ERP",
    description: "AZZA İş Makineleri Yönetim ve Takip Sistemi",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
