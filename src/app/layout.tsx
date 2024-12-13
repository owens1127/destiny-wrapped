import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { CustomSessionProvider } from "@/components/SessionProvider";
import { getServerSession } from "./api/auth";
import { cookies } from "next/headers";
import { ThemeButton } from "@/components/ThemeButton";
import { AuthHeader } from "@/components/AuthHeader";
import { ColorContextProvider } from "@/hooks/useColor";
import { QueryClientProviderWrapper } from "@/components/QueryClientProviderWrapper";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Destiny Wrapped 2024",
  description: "Check out your highlights from Destiny 2 in 2024",
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
        <footer>
          <div className="flex justify-center p-4 text-sm text-gray-500 dark:text-gray-400">
            <span>
              Destiny Wrapped 2024 by{" "}
              <Link
                href="https://x.com/kneewoah"
                target="_blank"
                rel="noopener noreferrer"
              >
                Newo
              </Link>
            </span>
            <span className="ml-4">
              <Link
                href="https://github.com/owens1127/destiny-wrapped"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source
              </Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
