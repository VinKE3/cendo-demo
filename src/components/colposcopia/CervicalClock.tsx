"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CervicalClockProps {
  selectedHours: string[]; // ["1", "2", ..., "12"]
  onChange?: (hours: string[]) => void;
  interactive?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLegend?: boolean;
}

export function CervicalClock({
  selectedHours = [],
  onChange,
  interactive = true,
  className,
  size = "md",
  showLegend = true,
}: CervicalClockProps) {
  const hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  // Dimensiones según tamaño
  const dimensions = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-80 h-80",
  }[size];

  const handleToggleHour = (hour: string) => {
    if (!interactive || !onChange) return;
    if (selectedHours.includes(hour)) {
      onChange(selectedHours.filter((h) => h !== hour));
    } else {
      onChange([...selectedHours, hour].sort((a, b) => parseInt(a) - parseInt(b)));
    }
  };

  const getCoordinates = (hourNumber: number, radius: number) => {
    // 12 arriba (-90 grados), 3 a la derecha (0 grados), etc.
    const angle = ((hourNumber * 30 - 90) * Math.PI) / 180;
    return {
      x: 100 + radius * Math.cos(angle),
      y: 100 + radius * Math.sin(angle),
    };
  };

  return (
    <div className={cn("flex flex-col items-center select-none", className)}>
      <div className={cn("relative", dimensions)}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="cervix-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="70%" stopColor="#FFE4E6" />
              <stop offset="100%" stopColor="#FECDD3" />
            </radialGradient>
            <filter id="cervix-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Círculo Anatómico del Cérvix (Ectocérvix) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="url(#cervix-grad)"
            stroke="#E11D48"
            strokeWidth="2.5"
            strokeOpacity="0.4"
          />

          {/* Guías de Cuadrantes (Líneas tenues en cruz Q1-Q4) */}
          <line x1="100" y1="20" x2="100" y2="180" stroke="#E11D48" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <line x1="20" y1="100" x2="180" y2="100" stroke="#E11D48" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

          {/* Etiquetas sutiles de Cuadrantes */}
          <text x="135" y="70" fill="#9F1239" opacity="0.4" fontSize="9" fontWeight="bold" textAnchor="middle">Q1</text>
          <text x="135" y="135" fill="#9F1239" opacity="0.4" fontSize="9" fontWeight="bold" textAnchor="middle">Q2</text>
          <text x="65" y="135" fill="#9F1239" opacity="0.4" fontSize="9" fontWeight="bold" textAnchor="middle">Q3</text>
          <text x="65" y="70" fill="#9F1239" opacity="0.4" fontSize="9" fontWeight="bold" textAnchor="middle">Q4</text>

          {/* Zona de Transformación Circular (ZT) */}
          <circle
            cx="100"
            cy="100"
            r="44"
            fill="none"
            stroke="#BE123C"
            strokeWidth="1.2"
            strokeDasharray="4 2"
            opacity="0.4"
          />

          {/* Orificio Cervical Externo (OCE / Hendidura transversal) */}
          <ellipse
            cx="100"
            cy="100"
            rx="11"
            ry="5.5"
            fill="#881337"
            stroke="#4C0519"
            strokeWidth="1.5"
          />

          {/* Horas del Reloj y Puntos de Biopsia (1 a 12) */}
          {hours.map((hour) => {
            const hNum = parseInt(hour, 10);
            const { x, y } = getCoordinates(hNum, 66);
            const isSelected = selectedHours.includes(hour);

            return (
              <g
                key={hour}
                onClick={() => handleToggleHour(hour)}
                className={cn(
                  "transition-all duration-150",
                  interactive ? "cursor-pointer group" : "cursor-default"
                )}
              >
                {/* Círculo de selección / interacción */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 11 : 9.5}
                  fill={isSelected ? "#EF4444" : "#FFFFFF"}
                  stroke={isSelected ? "#B91C1C" : "#CBD5E1"}
                  strokeWidth={isSelected ? 2 : 1.2}
                  className={cn(
                    "transition-all",
                    interactive && !isSelected && "group-hover:fill-red-50 group-hover:stroke-red-300"
                  )}
                />

                {/* Número de la hora */}
                <text
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fontSize={isSelected ? "9.5" : "8.5"}
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={isSelected ? "#FFFFFF" : "#475569"}
                  className="pointer-events-none select-none"
                >
                  {hour}
                </text>

                {/* Si está seleccionado: Pin indicador de biopsia */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leyenda y Horas Seleccionadas */}
      {showLegend && (
        <div className="mt-2 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {selectedHours.length > 0 ? (
              selectedHours.map((h) => (
                <span
                  key={h}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-red-100 text-status-alert border border-red-200"
                >
                  Hora {h}:00
                </span>
              ))
            ) : (
              <span className="text-[11px] text-muted italic">
                {interactive
                  ? "Haga clic en las horas para marcar sitios de biopsia"
                  : "No se tomaron biopsias dirigidas"}
              </span>
            )}
          </div>

          {interactive && selectedHours.length > 0 && (
            <p className="text-[10px] text-red-600 font-semibold">
              {selectedHours.length} muestra(s) de biopsia cervical seleccionada(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

