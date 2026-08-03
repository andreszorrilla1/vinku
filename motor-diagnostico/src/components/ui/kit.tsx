// Primitivas de UI limpias y funcionales (estética de marca sin pop-art).
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { MARCA } from '@/lib/marca';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${className}`}
      style={{ borderColor: MARCA.bordeSuave }}
    >
      {children}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primario' | 'secundario' | 'fantasma';
  children: ReactNode;
};

export function Boton({ variante = 'primario', children, className = '', ...rest }: BtnProps) {
  const estilos: Record<string, string> = {
    primario: 'text-white',
    secundario: 'bg-white',
    fantasma: 'bg-transparent',
  };
  const inline =
    variante === 'primario'
      ? { background: MARCA.violeta }
      : variante === 'secundario'
        ? { borderColor: MARCA.violeta, color: MARCA.violeta, borderWidth: 1 }
        : { color: MARCA.gris };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${estilos[variante]} ${className}`}
      style={inline}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: (color ?? MARCA.violeta) + '18', color: color ?? MARCA.violeta }}
    >
      {children}
    </span>
  );
}
