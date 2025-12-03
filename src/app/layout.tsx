import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Satin Hoodie Kits | DIY Satin Lined Hoodies",
  description: "Transform your favorite hoodie with our premium satin lining kits. Protect your hair and elevate your style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Header />
        <main style={{ minHeight: '100vh', paddingTop: '70px' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
