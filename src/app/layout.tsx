import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "قَصَّة | Qassa",
  description: "احجز موعدك مع أفضل الحلاقين بسهولة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-cairo bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
