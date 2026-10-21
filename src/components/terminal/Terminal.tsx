"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { localeHref, type Locale } from "@/lib/i18n";
import { navigate } from "@/lib/navigate";
import { useApp } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-media";
import type { Portfolio } from "@/types/portfolio.types";

type Copy = Portfolio["copy"]["terminal"];
type Line = { id: number; text: string; kind: "in" | "out" | "err" };
type TerminalProject = { slug: string; title: string };

const NAV_DELAY = 700;

function isTyping(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

/** Botão visível que abre o terminal (o atalho ~ é o segredo). */
export function TerminalButton({ label, hint, className }: { label: string; hint: string; className?: string }) {
  const setOpen = useApp((s) => s.setTerminalOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={label}
      aria-haspopup="dialog"
      className={cn("label text-muted transition-colors hover:text-signal-ink", className)}
    >
      {hint}
    </button>
  );
}

/**
 * Terminal secreto: abre com ~ (ou ` ) ou pelo botão do rodapé. Diálogo modal
 * com foco preso no campo, histórico (↑/↓), Tab completa comandos e Esc fecha.
 */
export function Terminal({
  locale,
  copy,
  name,
  email,
  projects
}: {
  locale: Locale;
  copy: Copy;
  name: string;
  email: string;
  projects: TerminalProject[];
}) {
  const open = useApp((s) => s.terminalOpen);
  const setOpen = useApp((s) => s.setTerminalOpen);
  const resenha = useApp((s) => s.resenha);
  const setResenha = useApp((s) => s.setResenha);
  const { resolvedTheme, setTheme } = useTheme();
  const lenis = useLenis();
  const reduce = useReducedMotion();

  const [lines, setLines] = React.useState<Line[]>([]);
  const [value, setValue] = React.useState("");
  const history = React.useRef<string[]>([]);
  const cursor = React.useRef(-1);
  const nextId = React.useRef(0);
  const input = React.useRef<HTMLInputElement>(null);
  const scroller = React.useRef<HTMLDivElement>(null);
  const beer = React.useRef<HTMLDivElement>(null);
  const opener = React.useRef<Element | null>(null);
  const navTimer = React.useRef<number | null>(null);

  const fill = React.useCallback((s: string) => s.replace("{name}", name).replace("{email}", email), [name, email]);

  const print = React.useCallback(
    (text: string | string[], kind: Line["kind"] = "out") => {
      const list = Array.isArray(text) ? text : [text];
      setLines((prev) => [...prev, ...list.map((t) => ({ id: nextId.current++, text: fill(t), kind }))].slice(-200));
    },
    [fill]
  );

  const go = React.useCallback(
    (path: string) => {
      print(copy.opening);
      if (navTimer.current) window.clearTimeout(navTimer.current);
      navTimer.current = window.setTimeout(() => {
        setOpen(false);
        navigate(localeHref(locale, path));
      }, NAV_DELAY);
    },
    [copy.opening, locale, print, setOpen]
  );

  const pourBeer = React.useCallback(() => {
    const el = beer.current;
    if (!el || reduce) return;
    gsap
      .timeline()
      .set(el, { autoAlpha: 1, yPercent: 100 })
      .to(el, { yPercent: 0, duration: 1.6, ease: "power2.out" })
      .to(el, { autoAlpha: 0, duration: 0.8, delay: 1.2 })
      .set(el, { yPercent: 100 });
  }, [reduce]);

  const commands = React.useMemo(
    () => ["help", "projects", "about", "contact", "penalti", "resenha", "theme", "clear", "exit"],
    []
  );

  const run = React.useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      print(`> ${cmd}`, "in");
      if (!cmd) return;
      history.current = [cmd, ...history.current.filter((h) => h !== cmd)].slice(0, 50);
      cursor.current = -1;

      const [head, ...args] = cmd.toLowerCase().split(/\s+/);
      switch (head) {
        case "help":
        case "?":
          return print(copy.help);
        case "projects":
        case "ls": {
          const n = Number(args[0]);
          if (args[0] && Number.isInteger(n) && n >= 1 && n <= projects.length) return go(`/projects/${projects[n - 1].slug}`);
          if (args[0]) return print(copy.notFound.replace("{cmd}", cmd), "err");
          return print([copy.projectsIntro, ...projects.map((p, i) => `  ${String(i + 1).padStart(2, "0")}  ${p.title}`)]);
        }
        case "about":
        case "whoami":
          print(copy.about);
          return go("/about");
        case "contact":
          print(copy.contact);
          return go("/contact");
        case "penalti":
        case "penalty":
          return go("/penalti");
        case "resenha":
          setResenha(!resenha);
          return print(resenha ? copy.resenhaOff : copy.resenhaOn);
        case "theme":
          setTheme(resolvedTheme === "light" ? "dark" : "light");
          return print(copy.theme);
        case "clear":
        case "cls":
          return setLines([]);
        case "exit":
        case "quit":
          return setOpen(false);
        case "1910":
          return print(copy.e1910);
        case "socrates":
        case "sócrates":
          return print(copy.socrates);
        case "cerveja":
        case "beer":
          if (!resenha) return print(copy.cervejaOff);
          print(copy.cerveja);
          return pourBeer();
        case "sudo":
          if (args.join(" ") === "hire-me") {
            print(copy.hireMe);
            return go("/contact");
          }
          return print(copy.notFound.replace("{cmd}", cmd), "err");
        default:
          return print(copy.notFound.replace("{cmd}", cmd), "err");
      }
    },
    [copy, go, pourBeer, print, projects, resenha, resolvedTheme, setOpen, setResenha, setTheme]
  );

  // Atalho global: ~ ou ` abre (fora de campos de texto).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === "~" || e.key === "`" || e.code === "Backquote") && !isTyping(e.target) && !useApp.getState().terminalOpen) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // Abrir: guarda quem abriu, trava o scroll e dá foco ao campo. Fechar: devolve o foco.
  React.useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    lenis?.stop();
    setLines((prev) => (prev.length ? prev : copy.welcome.map((t) => ({ id: nextId.current++, text: fill(t), kind: "out" as const }))));
    const id = requestAnimationFrame(() => input.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      lenis?.start();
      if (opener.current instanceof HTMLElement && document.contains(opener.current)) opener.current.focus();
    };
  }, [open, lenis, copy.welcome, fill]);

  React.useEffect(() => () => {
    if (navTimer.current) window.clearTimeout(navTimer.current);
  }, []);

  React.useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.current.length) return;
      cursor.current = Math.min(cursor.current + 1, history.current.length - 1);
      setValue(history.current[cursor.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cursor.current = Math.max(cursor.current - 1, -1);
      setValue(cursor.current === -1 ? "" : history.current[cursor.current]);
    } else if (e.key === "Tab") {
      // Único elemento focável além do botão fechar: Tab completa, Shift+Tab vai ao botão.
      if (e.shiftKey) return;
      e.preventDefault();
      const match = commands.find((c) => value && c.startsWith(value.toLowerCase()));
      if (match) setValue(match);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-bg/60 p-[var(--hud-inset)] backdrop-blur-sm md:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terminal-title"
        data-lenis-prevent
        className="relative flex h-[min(72vh,560px)] w-full max-w-3xl flex-col overflow-hidden border border-fg/25 bg-surface font-mono text-[14px] leading-relaxed text-fg shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          // Foco preso: do botão fechar, Tab volta ao campo.
          if (e.key === "Tab" && e.target !== input.current) {
            e.preventDefault();
            input.current?.focus();
          }
        }}
      >
        {/* Chope: líquido âmbar sobe por trás do texto (só no Modo Resenha). */}
        <div
          ref={beer}
          aria-hidden="true"
          className="pointer-events-none invisible absolute inset-0 opacity-0"
          style={{ background: "linear-gradient(to top, rgba(245,158,11,0.55), rgba(245,158,11,0.3) 82%, rgba(255,247,230,0.3) 82%, rgba(255,247,230,0.18) 90%, transparent 90%)" }}
        />

        <div className="relative flex items-center justify-between gap-4 border-b border-line px-4 py-2">
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-signal" />
            <h2 id="terminal-title" className="label text-muted">
              {copy.title}
            </h2>
          </span>
          <button type="button" onClick={() => setOpen(false)} className="label text-muted transition-colors hover:text-signal-ink">
            {copy.close}
          </button>
        </div>

        <div
          ref={scroller}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="relative flex-1 overflow-y-auto px-4 py-3"
          onMouseUp={() => {
            if (!window.getSelection()?.toString()) input.current?.focus();
          }}
        >
          {lines.map((l) => (
            <p
              key={l.id}
              className={cn("whitespace-pre-wrap break-words", l.kind === "in" ? "text-signal-ink" : l.kind === "err" ? "text-alert" : "text-fg/90")}
            >
              {l.text}
            </p>
          ))}
        </div>

        <form
          className="relative flex items-center gap-2 border-t border-line px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
          }}
        >
          <span aria-hidden="true" className="text-signal-ink">
            ~$
          </span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label={copy.inputLabel}
            placeholder={copy.placeholder}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-fg caret-signal placeholder:text-muted/60 focus:outline-none"
          />
        </form>
      </div>
    </div>
  );
}
