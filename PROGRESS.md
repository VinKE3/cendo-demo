# 🏥 CENDO - Sistema Clínico & Gestión Ginecológica (Dr. Patrick Jacinto)
**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase + Zustand + React Hook Form + Zod + TanStack Table + SweetAlert2 + @react-pdf/renderer + SheetJS (xlsx).

## 📊 Estado Global del Proyecto
- **Fase Actual:** Fase 3 - CRUD de Tarifario Médico y CRUD de Vademécum (Genérico -> Marcas/Precios)
- **Última actualización:** 2026-11-02 - Fase 2 completada al 100% con compilación limpia (12 rutas estáticas y dinámicas) y verificación QA.
- **Control de Proyecto:** [x] `PROGRESS.md` y `docs/ARCHITECTURE_NOTES.md` creados y actualizados.

---

## 🛠️ Fases de Construcción y Checklist de Progreso

### [x] FASE 0: Inicialización y Gobernanza del Proyecto
- [x] **0.1.** Creación y configuración del archivo maestro de seguimiento de estados (`PROGRESS.md`).
- [x] **0.2.** Definición de directrices de diseño y arquitectura resiliente en `docs/ARCHITECTURE_NOTES.md`.

### [x] FASE 1: Base del Proyecto, Tokens de Diseño, SQL en Supabase y Login
- [x] **1.1.** Configuración de librerías (`lucide-react`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`, `sweetalert2`, `@supabase/supabase-js`, `@supabase/ssr`, `clsx`, `tailwind-merge`).
- [x] **1.2.** Configuración de fuentes médicas en `layout.tsx` (`Plus Jakarta Sans` para títulos, `Inter` para cuerpo/tablas con `tabular-nums`, `JetBrains Mono` para códigos CIE-10/DNI).
- [x] **1.3.** Creación del sistema de variables semánticas de color en `src/app/globals.css` y `tailwind.config.ts` (Primary `#0A4D68`, Secondary `#F59E0B`, superficies, textos y estados Normal `#10B981` / Alerta `#EF4444`).
- [x] **1.4.** Creación del componente reutilizable `<BrandLogo />` (`src/components/layout/BrandLogo.tsx`) con isotipo SVG vectorial demostrativo para CENDO.
- [x] **1.5.** Creación del script SQL maestro en `supabase/schema_and_seed.sql` (7 tablas + Data Semilla real con la paciente María Stephany Herrera Rojas DNI 72961954, tarifario ginecológico y vademécum con Mupirocina, Dienogest, etc.).
- [x] **1.6.** Creación del pantalla `/login` con diseño clínico, validación con Zod, alertas con SweetAlert2 y botón de "Acceso Rápido Demo (Dr. Patrick Jacinto)".
- [x] **🧪 QA Fase 1:**
  - [x] Verificar cambio de color global modificando una sola variable en `globals.css`.
  - [x] Probar acceso con el botón Demo y redirección a `/dashboard`.
  - [x] Probar protección de rutas y persistencia de sesión al recargar (`F5`).
> **Notas Técnicas Fase 1:**
> - Implementado enrutamiento con App Router de Next.js 14 y tipado estricto TypeScript.
> - Store en Zustand (`src/store/useMedicalStore.ts`) con sincronización en `localStorage` (`cendo-storage`), permitiendo total autonomía demo-resiliente con datos del Dr. Patrick Jacinto.
> - Componente `<BrandLogo />` vectorial paramétrico (`sm`, `md`, `lg`, `xl`, `light`, `dark`).
> - Script SQL con índices aceleradores `<100ms`, DDL de 7 tablas clínicas y semillas médicas completas.
> - Pantalla `/login` construida con diseño clínico a dos columnas, validación Zod y modal SweetAlert2 con feedback de bienvenida. Compilación de producción verificada (`exit code 0`).

### [x] FASE 2: Dashboard Layout Profesional, Buscador Global (`Ctrl + K`) y KPIs
- [x] **2.1.** Creación de `Sidebar` colapsable y `Header` superior con datos del Dr. Patrick (CMP 61693 / RNE 38657).
- [x] **2.2.** Implementación del **Buscador Rápido Global (`Ctrl + K`)** accesible desde cualquier pantalla para consultar al instante precios de procedimientos o medicamentos genéricos/marcas sin perder lo que se está llenando.
- [x] **2.3.** Vista principal `/dashboard` con KPIs del consultorio, accesos rápidos ("Nueva Colposcopía", "Nuevo Chequeo", "Consultar Precio", "Vademécum") y tabla de atenciones recientes.
- [x] **🧪 QA Fase 2:**
  - [x] Abrir modal con `Ctrl + K` desde cualquier vista y buscar un examen o fármaco en <150ms.
  - [x] Verificar diseño responsivo en pantalla Desktop (1080p) y Tablet (iPad).
> **Notas Técnicas Fase 2:**
> - Estructura modular bajo Route Group `src/app/(dashboard)/layout.tsx` con Sidebar colapsable (`w-68` a `w-20`) y Header persistente.
> - Componente `CommandSearchModal.tsx` con listener de teclado global (`Ctrl + K` / `Cmd + K`), búsqueda reactiva con normalización y 3 pestañas simultáneas (Tarifario en S/, Vademécum con marcas/laboratorios y Directorio de pacientes).
> - Vista `/dashboard` enriquecida con 4 KPIs en tiempo real, barra de acciones rápidas, panel de atenciones de la paciente María Stephany Herrera Rojas y widgets de consulta inmediata de tarifas y vademécum.
> - Creadas rutas conectadas `/pacientes`, `/pacientes/[id]`, `/colposcopia`, `/chequeos`, `/tarifario`, `/vademecum` y `/reportes`. Compilación verificada con 12 rutas (`exit code 0`).

### [ ] FASE 3: CRUD de Tarifario Médico y CRUD de Vademécum (Genérico -> Marcas/Precios)
- [ ] **3.1.** Módulo `/tarifario`: Tabla con filtros por categoría (Procedimiento, Ecografía, Laboratorio, Paquete), buscador instantáneo y CRUD completo (Crear, Editar, Eliminar con confirmación en SweetAlert2).
- [ ] **3.2.** Módulo `/vademecum`: Tabla inteligente donde el doctor busca por **Nombre Genérico** y visualiza todas las **Marcas Comerciales**, laboratorio y **Precios Referenciales en Farmacias (S/)**.
- [ ] **3.3.** Formulario dinámico con `useFieldArray` para agregar o editar múltiples marcas comerciales dentro de un mismo medicamento genérico.
- [ ] **🧪 QA Fase 3:**
  - [ ] Crear un examen nuevo con validación Zod (impedir precios negativos).
  - [ ] Buscar "Mupirocina" o "Dienogest" y verificar el despliegue de marcas y costos referenciales.

### [ ] FASE 4: CRUD Maestro de Pacientes e Historial Gineco-Obstétrico
- [ ] **4.1.** Módulo `/pacientes`: Directorio con búsqueda instantánea por DNI o Apellidos, registro de nuevas pacientes con **cálculo automático de edad** según Fecha de Nacimiento.
- [ ] **4.2.** Ficha clínica `/pacientes/[id]`: Antecedentes gineco-obstétricos persistentes (Menarquia, IRS, N° parejas sexuales, Fórmula Obstétrica `G_ P____`, MAC, calculadora automática de semanas por FUR) e historial de informes previos.
- [ ] **🧪 QA Fase 4:**
  - [ ] Validar bloqueo de DNI duplicado (`72961954`) con alerta SweetAlert2.
  - [ ] Comprobar cálculo exacto de edad (ej. `28/02/1998` -> `28 años`).

### [ ] FASE 5: Módulo Clínico (Evaluación estilo SANNA + Informe de Colposcopía + Ecografías)
- [ ] **5.1.** Interfaz por bloques plegables tipo acordeón (inspirada en clínica SANNA y ficha morada de Colposcopía).
- [ ] **5.2.** **Formulario de Colposcopía Inteligente:** Botón *"Marcar Hallazgos Normales por Defecto"* (pone los 35+ campos patológicos en "No" con un clic para que el médico solo active los positivos), Test de VPH, Citología PAP y buscador CIE-10.
- [ ] **5.3.** **Reloj Cervical Interactivo (SVG):** Diagrama circular con cuadrantes `Q1-Q4` y horas `1 a 12` donde el doctor marca con un clic los sitios exactos de biopsia.
- [ ] **5.4.** **Cargador de Imágenes Clínicas:** Subida de hasta 4 fotos colposcópicas con previsualización en grilla fija (evitando que se descuadren los espacios).
- [ ] **5.5.** **Sub-módulo de Ecografías (Mama Bilateral y Transvaginal):** Selector de plantillas rápidas ("Mama Bilateral Normal", "Quiste Simple BI-RADS 2", "TV Normal") con inputs para medidas en `mm`, volumen en `cc` y clasificación BI-RADS / ACR.
- [ ] **🧪 QA Fase 5:**
  - [ ] Marcar horas `2`, `6` y `10` en el reloj de biopsia y verificar guardado en el estado global de Zustand.
  - [ ] Subir 3 fotos de distintos tamaños y comprobar que mantengan su proporción en la grilla.

### [ ] FASE 6: Motor de Exportación (PDF Institucional Inamovible + Fusión de Laboratorios + Excel)
- [ ] **6.1.** Generador de PDF de **Informe de Colposcopía** e **Informe de Chequeo Ginecológico** con membrete de CENDO, firma digital del Dr. Patrick, fotos alineadas y reloj de biopsia renderizado, garantizando que jamás se muevan los márgenes ni las páginas.
- [ ] **6.2.** Unificador de PDFs (`pdf-lib`): Opción para adjuntar PDFs de laboratorio externo (ej. PAP y Panel VPH de Biolaq) y descargar un solo PDF consolidado de Chequeo Ginecológico.
- [ ] **6.3.** Exportador a **Excel (`.xlsx`)**: Filtro por rango de fechas (`Desde` - `Hasta`) y por paciente individual que exporta las 59 columnas compatibles con el Excel histórico del doctor.
- [ ] **🧪 QA Fase 6:**
  - [ ] Generar el PDF de la paciente María Stephany Herrera Rojas y verificar que las páginas de Colposcopía salgan idénticas y perfectamente cuadradas.
  - [ ] Exportar un rango de fechas a Excel y validar todas las columnas.
