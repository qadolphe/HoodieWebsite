import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

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
    <html lang="en" suppressHydrationWarning>
      <head>
          <script dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !window.ethereum) {
                  // Prevent "undefined is not an object" errors from wallet injectors
                  try {
                    window.ethereum = window.ethereum || {};
                  } catch (e) {}
              }
            `
          }} />
      </head>
      <body className={inter.variable} suppressHydrationWarning>
        <Header />
        <CartDrawer />
        <main className="min-h-screen pt-[70px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
