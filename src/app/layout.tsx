import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { CustomSessionProvider } from "@/components/SessionProvider";
import { getServerSession } from "./api/auth";
import { cookies } from "next/headers";
import { ThemeButton } from "@/components/ThemeButton";
import { AuthHeader } from "@/components/AuthHeader";
import { ColorContextProvider } from "@/hooks/useColor";
import { QueryClientProviderWrapper } from "@/components/QueryClientProviderWrapper";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Destiny Wrapped 2025",
  description: "Check out your highlights from Destiny 2 in 2025",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const c = await cookies();
  const serverSession = getServerSession(c);

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <Analytics />
        <QueryClientProviderWrapper>
          <ColorContextProvider>
            <CustomSessionProvider serverSession={serverSession}>
              <header>
                <div className="flex flex-col gap-3 items-end p-4">
                  <AuthHeader />
                  <ThemeButton />
                </div>
              </header>
              {children}
            </CustomSessionProvider>
          </ColorContextProvider>
        </QueryClientProviderWrapper>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
