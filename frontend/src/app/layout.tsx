import LogoutModal from "@/components/other/logoutModal";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers/Provider";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Axxes Carpool",
  description: "Axxes Carpool is a carpooling platform for Axxes employees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          <LogoutModal />
          {children}
          <Toaster richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
