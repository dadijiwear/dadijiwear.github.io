import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BackgroundDecorations } from "@/components/layout/BackgroundDecorations";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mom & Son | Premium Kidswear",
    template: "%s | Mom & Son"
  },
  description: "Mom & Son offers premium, handcrafted kidswear crafted with love and 21 years of experience. Soft on skin, strong in quality. Discover our organic cotton ethnic sets and nightwear.",
  keywords: ["kidswear", "handcrafted clothing", "organic cotton for kids", "Indian ethnic wear for children", "premium children's fashion", "Mom & Son"],
  authors: [{ name: "Mom & Son Team" }],
  creator: "Mom & Son",
  publisher: "Mom & Son",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://momnson.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mom & Son | Premium Kidswear",
    description: "Premium handcrafted kidswear crafted with love and 21 years of experience.",
    url: "https://momnson.co",
    siteName: "Mom & Son",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mom & Son Premium Kidswear",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mom & Son | Premium Handcrafted Kidswear",
    description: "Premium handcrafted kidswear crafted with love and 21 years of experience.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} antialiased h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-dadi-cream text-foreground relative transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > 
          <Header />
          <main className="flex-1 relative z-10">
            {children}
          </main>
          <Footer />
          <BackgroundDecorations />
        </ThemeProvider> 
      </body>
    </html>
  );
}
