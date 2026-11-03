# 🏛️ Notas de Arquitectura y Directrices Técnicas
## CENDO - Centro de Endometriosis (Dr. Patrick José Jacinto Gomero)
**Especialidad:** Ginecología y Obstetricia | **CMP:** 61693 | **RNE:** 38657 | **Sede:** Miraflores, Lima - Perú  
**Arquitecto Responsable:** Principal Full-Stack Architect  
**Versión del Documento:** 1.0.0  

---

## 🎯 1. Visión y Propósito del Sistema

El software de **CENDO** es una solución integral clínica y administrativa diseñada para optimizar los flujos de trabajo de consulta ginecológica avanzada, colposcopía diagnóstica, ecografía especializada y gestión ambulatoria privada.

El sistema debe combinar:
1. **Rigor Clínico Especializado:** Fichas de colposcopía conformes a la nomenclatura IFCPC/Río de Janeiro, reloj cervical interactivo de biopsias, mapeo de antecedentes gineco-obstétricos y clasificaciones estandarizadas (CIE-10, BI-RADS).
2. **Eficiencia en la Consulta:** Reducción drástica del tiempo de digitación mediante botones de normalidad por defecto, atajos de teclado (`Ctrl + K`) para vademécum y tarifario en tiempo real.
3. **Impecabilidad Documentaria:** Emisión de informes en PDF con diseño institucional inamovible (márgenes fijos, fotos cuadradas, firma digital) y exportación fidedigna de auditoría clínica en Excel (59 columnas históricas).

---

## 👑 2. Reglas de Oro del Proyecto

### 🟡 Regla de Oro N° 1: Centralización Absoluta de Tokens Visuales
> **"Ningún componente debe utilizar colores arbitrarios (hardcodeados) ni fuentes desvinculadas del sistema semántico."**

- **Variables Semánticas de Color:**
  Todo estilo de color en componentes UI se consume exclusivamente a través de las variables CSS semánticas definidas en `src/app/globals.css` y mapeadas en `tailwind.config.ts`.
  - `--primary`: `#0A4D68` (Azul Médico Profundo / Quirúrgico Institucional CENDO).
  - `--primary-hover`: `#083C51` (Interacción y estados activos primarios).
  - `--secondary`: `#F59E0B` (Ámbar cálido / Acento clínico y alertas moderadas).
  - `--surface-ground`: `#F8FAFC` (Fondo de aplicación neutro y descansado).
  - `--surface-card`: `#FFFFFF` (Tarjetas, modales y hojas clínicas).
  - `--surface-border`: `#E2E8F0` (Líneas divisorias y contornos sutiles).
  - `--text-main`: `#0F172A` (Texto principal de alto contraste).
  - `--text-muted`: `#64748B` (Etiquetas secundarias, unidades y metadatos).
  - `--status-normal`: `#10B981` (Hallazgos fisiológicos normales / benignos).
  - `--status-alert`: `#EF4444` (Patologías, biopsias requeridas y valores críticos).

- **Trilogía Tipográfica Médica:**
  1. `Plus Jakarta Sans`: Encabezados (`h1`-`h4`), identidad corporativa, métricas de KPIs y títulos de informes.
  2. `Inter` con `tabular-nums`: Cuerpo de lectura clínica, formularios, tablas de vademécum y tarifarios donde la alineación vertical de cifras y precios es crítica.
  3. `JetBrains Mono`: Identificadores precisos, DNI de pacientes, códigos CIE-10, códigos de muestra de biopsia y fórmulas obstétricas (`G_ P____`).

---

### 🟢 Regla de Oro N° 2: Arquitectura Híbrida y Demo-Resiliente
> **"El sistema debe ser 100% operativo en cualquier entorno, con o sin conexión activa a Supabase."**

Para garantizar demostraciones clínicas fluidas, pruebas de concepto y trabajo sin interrupciones:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN (UI)                  │
│       React Components / React Hook Form / TanStack Table       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              CAPA DE ACCESO A DATOS UNIFICADA (STORE)            │
│                 Zustand (`useCendoStore`)                       │
│    - Persistencia en LocalStorage con clave: `cendo-storage`    │
│    - Inicializado automáticamente con Seed Data real            │
└─────────────────┬───────────────────────────────┬───────────────┘
                  │ (Modo Cloud / Sync)           │ (Modo Local / Demo)
                  ▼                               ▼
┌─────────────────────────────────┐   ┌───────────────────────────┐
│     SUPABASE DATABASE CLIENT    │   │  IN-MEMORY / LOCAL ENGINE │
│  - Tablas PostgreSQL            │   │  - Responde en <5ms       │
│  - Row Level Security (RLS)     │   │  - Sin errores de red     │
│  - Sync asíncrono transparente  │   │  - CRUD completo activo   │
└─────────────────────────────────┘   └───────────────────────────┘
```

1. **Fallback Inteligente:** Si las variables de entorno `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) están ausentes, vacías o sin conectividad a la base de datos, el cliente de datos conmuta de forma transparente al motor local de Zustand.
2. **Seed Data Precargada:** El almacén local se auto-inicializa con los datos reales del Dr. Patrick Jacinto:
   - Paciente índice: **María Stephany Herrera Rojas** (DNI: `72961954`).
   - Tarifario ginecológico completo con categorías (Colposcopía, PAP, Biopsias, Cauterizaciones, Ecografías).
   - Vademécum estructurado por principio activo (ej. Mupirocina, Dienogest) con marcas comerciales, laboratorios y precios referenciales en Soles (S/).
3. **Cero Pantallas Rotas:** Cualquier acción de CRUD (crear paciente, registrar colposcopía, editar precio de tarifario, agregar medicamento al vademécum, generar PDF o exportar Excel) funciona de inmediato y mantiene estado persistente al recargar con `F5`.

---

## 🏗️ 3. Estructura de Directorios Recomendada

```
cendo-demo/
├── docs/
│   └── ARCHITECTURE_NOTES.md            # Este documento maestro
├── PROGRESS.md                          # Bitácora de ejecución y QA por fases
├── public/
│   ├── brand/                           # Logotipos, membretes e isotipo CENDO
│   └── signatures/                      # Firma y sello digital del Dr. Patrick
├── src/
│   ├── app/                             # Next.js App Router (Rutas y layouts)
│   │   ├── (auth)/
│   │   │   └── login/                   # Pantalla de acceso médico
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               # Shell clínico (Sidebar + Header + Ctrl+K)
│   │   │   ├── dashboard/               # Resumen de operaciones y KPIs
│   │   │   ├── pacientes/               # Directorio y Ficha de paciente
│   │   │   ├── clinico/                 # Colposcopía, Ecografías y Consulta
│   │   │   ├── tarifario/               # Mantenimiento de catálogo de precios
│   │   │   └── vademecum/               # Catálogo de genéricos, marcas y precios
│   │   ├── globals.css                  # Tokens semánticos y CSS variables
│   │   └── layout.tsx                   # Inyección de fuentes y configuración raíz
│   ├── components/
│   │   ├── layout/                      # BrandLogo, Header, Sidebar, Navigation
│   │   ├── common/                      # QuickSearch (Ctrl+K), Badges, StatsCard
│   │   ├── clinico/                     # CervicalClockSVG, ImageUploader, BioForm
│   │   └── ui/                          # Botones, Modales, Inputs accesibles
│   ├── lib/
│   │   ├── supabase/                    # Clientes Browser, Server y Admin
│   │   ├── utils/                       # Formateadores (edad, monedas, fechas)
│   │   └── export/                      # Motores de PDF y XLSX
│   ├── store/                           # Stores Zustand (UI, Auth, Clinico, LocalData)
│   └── types/                           # Definiciones TypeScript y Esquemas Zod
└── supabase/
    └── schema_and_seed.sql              # DDL de tablas PostgreSQL + Seed Data
```

---

## 🔒 4. Criterios de Calidad y Exportación Documentaria

1. **PDFs Médicos Deterministas:**
   - Todo informe emitido mediante `@react-pdf/renderer` se compila bajo dimensiones estándar A4 con márgenes estáticos inalterables (`36pt`).
   - Las imágenes colposcópicas se renderizan en celdas con relación de aspecto fija (`4:3` o `1:1`) con `object-fit: cover` garantizado para no desbordar hojas ni generar saltos de página indeseados.
   - El reloj cervical de biopsias se traslada como elemento vectorial nativo para preservar nitidez en impresión de alta resolución (300 DPI).

2. **Excel Clínico Fidedigno:**
   - La exportación a `.xlsx` mediante SheetJS preserva las 59 columnas históricas del doctor, incluyendo cabeceras descriptivas, formato numérico monetario `S/ #,##0.00` y fechas ISO/Perú `DD/MM/AAAA`.

3. **Seguridad y Validación:**
   - Validación bidireccional mediante Zod en cliente y servidor.
   - Restricción estricta de documentos de identidad peruanos (DNI: 8 dígitos numéricos, Carné de Extranjería: 9-12 caracteres).
   - Cálculos clínicos automáticos (edad en años cumplidos, amenorrea por FUR en semanas y días) ejecutados con funciones puras libres de desfases por zona horaria (`America/Lima`).

---
*Documento aprobado para el inicio de la Fase 1.*

