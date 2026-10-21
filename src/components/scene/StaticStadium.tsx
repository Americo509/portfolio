import { cn } from "@/lib/cn";

/**
 * Fallback visual do estádio (sem WebGL, reduced motion, ou enquanto a cena
 * carrega): cones de refletor em conic-gradient, neblina e o brilho do
 * sinalizador. Só CSS, sem imagem.
 */
export function StaticStadium({ className }: { className?: string }) {
  return (
    <div className={cn("static-stadium", className)} aria-hidden="true">
      <span className="static-stadium__beam static-stadium__beam--l" />
      <span className="static-stadium__beam static-stadium__beam--r" />
      <span className="static-stadium__flare" />
      <span className="static-stadium__pitch" />
    </div>
  );
}
