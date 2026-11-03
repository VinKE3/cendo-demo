import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
}

export function BrandLogo({
  size = "md",
  variant = "light",
  showText = true,
  className,
}: BrandLogoProps) {
  // Dimensiones del isotipo SVG según tamaño
  const iconDimensions = {
    sm: { w: 32, h: 32, iconSize: "w-8 h-8" },
    md: { w: 42, h: 42, iconSize: "w-10 h-10" },
    lg: { w: 54, h: 54, iconSize: "w-14 h-14" },
    xl: { w: 72, h: 72, iconSize: "w-18 h-18" },
  }[size];

  // Estilos de texto
  const textStyles = {
    title: {
      sm: "text-lg font-bold tracking-tight",
      md: "text-2xl font-extrabold tracking-tight",
      lg: "text-3xl font-extrabold tracking-tight",
      xl: "text-4xl font-extrabold tracking-tight",
    }[size],
    subtitle: {
      sm: "text-[9px] font-semibold tracking-wider",
      md: "text-[10px] font-semibold tracking-widest",
      lg: "text-xs font-semibold tracking-widest",
      xl: "text-sm font-semibold tracking-widest",
    }[size],
  };

  const isDark = variant === "dark";

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Isotipo Vectorial CENDO */}
      <div className={cn("relative flex items-center justify-center shrink-0", iconDimensions.iconSize)}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform duration-200 hover:scale-105"
        >
          <defs>
            {/* Gradiente sutil para el arco primario */}
            <linearGradient id="cendo-primary-grad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--color-primary)" />
              <stop offset="1" stopColor="#0E6386" />
            </linearGradient>

            {/* Gradiente para el arco de acento */}
            <linearGradient id="cendo-accent-grad" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--color-secondary)" />
              <stop offset="1" stopColor="#FBBF24" />
            </linearGradient>

            {/* Filtro de sombra suave */}
            <filter id="soft-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0A4D68" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Círculo base de soporte translúcido */}
          <circle cx="50" cy="50" r="46" className={isDark ? "fill-white/5" : "fill-primary/5"} />

          {/* Arco Circular Primario (Envolvente protectora) */}
          <path
            d="M 22 75 A 38 38 0 1 1 82 32"
            stroke="url(#cendo-primary-grad)"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Arco Secundario Ámbar (Acento de calidez y vida) */}
          <path
            d="M 78 40 A 34 34 0 0 1 35 83"
            stroke="url(#cendo-accent-grad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="4 1"
          />

          {/* Emblema Ginecológico Central Minimalista (Silueta anatómica armónica / Flor de loto celular) */}
          <g filter="url(#soft-glow)">
            {/* Núcleo central protector */}
            <path
              d="M 50 28 C 42 38 38 48 38 58 C 38 66 43 72 50 72 C 57 72 62 66 62 58 C 62 48 58 38 50 28 Z"
              fill={isDark ? "#FFFFFF" : "var(--color-primary)"}
              fillOpacity={isDark ? "0.9" : "0.95"}
            />
            {/* Pétalo / Trompa izquierda estilizada */}
            <path
              d="M 45 42 C 34 39 28 47 31 54 C 33 59 38 61 43 55 Z"
              fill="var(--color-secondary)"
              fillOpacity="0.9"
            />
            {/* Pétalo / Trompa derecha estilizada */}
            <path
              d="M 55 42 C 66 39 72 47 69 54 C 67 59 62 61 57 55 Z"
              fill="url(#cendo-primary-grad)"
            />
            {/* Punto de luz embrionario / vital */}
            <circle cx="50" cy="54" r="3.2" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* Logotipo Tipográfico */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-heading font-extrabold tracking-tight",
                textStyles.title,
                isDark ? "text-white" : "text-primary"
              )}
            >
              CENDO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block mb-1" />
          </div>
          <span
            className={cn(
              "font-sans font-medium uppercase",
              textStyles.subtitle,
              isDark ? "text-slate-300" : "text-muted"
            )}
          >
            Centro de Endometriosis
          </span>
        </div>
      )}
    </div>
  );
}
export default BrandLogo;

