import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChangeRadar — Document change intelligence",
  description:
    "Compare document versions and understand the practical risks behind each change.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
