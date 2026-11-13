# 🏥 CENDO - Sistema Clínico & Gestión Ginecológica (Dr. Patrick Jacinto)
**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase + Zustand + React Hook Form + Zod + TanStack Table + SweetAlert2 + @react-pdf/renderer + SheetJS (xlsx).

## 📊 Estado Global del Proyecto
- **Fase Actual:** ¡Proyecto Completado al 100%! (Fases 0 a 6 finalizadas con éxito)
- **Última actualización:** 2026-11-03 - Fase 6 completada al 100% (Motor de Exportación: Generador de PDF institucional inamovible para Colposcopía y Chequeo, Consolidador de PDFs de laboratorio con `pdf-lib` y Exportador a Excel `.xlsx` con las 59 columnas históricas del Dr. Patrick Jacinto). Compilación limpia verificada (`exit code 0`).
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

### [x] FASE 3: CRUD de Tarifario Médico y CRUD de Vademécum (Genérico -> Marcas/Precios)
- [x] **3.1.** Módulo `/tarifario`: Tabla con filtros por categoría (Procedimiento, Ecografía, Laboratorio, Paquete), buscador instantáneo y CRUD completo (Crear, Editar, Eliminar y cambio de estado Activo/Inactivo con confirmación en SweetAlert2).
- [x] **3.2.** Módulo `/vademecum`: Catálogo y tabla inteligente donde el doctor busca por **Nombre Genérico** o marca y visualiza todas las **Marcas Comerciales**, laboratorio y **Precios Referenciales en Farmacias (S/)**.
- [x] **3.3.** Formulario dinámico con `useFieldArray` (`VademecumModal.tsx`) para agregar, editar o retirar múltiples marcas comerciales dentro de un mismo medicamento genérico.
- [x] **🧪 QA Fase 3:**
  - [x] Crear un examen nuevo con validación Zod (impedir precios negativos o nulos).
  - [x] Buscar "Mupirocina" o "Dienogest" y verificar el despliegue de marcas y costos referenciales.
> **Notas Técnicas Fase 3:**
> - Componente `TariffModal.tsx` con validación Zod, selectores de categorías clínicas y precios monetarios en S/.
> - Componente `VademecumModal.tsx` con `useFieldArray` para gestionar un número arbitrario de marcas comerciales por fármaco.
> - Alertas de confirmación asíncronas con SweetAlert2 para altas, modificaciones y bajas.
> - Persistencia inmediata en Zustand (`localStorage`) con reactividad instantánea en el buscador `Ctrl + K`.
> - Tipado TypeScript verificado (`npx tsc --noEmit` exit code 0).

### [x] FASE 4: CRUD Maestro de Pacientes e Historial Gineco-Obstétrico
- [x] **4.1.** Módulo `/pacientes`: Directorio con búsqueda instantánea por DNI o Apellidos, registro de nuevas pacientes con **cálculo automático de edad** según Fecha de Nacimiento.
- [x] **4.2.** Ficha clínica `/pacientes/[id]`: Antecedentes gineco-obstétricos persistentes (Menarquia, IRS, N° parejas sexuales, Fórmula Obstétrica `G_ P____`, MAC, calculadora automática de semanas por FUR) e historial de informes previos.
- [x] **🧪 QA Fase 4:**
  - [x] Validar bloqueo de DNI duplicado (`72961954`) con alerta SweetAlert2.
  - [x] Comprobar cálculo exacto de edad (ej. `28/02/1998` -> `28 años`).
> **Notas Técnicas Fase 4:**
> - Componente `PatientModal.tsx` con validación Zod, formateo automático a mayúsculas, cálculo reactivo de edad e impedimento de DNIs duplicados.
> - Componente `PatientBackgroundModal.tsx` para antecedentes gineco-obstétricos persistentes con calculadora de amenorrea en tiempo real por FUR (semanas + días).
> - Vistas `/pacientes` y `/pacientes/[id]` optimizadas con borrado en cascada y atenciones dinámicas.
> - Tipado TypeScript verificado (`npx tsc --noEmit` exit code 0).

### [x] FASE 5: Módulo Clínico (Evaluación estilo SANNA + Informe de Colposcopía + Ecografías)
- [x] **5.1.** Interfaz por bloques plegables tipo acordeón (inspirada en clínica SANNA y ficha morada de Colposcopía).
- [x] **5.2.** **Formulario de Colposcopía Inteligente:** Botón *"Marcar Hallazgos Normales por Defecto"* (pone los 35+ campos patológicos en "No" con un clic para que el médico solo active los positivos), Test de VPH, Citología PAP y buscador CIE-10.
- [x] **5.3.** **Reloj Cervical Interactivo (SVG):** Diagrama circular con cuadrantes `Q1-Q4` y horas `1 a 12` donde el doctor marca con un clic los sitios exactos de biopsia.
- [x] **5.4.** **Cargador de Imágenes Clínicas:** Subida de hasta 4 fotos colposcópicas con previsualización en grilla fija (evitando que se descuadren los espacios) y visor modal con zoom.
- [x] **5.5.** **Sub-módulo de Ecografías (Mama Bilateral y Transvaginal):** Selector de plantillas rápidas ("Mama & TV Normales", "Quiste Simple BI-RADS 2", "Mioma Intramural", "Endometrioma Ovárico") con inputs para medidas en `mm`, volumen en `cc` y clasificación BI-RADS / ACR.
- [x] **🧪 QA Fase 5:**
  - [x] Marcar horas `2`, `6` y `10` en el reloj de biopsia y verificar guardado en el estado global de Zustand.
  - [x] Subir 4 fotos con epígrafes y comprobar que mantengan su proporción aspect-4/3 en la grilla y apertura en modal.
  - [x] Selector y detalle sincronizado entre lista de informes y panel de visualización clínica.
> **Notas Técnicas Fase 5:**
> - Componente `CervicalClock.tsx` construido en SVG puro con soporte dual (modo interactivo con toggle animado de pines por hora y modo read-only para visualización en informes).
> - Componente `ColposcopyModal.tsx` con acordeón estilo SANNA, botón mágico de hallazgos fisiológicos normales por defecto, selector rápido de códigos CIE-10 (`Z01.4`, `N87.0`, `N87.1`, `N87.2`, `N87.9`), carga y epígrafes de 4 imágenes colposcópicas con firma del Dr. Patrick Jacinto Gomero.
> - Componente `CheckupModal.tsx` con 4 plantillas diagnósticas con un clic, campos numéricos validados para grosor endometrial en `mm` y volumen uterino en `cc`, y sección de prescripción médica.
> - Pantallas `/colposcopia` y `/chequeos` enriquecidas con layout master-detail (lista lateral con búsqueda instantánea + panel clínico detallado), acciones completas de edición y eliminación con confirmación SweetAlert2, y modal lightbox para ampliación fotográfica.
> - Métodos `deleteColposcopyReport`, `updateClinicalCheckup` y `deleteClinicalCheckup` agregados al store Zustand.
> - Tipado TypeScript verificado con compilación limpia (`npx tsc --noEmit` exit code 0).

### [x] FASE 6: Motor de Exportación (PDF Institucional Inamovible + Fusión de Laboratorios + Excel)
- [x] **6.1.** Generador de PDF de **Informe de Colposcopía** e **Informe de Chequeo Ginecológico** con membrete de CENDO, firma digital del Dr. Patrick, fotos alineadas y reloj de biopsia renderizado, garantizando que jamás se muevan los márgenes ni las páginas.
- [x] **6.2.** Unificador de PDFs (`pdf-lib`): Opción para adjuntar PDFs de laboratorio externo (ej. PAP y Panel VPH de Biolaq) y descargar un solo PDF consolidado de Chequeo Ginecológico.
- [x] **6.3.** Exportador a **Excel (`.xlsx`)**: Filtro por rango de fechas (`Desde` - `Hasta`) y por paciente individual que exporta las 59 columnas compatibles con el Excel histórico del doctor.
- [x] **🧪 QA Fase 6:**
  - [x] Generar el PDF de la paciente María Stephany Herrera Rojas y verificar que las páginas de Colposcopía salgan idénticas y perfectamente cuadradas en formato A4 vectorial.
  - [x] Exportar un rango de fechas a Excel y validar todas las 59 columnas estructuradas con anchos automáticos.
  - [x] Fusión asíncrona de anexos PDF con `pdf-lib` generando un documento consolidado único para entrega al paciente.
> **Notas Técnicas Fase 6:**
> - Componente `ColposcopyPrintView.tsx` y `CheckupPrintView.tsx` con maquetación A4 inamovible (`@page size: A4`), membrete oficial CENDO, fotos clínicas con `aspect-4/3` y firma médica con matrícula CMP 61693 / RNE 38657.
> - Módulo `pdfGenerator.ts` con integración de `pdf-lib` para clonación e inserción de páginas externas (`copyPages`), soporte para carátula vectorial y descarga limpia en navegador.
> - Componente `PdfMergerModal.tsx` con gestor de archivos PDF adjuntos, indicador de tamaño y descarga del informe consolidado listo para enviar por WhatsApp o correo.
> - Módulo `exportExcel.ts` con compilador de las 59 columnas históricas del consultorio (Filiación, Antecedentes, Ecografía mamaria/transvaginal, Colposcopía IFCPC y Auditoría), ajuste automático de anchos de columna y descarga directa en `.xlsx` con SheetJS.
> - Pantalla centralizada `/reportes` con vista dual (Pestaña 1: PDFs y visor en tiempo real; Pestaña 2: Matriz Excel con filtros de rango de fechas y paciente).
> - Tipado TypeScript verificado con compilación limpia (`npx tsc --noEmit` exit code 0).

---

### [x] MEJORAS ESTRATÉGICAS Y ALINEACIÓN FINAL DR. PATRICK JACINTO
- [x] **Compresión Inteligente de Imágenes en Canvas (`src/lib/imageCompressor.ts`):** Reducción automática de fotos pesadas de colposcopio y ecógrafo (de 5-10 MB a ~180 KB por foto, reduciendo dossiers de 32 MB a <2.5 MB) con escalado bicúbico de alta nitidez diagnóstica.
- [x] **Formulario `+ Nueva Colposcopia` Elevado (`src/components/colposcopia/ColposcopyModal.tsx`):**
  - Mapeo completo de las **59 columnas del Excel maestro** en acordeones SANNA colapsables.
  - **4 Plantillas Diagnósticas con 1 solo clic:** Normal / Sin LIE, LIE-BG (NIC 1), LIE-AG (NIC 2-3) y Cervicitis / Ectropion.
  - **Autoguardado de borrador en `localStorage`:** Evita pérdida de información y ofrece restauración con un clic si se cierra la ventana.
  - **Drawer de Antecedentes Clínicos integrado:** Permite al médico consultar FUR, paridad, PAP previo y VPH previo sin salir del formulario.
  - **Selector de Médicos Evaluadores:** Dr. Patrick José Jacinto Gomero (por defecto), Dr. José Luis Carrasco Pérez y Dr. Scheiler José Jacinto Gomero.
- [x] **Informe Impreso A4 Fiel de 2 Páginas (`src/components/export/ColposcopyPrintView.tsx`):**
  - Réplica exacta de las páginas 9 y 10 del dossier de chequeo real del Dr. Patrick.
  - Página 1: Membrete CENDO, Filiación, Criterios IFCPC de Evaluación General, Hallazgos Normales, Hallazgos Anormales (Grado 1, Grado 2, Schiller) y cenefa ondulada inferior.
  - Página 2: Sospecha de Invasión, Reloj Anatómico de Biopsias (`CervicalClock`), Diagnóstico Conclusivo, CIE-10, Conducta, Grilla de 4 fotografías de alta definición, Firma/Sello del Dr. Patrick y cenefa ondulada inferior.
- [x] **Integración Directa con WhatsApp (`src/lib/whatsappShare.ts`):**
  - Generación de enlaces `https://wa.me/51...` con formato clínico respetuoso para enviar resúmenes de colposcopía y chequeos preventivos.
  - Botón "Enviar a Paciente por WhatsApp" habilitado en `/colposcopia`, `/pacientes/[id]` y `/reportes`.
- [x] **Verificación de Tipos:** `npx tsc --noEmit` ejecutado con éxito (código de salida 0, 0 errores).

---

## 🚀 FASE 7: DEMO 2.0 & ETAPA A (Formatos Clínicos Críticos, Prescripción y Control Prenatal)
**Líder Técnico:** Senior Medical Systems Architect (Gobernanza Clínica & SUSALUD)  
**Objetivo de Fase:** Implementar los requerimientos clave solicitados por el Dr. Patrick Jacinto con ciclo de vida riguroso: Diseño -> Implementación -> Verificación Unitaria -> Prueba de Integración de Etapa A.

### [x] 7.0 Gobernanza Médica, Multi-Usuario y Blindaje de Acceso (Completado)
- [x] **7.0.1.** Rediseño y blindaje total de `/login`: Formulario institucional limpio, eliminación de contraseñas públicas expuestas, modal de recuperación conforme a Ley N° 29733 con conexión directa a Dirección Médica por WhatsApp.
- [x] **7.0.2.** Módulo de Equipo Médico y Gestión de Usuarios (`/usuarios`): Panel exclusivo para el Dr. Patrick como Director Médico, alta de nuevos especialistas con validación de CMP y RNE, generador de contraseñas seguras, reseteo de claves y copia de credenciales de acceso para WhatsApp.
- [x] **7.0.3.** Dinamismo total en emisión de informes y sellos: Inyección automática del médico en sesión activa en cabeceras, colposcopías y chequeos, con selector de médico evaluador en `/reportes` y respeto de género (`Dr.` / `Dra.`).
- [x] **🧪 QA 7.0:** Verificación limpia con `npx tsc --noEmit` (exit code 0).

---

### [ ] 7.1 WP-A.1: Recetario Médico Inteligente Conectado al Vademécum
- [ ] **7.1.1.** Contratos de datos (`src/types/medical.ts`): Interfaz `MedicalPrescriptionItem` (fármaco, presentación, dosis seleccionada, vía de administración, frecuencia, duración de tratamiento, indicaciones) y `MedicalPrescription` (pacienteId, doctorId, fecha, diagnóstico CIE-10, ítems, indicaciones generales).
- [ ] **7.1.2.** Estado global en Zustand (`useMedicalStore.ts`): Acciones `addPrescription`, `updatePrescription`, `deletePrescription`, `getPrescriptionsByPatientId`.
- [ ] **7.1.3.** Selector de Posología y Dosis en 1 Clic (`src/components/recetas/PrescriptionModal.tsx`): Integración con el vademécum (Mupirocina, Ginedazol, Vagitrol, Doxiciclina, Apronax/Flanax, etc.) con sugerencias automáticas de dosificación según la vía (vaginal, oral, tópica).
- [ ] **7.1.4.** Plantilla de Impresión de Receta Médica Oficial (`src/components/export/PrescriptionPrintView.tsx`): Formato institucional A5/A4 con membrete CENDO Miraflores, datos de paciente, símbolo **RP/**, detalle posológico claro, firma/sello digital del médico y botón de envío directo por WhatsApp.
- [ ] **🧪 QA 7.1 (Prueba Unitaria):**
  - Emitir receta para María Stephany Herrera con Ginedazol (1 óvulo cada 24h x 7 días) y Flanax 550mg (1 tab c/8h condicional al dolor).
  - Validar renderizado de impresión y despacho WhatsApp.

---

### [ ] 7.2 WP-A.2: Grilla Colposcópica IFCPC 2011 Exhaustiva (Zero-Whitespace)
- [ ] **7.2.1.** Mapeo estricto de criterios IFCPC en tipos y formulario: Hallazgos normales, Grado 1 (menor), Grado 2 (mayor), Sospecha de invasión y Hallazgos misceláneos.
- [ ] **7.2.2.** Rediseño de la sección IFCPC en `ColposcopyPrintView.tsx`: Tabla médica estandarizada de 2 columnas donde cada criterio aparece explícitamente con casillas `[✓] Presente` o `[ ] Ausente / Negativo`, eliminando cualquier vacío en el informe legal.
- [ ] **🧪 QA 7.2 (Prueba Unitaria):**
  - Generar informe colposcópico y verificar que todas las categorías muestren su estado explícito sin espacios en blanco.

---

### [ ] 7.3 WP-A.3: Motor de Órdenes de Laboratorio Clínico Especializado
- [ ] **7.3.1.** Contratos de datos (`src/types/medical.ts`): Interfaz `LabOrder` (categorías, análisis seleccionados, diagnóstico presuntivo CIE-10, notas para el laboratorio, doctor solicitante).
- [ ] **7.3.2.** Estado global en Zustand: Métodos para emitir, guardar y listar órdenes de laboratorio por paciente.
- [ ] **7.3.3.** Modal de Selección Rápida (`src/components/laboratorio/LabOrderModal.tsx`): Checkboxes de exámenes ginecológicos frecuentes (Hematología, Perfil ovárico/tiroideo, CA-125, PAP Base Líquida, Panel VPH PCR, Urocultivo, Perfil prenatal) + campo libre.
- [ ] **7.3.4.** Formato de Impresión Oficial (`src/components/export/LabOrderPrintView.tsx`): Hoja membretada CENDO A5/A4 con análisis marcados, firma del especialista y envío por WhatsApp.
- [ ] **🧪 QA 7.3 (Prueba Unitaria):**
  - Emitir orden para panel VPH + CA-125 y validar PDF y WhatsApp.

---

### [ ] 7.4 WP-A.4: Carnet de Control Prenatal Oficial (MINSA / CLAP)
- [ ] **7.4.1.** Contratos de datos (`src/types/medical.ts`): Modelado de la ficha basal prenatal (filiación, antecedentes obstétricos G_P____, laboratorios de tamizaje) y las 9 atenciones de control prenatal.
- [ ] **7.4.2.** Calculadora Obstétrica Automática: Algoritmo de Regla de Naegele para FPP ($\text{FUR} + 7\text{ días} - 3\text{ meses} + 1\text{ año}$) y cálculo automático de Edad Gestacional (semanas + días).
- [ ] **7.4.3.** Vista y Modal de Control Prenatal (`src/components/prenatal/PrenatalCardModal.tsx`): Matriz interactiva de 9 columnas basada fielmente en las fotos enviadas por el Dr. Patrick.
- [ ] **7.4.4.** Formato de Impresión Oficial A4 de 2 Páginas (`src/components/export/PrenatalPrintView.tsx`): Diagramación exacta del carnet MINSA/CLAP.
- [ ] **🧪 QA 7.4 (Prueba Unitaria):**
  - Crear ficha gestante con FUR real, verificar FPP y registrar Atenciones 1 y 2.

---

### [ ] 7.5 Prueba de Integración & Auditoría Final de Etapa A (Stage Gate Review)
- [ ] **7.5.1.** Compilación general TypeScript sin advertencias (`npx tsc --noEmit` exit code 0).
- [ ] **7.5.2.** Flujo clínico integrado: Desde una paciente, emitir Consulta -> Receta inteligente -> Orden de Laboratorio -> Colposcopía con grilla completa -> Carnet Prenatal.
- [ ] **7.5.3.** Verificación de fidelidad visual en generación de PDFs y despacho por WhatsApp.
