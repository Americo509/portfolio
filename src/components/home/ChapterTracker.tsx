"use client";

import * as React from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { motionState, type ChapterKey } from "@/lib/store";

/**
 * Observa as seções [data-chapter] da home e publica o capítulo ativo (e o
 * progresso dentro dele) para a câmera do estádio.
 */
export function ChapterTracker() {
  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) motionState.chapter = el.dataset.chapter as ChapterKey;
        },
        onUpdate: (self) => {
          if (self.isActive) motionState.chapterProgress = self.progress;
        }
      })
    );
    return () => {
      triggers.forEach((t) => t.kill());
      motionState.chapter = "hero";
      motionState.chapterProgress = 0;
    };
  }, []);
  return null;
}
