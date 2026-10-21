import "@/app/globals.css";
import { fontVariables } from "@/app/fonts";
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
import { Preloader } from "@/components/preloader/Preloader";
import { ResenhaRoot } from "@/components/resenha/ResenhaRoot";
import { Terminal } from "@/components/terminal/Terminal";
import { bootScript, resenhaScript } from "@/lib/inline-scripts";
import { getPortfolio } from "@/lib/get-portfolio";
import { htmlLang, type Locale } from "@/lib/i18n";

/** Casca comum aos dois layouts raiz (PT na raiz, EN em /en). */
export function RootShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const portfolio = getPortfolio(locale);
  const { copy } = portfolio;
  return (
    <html lang={htmlLang(locale)} className={fontVariables} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootScript + resenhaScript }} />
        <ThemeProvider>
          <MotionRoot>
            <SmoothScroll>
              <a href="#conteudo" className="skip-link label">
                {locale === "en" ? "Skip to content" : "Pular para o conteúdo"}
              </a>
              <ResenhaRoot />
              <SceneRoot />
              <HudFrame hud={portfolio.hud} liveResenha={copy.resenha.live} />
              <Header locale={locale} handle={portfolio.profile.handle} copy={copy.nav} lang={copy.lang} resenha={copy.resenha} />
              <RouteTransition>
                <main id="conteudo" className="relative z-10">
                  {children}
                </main>
                <Footer locale={locale} />
              </RouteTransition>
              <FxRoot />
              <div className="grain" aria-hidden="true" />
              <Cursor />
              <Terminal
                locale={locale}
                copy={copy.terminal}
                name={portfolio.profile.name}
                email={portfolio.links.email}
                projects={portfolio.projects.filter((p) => p.tier === "sumula").map((p) => ({ slug: p.slug, title: p.title }))}
              />
              <Preloader handle={portfolio.profile.handle} copy={copy.boot} />
            </SmoothScroll>
          </MotionRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
