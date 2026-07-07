import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LawyerGuard } from "@/components/lawyer-guard";
import { AuthGuard } from "@/components/auth-guard";
import { VerificationProvider } from "@/components/verification-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegalOS | AI Legal Copilot + Verified Lawyer Marketplace",
  description: "Draft, review, explain, and improve legal documents with AI—then get them verified by licensed lawyers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthGuard>
          <VerificationProvider>
            <LawyerGuard>{children}</LawyerGuard>
          </VerificationProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
