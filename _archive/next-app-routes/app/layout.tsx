import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Family Health",
  title: "Family Health",
  description: "A private family health dashboard for records, reminders, and care tracking.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Family Health"
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PwaRegister />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
