"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("Email inválido."),
  message: z.string().min(10, "Escreva uma mensagem com pelo menos 10 caracteres.")
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const reduce = useReducedMotion();
  const [sent, setSent] = React.useState(false);
  const startedAtRef = React.useRef<number>(Date.now());

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
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        company: "",
        startedAt: startedAtRef.current
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json?.ok === false) {
      throw new Error(json?.error ?? "Falha ao enviar. Tente novamente em instantes.");
    }

    setSent(true);
    reset();
    startedAtRef.current = Date.now();
    setTimeout(() => setSent(false), 3500);
  }

  return (
    <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-6 sm:p-7 shadow-soft">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulário de contato">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-ink-4 dark:text-paper-1/70">Nome</span>
            <input
              {...register("name")}
              className="focus-ring mt-2 w-full rounded-xl2 border border-borderSubtle bg-paper-1/70 dark:bg-ink-1/40 px-4 py-3 text-sm"
              placeholder="Seu nome"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name ? (
              <p id="name-error" className="mt-1 text-xs text-ink-4 dark:text-paper-1/70">
                {errors.name.message}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-xs text-ink-4 dark:text-paper-1/70">Email</span>
            <input
              {...register("email")}
              className="focus-ring mt-2 w-full rounded-xl2 border border-borderSubtle bg-paper-1/70 dark:bg-ink-1/40 px-4 py-3 text-sm"
              placeholder="voce@exemplo.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email ? (
              <p id="email-error" className="mt-1 text-xs text-ink-4 dark:text-paper-1/70">
                {errors.email.message}
              </p>
            ) : null}
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-ink-4 dark:text-paper-1/70">Mensagem</span>
          <textarea
            {...register("message")}
            rows={6}
            className="focus-ring mt-2 w-full rounded-xl2 border border-borderSubtle bg-paper-1/70 dark:bg-ink-1/40 px-4 py-3 text-sm"
            placeholder="Me conte sobre o projeto e o que você precisa."
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message ? (
            <p id="message-error" className="mt-1 text-xs text-ink-4 dark:text-paper-1/70">
              {errors.message.message}
            </p>
          ) : null}
        </label>

        <div className="hidden" aria-hidden="true">
          <label>
            Company
            <input tabIndex={-1} autoComplete="off" {...register("company" as any)} />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando…" : "Enviar mensagem"}
          </Button>

          <AnimatePresence>
            {sent ? (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={reduce ? {} : { opacity: 1, y: 0 }}
                exit={reduce ? {} : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                className="text-sm text-ink-4 dark:text-paper-1/70"
                role="status"
                aria-live="polite"
              >
                Mensagem enviada ✓
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
