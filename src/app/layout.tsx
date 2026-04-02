import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropDash — Your Prop Firm Command Center",
  description:
    "Real-time drawdown tracking, performance analytics, and pre-market routines for futures prop firm traders.",
  keywords: [
    "prop firm",
    "futures trading",
    "drawdown tracker",
    "Tradovate",
    "trading dashboard",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-bg-primary text-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}
