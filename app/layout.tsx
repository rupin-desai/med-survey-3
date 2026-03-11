import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semaglutide Interest Survey",
  description: "Survey on interest in Semaglutide for patient treatment among doctors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
