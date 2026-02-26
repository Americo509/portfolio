"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Item = { src: string; alt: string };

export function ProjectGallery({ items }: { items: Item[] }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<Item | null>(null);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((g) => (
                    <button
                        key={g.src}
                        type="button"
                        onClick={() => {
                            setActive(g);
                            setOpen(true);
                        }}
                        className="group relative aspect-[16/10] overflow-hidden rounded-xl2 border border-borderSubtle bg-paper-3 dark:bg-ink-3 text-left focus-ring"
                        aria-label="Abrir imagem"
                    >
                        <Image
                            src={g.src}
                            alt={g.alt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                    </button>
                ))}
            </div>

            {open && active ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
                    onMouseDown={() => setOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="relative w-full max-w-6xl"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute -top-12 right-0 rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 focus-ring"
                        >
                            Fechar (Esc)
                        </button>

                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl2 bg-black shadow-soft">
                            <Image
                                src={active.src}
                                alt={active.alt}
                                fill
                                className="object-contain"
                                priority
                                sizes="100vw"
                            />
                        </div>

                        {active.alt ? (
                            <p className="mt-3 text-center text-sm text-white/80">
                                {active.alt}
                            </p>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </>
    );
}