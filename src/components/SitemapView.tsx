import React, { useState } from "react";
import { 
  Map, 
  Layers, 
  Compass, 
  Users, 
  Building, 
  GraduationCap, 
  Network, 
  Zap, 
  Database, 
  CheckCircle,
  FileCode,
  ArrowRight,
  ExternalLink,
  Cpu
} from "lucide-react";

export default function SitemapView() {
  const [selectedStructure, setSelectedStructure] = useState<"marketing" | "student" | "corporate" | "university">("marketing");

  // Sitemap structure metadata
  const structures = {
    marketing: {
      title: "1. SITIO WEB DE MARKETING PÚBLICO Y ONBOARDING",
      target: "Usuario no logueado (Tráfico Frío, Leads B2C/B2B)",
      concept: "Captación simplificada y Onboarding multi-rol rápido para impulsar el embudo de conversión.",
      color: "border-accent-yellow text-accent-yellow bg-accent-yellow/5",
      logoClass: "bg-accent-yellow text-black",
      pages: [
        {
          name: "Home Principal (CampusPass.com)",
          type: "Relume Hero Vinku + Dynamic Course Finder",
          desc: "Presentación del Pasaporte de Destinos/Sellos/Insignias. Buscador en vivo de cursos modularizados de universidades prestigiosas.",
          integrations: "Google Analytics, HubSpot",
          simulated: "Sí, interactivo en pestaña Inicio"
        },
        {
          name: "Landing Page B2C (Personas)",
          type: "Relume Feature Grid + Diagnostic Teaser",
          desc: "Foco en el diagnóstico adaptativo de competencias y validación de logros mediante el Pasaporte. Redirección fácil al test.",
          integrations: "Hotjar, Mixpanel",
          simulated: "Sí, interactivo en pestaña Para Personas"
        },
        {
          name: "Landing Page B2B (Empresas)",
          type: "Relume Matrix Benefits + ROI Estimador Live",
          desc: "Foco en ROI, retención de talento y capacitación ágil técnica. Estimador dinámico de retornos financieros.",
          integrations: "Stripe, Salesforce CRM",
          simulated: "Sí, interactivo en pestaña Para Empresas"
        },
        {
          name: "Landing Page Universidades",
          type: "Relume Column Grid + Monetization Stats",
          desc: "Foco en monetización de catálogo pregrado/posgrado atómico y captación de matrículas corporativas automáticas.",
          integrations: "Zoom API, Canvas LTI",
          simulated: "Sí, interactivo en pestaña Universidades"
        },
        {
          name: "Authentication Hub & Multi-role Onboarding",
          type: "Relume Adaptive Step wizard Form",
          desc: "Asistente guiado de onboarding de 2 pasos. Selección de perfil de negocio (Diana, Empresa o Academia) y generación de cuenta.",
          integrations: "Firebase Auth, Auth0, JWT sign",
          simulated: "Sí, interactivo en pestaña Iniciar Sesión / Registro"
        }
      ]
    },
    student: {
      title: "2. PORTAL DEL ESTUDIANTE / USUARIO (B2C & COLABORADORES)",
      target: "Usuario autenticado / Alumno (Diana Prince)",
      concept: "Ecosistema centrado en el pasaporte de habilidades y logros para la empleabilidad real.",
      color: "border-emerald-500 text-emerald-400 bg-emerald-500/5",
      logoClass: "bg-emerald-500 text-black",
      pages: [
        {
          name: "Dashboard de Control / Mi Pasaporte Campus Pass",
          type: "Relume High-Fidelity Stats Grid + Physical Card",
          desc: "Muestra Destinos (Universidades matriculadas), Sellos (Acreditación de cursos), Insignias (Habilidades duras) e Hitos profesionales.",
          integrations: "Firebase Firestore, JWT session metadata",
          simulated: "Sí, en interfaz del Rol Estudiante (Ficha Pasaporte)"
        },
        {
          name: "Módulo Diagnóstico / Evaluación de Brechas",
          type: "Relume Logic Multi-Step Quiz",
          desc: "Cuestionario inteligente de upskilling. Configura un track adaptativo de 3, 5 o 7 cursos según presupuesto y perfil.",
          integrations: "Gemini API (para recomendaciones inteligentes)",
          simulated: "Sí, en interfaz del Rol Estudiante (Ficha Diagnóstico)"
        },
        {
          name: "Marketplace & Explorador de Rutas",
          type: "Relume Catalog + Shopping Cart / Digital Checkout",
          desc: "Visualizador de rutas inteligentes asignadas frente a catálogo regular. Compra instantánea de cursos modularizados usando saldo.",
          integrations: "Stripe Subscriptions, MercadoPago SDK",
          simulated: "Sí, en interfaz del Rol Estudiante (Ficha Marketplace)"
        },
        {
          name: "Mi Portafolio de Logros e Hitos",
          type: "Relume Showcase Grid + File Repository",
          desc: "Perfil público interactivo del estudiante donde se vinculan entregables de proyectos reales (GitHub links, Google Drive).",
          integrations: "GitHub Read/Write OAuth, Dropbox API",
          simulated: "Sí, en interfaz Estudiante (Ficha Portafolio)"
        },
        {
          name: "Vinku Fellowship & Mentorías Sincrónicas",
          type: "Relume Appointment Scheduler + Live Links",
          desc: "Reserva de mentoría adaptada a tus cursos aprobados. Sincronización instantánea con links sincrónicos de reunión.",
          integrations: "Calendly Widget, Google Calendar, Zoom Meetings",
          simulated: "Sí, en interfaz Estudiante (Ficha Fellowship)"
        }
      ]
    },
    corporate: {
      title: "3. PORTAL CORPORATIVO (COMPANIES B2B)",
      target: "Administrador / Director de Talento (L&D Leads)",
      concept: "Garantiza un control estricto de presupuestos de capacitación técnica con trazabilidad de valor.",
      color: "border-indigo-400 text-indigo-400 bg-indigo-400/5",
      logoClass: "bg-indigo-400 text-black",
      pages: [
        {
          name: "Dashboard Ejecutivo L&D",
          type: "Relume Metrics Board (Charts Matrix)",
          desc: "KPIs agregados de la empresa: Presupuesto total, créditos remanentes, colaboradores activos, promedio de horas cursadas.",
          integrations: "D3.js Dataviz, Recharts line charts",
          simulated: "Sí, en interfaz del Rol Empresa (Ficha de Control)"
        },
        {
          name: "Consola de Gestión de Talento",
          type: "Relume Dynamic Data Table + Advanced Progress bars",
          desc: "Tabla controladora de personal. Visualiza qué curso tiene asignado cada empleado, su progreso porcentual y presupuesto devengado.",
          integrations: "PostgreSQL Prisma/Drizzle",
          simulated: "Sí, en interfaz del Rol Empresa (Ficha Gestión)"
        },
        {
          name: "Billetera Corporativa de Créditos",
          type: "Relume Funding & Allocation Terminal",
          desc: "Consola financiera. Carga saldo global usando créditos corporativos y distribúyelos a billeteras individuales de colaboradores.",
          integrations: "MercadoPago, Stripe Connect, ACH integration",
          simulated: "Sí, en interfaz del Rol Empresa (Ficha Billetera)"
        },
        {
          name: "Consola de Diagnóstico de Equipos",
          type: "Relume Batch Email Invitation Manager",
          desc: "Envío masivo de invitaciones a diagnóstico técnico. Mapea brechas organizacionales antes de fondear las licencias.",
          integrations: "SendGrid Webhooks, Twilio",
          simulated: "Sí, en interfaz del Rol Empresa (Ficha Diagnóstico Masivo)"
        }
      ]
    },
    university: {
      title: "4. PORTAL DE LA UNIVERSIDAD (ALIADOS ACADÉMICOS)",
      target: "Facultades / Decanos / Directores Académicos",
      concept: "Simplificación operativa para inyectar y certificar materias de educación superior de manera ágil.",
      color: "border-amber-400 text-amber-400 bg-amber-400/5",
      logoClass: "bg-amber-400 text-black",
      pages: [
        {
          name: "Dashboard de Control Universitario",
          type: "Relume Income Dashboard Matrix",
          desc: "Consola financiera de control. Monitorea ingresos de matrícula acumulados, estudiantes totales activos e ingresos pendientes de cobros.",
          integrations: "Stripe Payouts / Split Payment Splitter",
          simulated: "Sí, en interfaz de la Universidad (Ficha Dashboard)"
        },
        {
          name: "CMS de Catálogo Académico",
          type: "Relume Advanced CRUD Form",
          desc: "Creación modular de cursos. Configura título, universidad, habilidades certificadas, duración y costo de créditos.",
          integrations: "Drizzle SQL client",
          simulated: "Sí, en interfaz de la Universidad (CMS y Carga)"
        },
        {
          name: "Lista de Matriculados por Curso",
          type: "Relume Data Table with Excel / CSV Export",
          desc: "Listado en tiempo real de alumnos inscritos en cada una de tus materias atómicas con descarga de reportería en un clic.",
          integrations: "SheetJS, CSV stringification",
          simulated: "Sí, en interfaz de la Universidad (Ficha Matriculados)"
        },
        {
          name: "Centro de Certificaciones & Validación de Sello",
          type: "Relume PDF Document upload unit with Approval actions",
          desc: "Consola de egreso. Aprueba solicitudes pendientes de alumnos que finalizaron su curso. Otorga sellos digitales y firma con insignias.",
          integrations: "AWS S3 / Google Cloud Storage, PDFKit",
          simulated: "Sí, en interfaz de la Universidad (Ficha Validación Sello)"
        }
      ]
    }
  };

  const activeStr = structures[selectedStructure];

  return (
    <div id="interactive_sitemap_view" className="space-y-8">
      
      {/* SITEMAP CARD CONCEPT AND INTRODUCTION */}
      <div className="bg-[#121216] border border-border-dark p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-accent-yellow/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-mono font-bold text-accent-yellow uppercase tracking-wider">MAPA DEL SITIO Y RUTAS SaaS</h4>
            <h3 className="text-xl font-bold text-white font-display">Navegación Unificada de Campus Pass (4 Portales en 1)</h3>
            <p className="text-xs text-text-dim max-w-2xl leading-relaxed">
              El MVP está estructurado en torno a 4 navegaciones independientes pero sincronizadas bajo un modelo de datos relacional de Node (in-memory para simulación web, listo para Postgres / Firestore).
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] bg-black/40 text-accent-yellow border border-accent-yellow/20 px-2 py-1 rounded font-mono">
              ★ Relume High-Fidelity
            </span>
          </div>
        </div>
      </div>

      {/* SELECTOR FOR 4 LOGS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(structures) as Array<keyof typeof structures>).map(key => {
          const isSelected = selectedStructure === key;
          const config = structures[key];
          return (
            <button
              key={key}
              onClick={() => setSelectedStructure(key)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected 
                  ? "bg-[#14141a] border-accent-yellow shadow-[0_0_15px_rgba(255,210,0,0.15)] ring-1 ring-accent-yellow"
                  : "bg-card-bg/50 border-border-dark hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${key === "marketing" ? "bg-accent-yellow" : key === "student" ? "bg-emerald-400" : key === "corporate" ? "bg-indigo-400" : "bg-amber-400"}`} />
                <span className="text-[10px] font-mono text-text-dim uppercase">Estructura</span>
              </div>
              <h5 className="text-[11px] font-extrabold text-white leading-tight line-clamp-1">{config.title.replace(/^\d\.\s/, '')}</h5>
              <p className="text-[10px] text-text-dim mt-1.5 leading-tight line-clamp-2">{config.target}</p>
            </button>
          );
        })}
      </div>

      {/* ACTIVE METADATA VIEW FOR THE SELECTED PORTAL PATHWAY */}
      <div className={`p-6 rounded-2xl border ${activeStr.color} space-y-4 transition-all duration-300`}>
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase bg-black/40 inline-block px-3 py-1 rounded-full border border-current font-bold">
            {activeStr.title}
          </div>
          <h4 className="text-base font-bold text-white mt-2 leading-none font-display">Destinatario Principal: {activeStr.target}</h4>
          <p className="text-xs text-text-dim">{activeStr.concept}</p>
        </div>

        {/* PAGES TREE */}
        <div className="space-y-3.5 pt-2">
          {activeStr.pages.map((p, idx) => (
            <div key={idx} className="bg-black/40 border border-border-dark/60 p-4 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-border-dark transition-all">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] font-bold text-white flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-white leading-tight">{p.name}</span>
                </div>
                <p className="text-xs text-text-dim pl-7">{p.desc}</p>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-text-dim pt-1 pl-7">
                  <span className="bg-zinc-900 border border-border-dark p-1 rounded">
                    Integraciones: <strong className="text-white font-semibold">{p.integrations}</strong>
                  </span>
                </div>
              </div>

              <div className="md:text-right space-y-1 shrink-0 bg-neutral-900/60 p-2.5 rounded-lg border border-border-dark text-[11px] md:w-[250px]">
                <div className="text-[9px] font-mono text-text-dim uppercase leading-none">Layout Estándar</div>
                <div className="font-mono text-accent-yellow font-bold mt-1 max-w-[230px] overflow-hidden text-ellipsis whitespace-nowrap">{p.type}</div>
                <div className="text-[10px] text-accent-emerald mt-1 bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20 inline-block font-mono">
                  {p.simulated}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MVP INTEGRATION STRATEGY FLOW DIAGRAM */}
      <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-4">
        <h4 className="text-sm font-mono font-bold text-text-dim uppercase tracking-wider">CONEXIONES RAPIDAS (MVP API PIPELINE)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-4 bg-black/40 rounded-xl border border-border-dark space-y-2">
            <span className="text-[10px] font-mono text-accent-yellow uppercase block font-bold">1. Diagnóstico Adaptativo</span>
            <p className="text-text-dim leading-relaxed text-[11px]">
              El usuario contesta el test → El servidor de express calcula los scores basándose en sus intereses y nivel → Genera una ruta idónea descartando cursos irrelevantes.
            </p>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-border-dark space-y-2">
            <span className="text-[10px] font-mono text-accent-yellow uppercase block font-bold">2. Billetera Digital & Stripe</span>
            <p className="text-text-dim leading-relaxed text-[11px]">
              La pasarela Stripe procesa el cargo real y transfiere saldo → El backend agrega créditos VinkU de manera instantánea → Se pueden asignar a colaboradores individuales en un clic.
            </p>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-border-dark space-y-2">
            <span className="text-[10px] font-mono text-accent-yellow uppercase block font-bold">3. Flujo Verificación Universidad</span>
            <p className="text-text-dim leading-relaxed text-[11px]">
              El alumno aprueba → El Sello se procesa digitalmente en la consola de la universidad → El pasaporte de la persona es cuñado con la nueva insignia de habilidad de por vida.
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] font-mono text-text-dim italic">
          * Este ecosistema minimiza los costos operativos garantizando un desarrollo modular veloz.
        </p>
      </div>

    </div>
  );
}
