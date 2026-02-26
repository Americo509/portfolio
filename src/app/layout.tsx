import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionRoot } from "@/components/motion/MotionConfig";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { getPortfolio } from "@/lib/get-portfolio";

export const metadata = (params?: { locale?: string }): Metadata => {
  const portfolio = getPortfolio(params?.locale);
  return {
    metadataBase: new URL("https://example.com"),
    title: {
      default: `${portfolio.profile.name} — ${portfolio.profile.headlineBase}`,
      template: `%s — ${portfolio.profile.name}`
    },
    description: portfolio.profile.bioShort,
    openGraph: {
      title: `${portfolio.profile.name} — ${portfolio.profile.headlineBase}`,
      description: portfolio.profile.bioShort,
      type: "website"
    },
    robots: { index: true, follow: true }
  };
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-shell min-h-screen">
        <ThemeProvider>
          <MotionRoot>
            <Header />
            <main className="relative">
              <RouteTransition>{children}</RouteTransition>
            </main>
            <Footer />
          </MotionRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
