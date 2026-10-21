"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Portfolio } from "@/types/portfolio.types";

type Copy = Portfolio["copy"]["contactForm"];

const fieldClass =
  "mt-2 w-full border-b border-fg/30 bg-transparent py-3 text-[17px] placeholder:text-muted/60 transition-colors focus:border-signal focus:outline-none aria-[invalid=true]:border-alert";

export function ContactForm({ copy }: { copy: Copy }) {
  const reduce = useReducedMotion();
  const [status, setStatus] = React.useState<"idle" | "sent" | "error">("idle");
  const startedAtRef = React.useRef<number>(Date.now());

  const schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, copy.errors.name),
        email: z.string().email(copy.errors.email),
        message: z.string().min(10, copy.errors.message)
      }),
    [copy]
  );
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" }
  });

  async function onSubmit(values: FormValues) {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: "", startedAt: startedAtRef.current })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error);
      setStatus("sent");
      reset();
      startedAtRef.current = Date.now();
    } catch {
      setStatus("error");
    }
  }

  const fieldError = (id: string, message?: string) =>
    message ? (
      <p id={id} className="label mt-2 text-alert">
        {message}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" aria-label={copy.submit} noValidate>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <label className="block">
          <span className="label text-muted">{copy.name}</span>
          <input
            {...register("name")}
            className={fieldClass}
            placeholder={copy.namePlaceholder}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {fieldError("name-error", errors.name?.message)}
        </label>
        <label className="block">
          <span className="label text-muted">{copy.email}</span>
          <input
            {...register("email")}
            type="email"
            className={fieldClass}
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {fieldError("email-error", errors.email?.message)}
        </label>
      </div>

      <label className="block">
        <span className="label text-muted">{copy.message}</span>
        <textarea
          {...register("message")}
          rows={6}
          className={cn(fieldClass, "resize-y")}
          placeholder={copy.messagePlaceholder}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {fieldError("message-error", errors.message?.message)}
      </label>

      {/* Honeypot: invisível para pessoas, preenchido por bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" name="company" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? copy.sending : copy.submit}
        </Button>
        <AnimatePresence mode="wait">
          {status !== "idle" ? (
            <motion.p
              key={status}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className={cn("label", status === "sent" ? "text-signal-ink" : "text-alert")}
              role="status"
              aria-live="polite"
            >
              {status === "sent" ? copy.sent : copy.error}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
