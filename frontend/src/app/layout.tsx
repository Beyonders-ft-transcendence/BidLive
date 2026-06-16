import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/providers/QueryProvider";
import "@/assets/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BidLive - Plataforma de Leilões em Tempo Real",
  description:
    "BidLive é uma plataforma de leilões em tempo real onde os utilizadores fazem lances ao vivo, interagem por chat e recebem recomendações inteligentes baseadas no comportamento e dados em streaming.",
  keywords: [
    "leilões",
    "leilões em tempo real",
    "lances ao vivo",
    "marketplace",
    "BidLive",
    "plataforma de leilões",
  ],
  authors: [{ name: "Equipa BidLive" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}