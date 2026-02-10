import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ripcord",
  description: "Secure, accessible messaging for close-knit communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
