import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartFinance AI - Smart Expense Tracker",
  description:
    "Track expenses, manage budgets and recurring bills — all in your browser.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
