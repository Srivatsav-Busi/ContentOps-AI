import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ContentOps AI — Raw Video to Published Content in Minutes",
    template: "%s | ContentOps AI",
  },
  description:
    "Multi-agent SaaS platform that converts raw video assets into platform-ready content, generates SEO-optimized metadata, automates social publishing, and provides AI-driven KPI dashboards.",
  keywords: [
    "video editing",
    "AI video",
    "social media publishing",
    "content operations",
    "SEO generation",
    "video automation",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://contentops.ai",
    siteName: "ContentOps AI",
    title: "ContentOps AI — Raw Video to Published Content in Minutes",
    description:
      "Multi-agent SaaS platform that converts raw video assets into platform-ready content.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentOps AI",
    description:
      "Raw Video to Published Content in Minutes",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
