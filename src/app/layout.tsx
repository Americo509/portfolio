import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionRoot } from "@/components/motion/MotionConfig";
import { RouteTransition } from "@/components/transition/RouteTransition";
import { SceneRoot } from "@/components/scene/SceneRoot";
import { FxRoot } from "@/components/fx/FxRoot";
import { HudFrame } from "@/components/hud/HudFrame";
import { Cursor } from "@/components/cursor/Cursor";
import { Preloader, bootScript } from "@/components/preloader/Preloader";
import { getPortfolio } from "@/lib/get-portfolio";
import { SITE_URL } from "@/lib/site";

const portfolio = getPortfolio();
const defaultTitle = `${portfolio.profile.name} — ${portfolio.profile.headlineBase}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s — ${portfolio.profile.name}`
  },
  description: portfolio.profile.bioShort,
  openGraph: {
    title: defaultTitle,
    description: portfolio.profile.bioShort,
    type: "website",
    locale: "pt_BR"
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark light"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <MotionRoot>
            <SmoothScroll>
              <a href="#conteudo" className="skip-link label">
                Pular para o conteúdo
              </a>
              <SceneRoot />
              <HudFrame hud={portfolio.hud} />
              <Header handle={portfolio.profile.handle} copy={portfolio.copy.nav} />
              <RouteTransition>
                <main id="conteudo" className="relative z-10">
                  {children}
                </main>
                <Footer />
              </RouteTransition>
              <FxRoot />
              <div className="grain" aria-hidden="true" />
              <Cursor />
              <Preloader handle={portfolio.profile.handle} copy={portfolio.copy.boot} />
            </SmoothScroll>
          </MotionRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
