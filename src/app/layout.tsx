import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CENDO | Centro de Endometriosis - Dr. Patrick Jacinto",
  description:
    "Sistema Clínico y Gestión Ginecológica Especializada. Dr. Patrick José Jacinto Gomero (CMP 61693, RNE 38657, Miraflores - Lima).",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-main font-sans antialiased text-body selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
