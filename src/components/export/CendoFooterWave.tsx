"use client";

import React from "react";
import { MapPin, Mail, Phone } from "lucide-react";

interface CendoFooterWaveProps {
  address?: string;
  email?: string;
  phone?: string;
}

export function CendoFooterWave({
  address = "Alfredo Benavides N° 2975, Of. 405 / Miraflores - Lima",
  email = "cendoperu@gmail.com",
  phone = "985 945 697",
}: CendoFooterWaveProps) {
  return (
    <div className="w-full mt-6 relative select-none">
      {/* Línea decorativa curva o franja dorada superior */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-t-full shadow-xs" />

      {/* Franja azul marino CENDO */}
      <div className="bg-[#0A4D68] text-white px-4 py-2.5 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-sans font-medium">
        <div className="flex items-center gap-1.5 truncate">
          <span className="p-1 rounded-full bg-white/10 text-amber-300 shrink-0">
            <MapPin className="w-3 h-3" />
          </span>
          <span className="truncate">{address}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="p-1 rounded-full bg-white/10 text-amber-300">
            <Mail className="w-3 h-3" />
          </span>
          <span>{email}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="p-1 rounded-full bg-white/10 text-amber-300">
            <Phone className="w-3 h-3" />
          </span>
          <span className="font-mono font-bold tracking-wider">{phone}</span>
        </div>
      </div>
    </div>
  );
}

