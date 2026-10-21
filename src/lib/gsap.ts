"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

// Registro único dos plugins e das curvas definidas em docs/art-direction.md.
let registered = false;
if (typeof window !== "undefined" && !registered) {
  registered = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);
  CustomEase.create("cine", "0.76,0,0.24,1");
  CustomEase.create("snap", "0.2,0.8,0.2,1");
}

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
