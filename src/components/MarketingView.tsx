import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Award, 
  Shield, 
  DollarSign, 
  Wallet, 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  HelpCircle, 
  Star, 
  Target, 
  Zap, 
  Globe, 
  Building, 
  BarChart, 
  ArrowUpRight,
  ChevronRight,
  Code,
  ShieldCheck,
  Check
} from "lucide-react";
import { Course } from "../types";

interface MarketingViewProps {
  courses: Course[];
  setActiveRole: (role: "marketing" | "student" | "corporate" | "university" | "architecture") => void;
  setStudentTab: (tab: any) => void;
  setCorpTab: (tab: any) => void;
  setMarketingTab: (tab: any) => void;
  marketingTab: "home" | "b2c" | "b2b" | "universidad" | "auth";
  handleEnrollCourse: (courseId: string) => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function MarketingView({
  courses,
  setActiveRole,
  setStudentTab,
  setCorpTab,
  marketingTab,
  setMarketingTab,
  handleEnrollCourse,
  triggerToast
}: MarketingViewProps) {
  // Homepage state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // B2B Landing ROI calculator state
  const [numEmployees, setNumEmployees] = useState(25);
  const [avgCourseCost, setAvgCourseCost] = useState(500);

  // B2B Lead Contact Form state for Prospectos_Empresas
  const [b2bCompanyName, setB2bCompanyName] = useState("");
  const [b2bEmail, setB2bEmail] = useState("");
  const [b2bEmployees, setB2bEmployees] = useState("50");
  const [b2bSuccess, setB2bSuccess] = useState(false);
  const [b2bSubmittedLead, setB2bSubmittedLead] = useState<any>(null);

  const handleB2bLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/vinkupass/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: b2bCompanyName,
          workEmail: b2bEmail,
          employeeCount: b2bEmployees
        })
      });
      const data = await response.json();
      if (data.success) {
        setB2bSuccess(true);
        setB2bSubmittedLead(data.lead);
        triggerToast("¡Suscripción de Convenio Exitosa! Registrado en la tabla Prospectos_Empresas", "success");
        setB2bCompanyName("");
        setB2bEmail("");
      } else {
        triggerToast("Error al enviar formulario", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al enviar prospecto", "error");
    }
  };

  // Authentication hub state
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingRole, setOnboardingRole] = useState<"student" | "corporate" | "university">("student");
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedCategory === "Todos") return matchesSearch;
    return matchesSearch && c.category.includes(selectedCategory);
  });

  // Calculate ROI Metrics
  const traditionalCost = numEmployees * 2800; // traditional average continuous education
  const vinkuCost = numEmployees * avgCourseCost;
  const savings = traditionalCost - vinkuCost;
  const productivityGain = Math.round(numEmployees * 48); // active retention hours estimated

  const categories = ["Todos", "Ingeniería & Tech", "Negocios & Marketing", "AI & Data Science", "Diseño & UX"];

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(`¡Bienvenido a Vinkupass! Cuenta creada como ${onboardingRole === "student" ? "Estudiante" : onboardingRole === "corporate" ? "Empresa" : "Universidad"}.`, "success");
    setActiveRole(onboardingRole);
    if (onboardingRole === "student") {
      setStudentTab("diag"); // Take straight to logical diagnosis 
    }
  };

  return (
    <div id="marketing_view_container" className="space-y-12">
      
      {/* COMPONENTE NAVBAR PÚBLICO (Navegación Superior) */}
      <div id="vinkupass_public_navbar" className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FAFAFA] border-4 border-[#1A1A1A] p-4 shadow-rigid-violet rounded-none relative mb-8 text-[#1A1A1A]">
        {/* Logo de la plataforma */}
        <div 
          onClick={() => setMarketingTab("home")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-[#FFD000] border-2 border-[#1A1A1A] flex items-center justify-center text-black font-display font-extrabold text-lg shadow-[3px_3px_0px_#1A1A1A] transition-transform group-hover:scale-105 animate-bounce">
            V
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-vinku text-[#1A1A1A] font-display">
              Vinku<span className="text-[#6C47FF]">pass</span>
            </span>
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#6C47FF]">Del campus, de todos.</span>
          </div>
        </div>

        {/* Enlaces ágiles */}
        <div className="flex items-center gap-1 p-1 bg-[#1A1A1A] rounded-none border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#6C47FF]">
          {[
            { id: "b2c", label: "Para Personas" },
            { id: "b2b", label: "Para Empresas" },
            { id: "universidad", label: "Alianza Universidades" },
          ].map(tab => {
            const isSelected = marketingTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mkt_tab_selector_${tab.id}`}
                onClick={() => setMarketingTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? "bg-[#FFD000] text-black border-2 border-black" 
                    : "text-white hover:text-[#FFD000]"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-3">
          <button
            id="login_trigger_btn"
            onClick={() => {
              setMarketingTab("auth");
              setAuthMode("login");
              setOnboardingStep(1);
            }}
            className="text-[#1A1A1A] hover:bg-zinc-200 text-xs font-extrabold py-2 px-4 border-2 border-transparent hover:border-[#1A1A1A] rounded-none transition-all cursor-pointer"
          >
            Iniciar Sesión
          </button>
          
          <button
            id="diagnostico_trigger_btn"
            onClick={() => {
              setMarketingTab("auth");
              setAuthMode("register");
              setOnboardingRole("student");
              setOnboardingStep(1);
              triggerToast("Iniciando tu Diagnóstico. Regístrate gratis para empezar.", "info");
            }}
            className="bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] border-2 border-[#1A1A1A] text-xs font-extrabold py-2.5 px-4 rounded-none flex items-center gap-1.5 transition-all cursor-pointer shadow-[3px_3px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span>Haz tu Diagnóstico</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. MARKETING STATION A: HOMEPAGE (LANDING PRINCIPAL)       */}
      {/* ========================================================== */}
      {marketingTab === "home" && (
        <div id="mkt_home_section" className="space-y-16 animate-fade-in text-[#1A1A1A]">
          
          {/* HERO BANNER - AMARILLO ENERGÉTICO & TRAMA BEN-DAY */}
          <div className="relative overflow-hidden bg-[#FFD000] border-4 border-[#1A1A1A] p-8 md:p-12 shadow-rigid-black bg-benday-yellow rounded-none text-[#1A1A1A]">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
              <div className="lg:col-span-3 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] border-2 border-[#1A1A1A] text-xs text-[#FFD000] font-extrabold shadow-[2px_2px_0px_#6C47FF]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Del campus, de todos.</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-vinku text-[#1A1A1A] leading-none font-display">
                  Tus materias universitarias en tu pasaporte de upskilling ágil.
                </h2>
                
                <p className="text-sm md:text-base text-[#1A1A1A] font-bold max-w-xl leading-snug">
                  48 horas. Plan con números reales. Desagrega cursos universitarios y conviértelos en créditos con respaldo corporativo oficial.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    id="hero_start_journey_btn"
                    onClick={() => {
                      setMarketingTab("auth");
                      setOnboardingRole("student");
                    }}
                    className="bg-[#FAFAFA] hover:bg-zinc-100 text-[#1A1A1A] text-xs md:text-sm font-extrabold py-3.5 px-6 border-3 border-[#1A1A1A] rounded-none flex items-center gap-2 shadow-[5px_5px_0px_#1A1A1A] active:translate-y-[1px] active:translate-x-[1px]"
                  >
                    <span>Empezar Como Estudiante</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="hero_b2b_demo_btn"
                    onClick={() => setMarketingTab("b2b")}
                    className="bg-[#6C47FF] hover:bg-indigo-700 text-[#FAFAFA] text-xs md:text-sm font-extrabold py-3.5 px-6 border-3 border-[#1A1A1A] rounded-none flex items-center gap-2 shadow-[5px_5px_0px_#1A1A1A] active:translate-y-[1px] active:translate-x-[1px]"
                  >
                    <span>Ver Plataforma B2B</span>
                    <Building className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-bold font-mono text-[#1A1A1A]">
                  <div className="flex items-center gap-1.5 bg-[#FAFAFA] px-2.5 py-1 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                    <CheckCircle className="w-4 h-4 text-[#6C47FF]" />
                    <span>MVP ÁGIL LISTO</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FAFAFA] px-2.5 py-1 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                    <CheckCircle className="w-4 h-4 text-[#6C47FF]" />
                    <span>SELLO UNIVERSITAS</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FAFAFA] px-2.5 py-1 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                    <CheckCircle className="w-4 h-4 text-[#6C47FF]" />
                    <span>CRÉDITO VINKU ACTIVO</span>
                  </div>
                </div>
              </div>

              {/* CONCEPTO INTERACTIVO DEL PASAPORTE (TEASER CARD) - BLANCO ROTO CON SOMBRA VIOLETA RIGIDA */}
              <div className="lg:col-span-2">
                <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] p-6 shadow-rigid-violet rounded-none relative overflow-hidden space-y-4 text-[#1A1A1A]">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-[#1A1A1A] text-[#FFD000] border-b-2 border-l-2 border-[#1A1A1A] font-mono text-[9px] font-extrabold uppercase tracking-widest">
                    PASAPORTE ACTIVO
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] flex items-center justify-center font-extrabold text-black text-xl shadow-[2px_2px_0px_#1A1A1A]">
                      V
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono font-bold text-[#6C47FF] uppercase leading-none">VINKUPASS PORTFOLIO</h4>
                      <p className="text-sm font-extrabold text-[#1A1A1A] mt-1.5 leading-none">Diana Prince (Demo)</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex items-center justify-between p-2.5 bg-[#FAFAFA] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                      <span className="text-[#1A1A1A] font-mono text-[9px] font-bold">Sello Andes:</span>
                      <span className="text-[#6C47FF] font-extrabold flex items-center gap-1 text-[11px]">
                        <Check className="w-3.5 h-3.5" /> Certificado
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#FAFAFA] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                      <span className="text-[#1A1A1A] font-mono text-[9px] font-bold">Sello TecMTY:</span>
                      <span className="text-[#1A1A1A] font-extrabold flex items-center gap-1 text-[11px] bg-[#FFD000] px-1 border border-[#1A1A1A]">
                        ● Cursando
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#FAFAFA] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                      <span className="text-[#1A1A1A] font-mono text-[9px] font-bold">Habilidades:</span>
                      <span className="text-[#1A1A1A] font-mono text-[10px] bg-[#FFD000] px-1.5 py-0.5 border border-[#1A1A1A] font-extrabold shadow-[1px_1px_0px_#1A1A1A]">
                        Cloud / Full Stack
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-700 text-center italic font-mono pt-1">
                    * Tu "Vinkupass" centraliza Destinos, Sellos, Insignias y una Billetera.
                  </p>

                  <button
                    onClick={() => {
                      setActiveRole("student");
                      setStudentTab("pass");
                    }}
                    className="w-full bg-[#FAFAFA] border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FFD000] font-extrabold text-xs py-2 rounded-none transition-all cursor-pointer text-center shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[1px]"
                  >
                    Abrir Demo Real del Pasaporte →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BUSCADOR DE CURSOS / EXPLORADOR MODULAR */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-extrabold text-[#1A1A1A] font-display uppercase tracking-vinku">Busca Tu Próxima Unidad Académica</h3>
              <p className="text-xs text-zinc-700 max-w-md mx-auto leading-relaxed font-bold">
                Navega el portafolio descentralizado agregador de materias certificadoras.
              </p>
            </div>

            {/* TAB CATEGORIES */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-4 py-2 font-extrabold rounded-none border-2 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#FFD000] text-black border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
                      : "bg-[#FAFAFA] text-[#1A1A1A] border-[#1A1A1A] hover:bg-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* BUSCADOR INPUT */}
            <div className="max-w-md mx-auto flex items-center gap-2 bg-white border-3 border-[#1A1A1A] rounded-none px-4 py-3 shadow-[4px_4px_0px_#1A1A1A]">
              <Search className="w-5 h-5 text-[#1A1A1A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por temas (AWS, React, IA, Growth...)"
                className="bg-transparent text-xs text-[#1A1A1A] outline-none w-full font-bold placeholder-zinc-500"
              />
            </div>

            {/* GRID OF INBUILDING MATERIALS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.slice(0, 6).map(cur => (
                <div key={cur.id} className="bg-[#FAFAFA] border-3 border-[#1A1A1A] p-5 flex flex-col justify-between h-[255px] relative shadow-rigid-violet rounded-none">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                      <span className="text-[#6C47FF] font-extrabold uppercase">{cur.university}</span>
                      <span className="text-zinc-600 font-extrabold">{cur.level}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-[#1A1A1A] leading-tight line-clamp-2 uppercase font-display tracking-tight">{cur.title}</h4>
                    <p className="text-xs text-zinc-700 mt-2 line-clamp-3 font-semibold">{cur.description}</p>
                  </div>

                  <div className="border-t-2 border-[#1A1A1A] pt-3 mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase font-mono text-zinc-600 font-extrabold">Monto Créditos</div>
                      <span className="text-sm font-black text-[#1A1A1A] font-mono">USD {cur.cost}</span>
                    </div>

                    <button
                      onClick={() => {
                        triggerToast(`Por favor regístrate o inicia sesión para matricularte en '${cur.title}'`, "info");
                        setMarketingTab("auth");
                      }}
                      className="bg-[#FFD000] hover:bg-yellow-400 border-2 border-[#1A1A1A] text-black text-xs font-bold py-1.5 px-3 rounded-none transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#1A1A1A]"
                    >
                      <span>Inscribirse</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* 2. MARKETING STATION B: LANDING B2C (PARA PERSONAS)        */}
      {/* ========================================================== */}
      {marketingTab === "b2c" && (
        <div id="mkt_b2c_section" className="space-y-16 animate-fade-in">
          
          {/* SECCIÓN HERO DE CAPTACIÓN EMOCIONAL */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#121217] to-black rounded-3xl border border-border-dark p-8 md:p-12 text-center space-y-6">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-yellow/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-xs text-accent-yellow font-medium mx-auto">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Pasaporte de Empleabilidad Activo</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display max-w-4xl mx-auto">
              Tu pasaporte al empleo del futuro sin las barreras de la educación tradicional.
            </h1>

            <p className="text-sm md:text-base text-text-dim max-w-2xl mx-auto leading-relaxed">
              Diseña una ruta de aprendizaje ágil de 3, 5 o 7 cursos de las mejores universidades del país adaptada a tu perfil y objetivos profesionales.
            </p>

            <div className="flex justify-center pt-2">
              <button
                id="hero_start_b2c_diagnostico_btn"
                onClick={() => {
                  setMarketingTab("auth");
                  setAuthMode("register");
                  setOnboardingRole("student");
                  setOnboardingStep(1);
                  triggerToast("Cargando asistente de diagnóstico. Por favor regístrate para guardar tu pasaporte", "info");
                }}
                className="bg-accent-yellow hover:bg-yellow-400 text-black text-xs md:text-sm font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(255,210,0,0.25)] hover:shadow-[0_0_30px_rgba(255,210,0,0.4)] transition-all cursor-pointer"
              >
                <span>Iniciar Diagnóstico Gratuito</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-text-dim">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent-emerald" />
                <span>100% Sincrónico & Modular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent-emerald" />
                <span>Validado por Universidades</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent-emerald" />
                <span>Créditos Transferibles</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN INTERACTIVA "EL CONCEPTO VINKUPASS" */}
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <h3 className="text-xl md:text-2xl font-bold text-white font-display">El Concepto Vinkupass</h3>
              <p className="text-xs text-text-dim max-w-md mx-auto leading-relaxed">
                Cómo se compone tu pasaporte educativo digital sincrónico descentralizado.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Columna 1 */}
              <div className="bg-card-bg border border-border-dark rounded-xl p-5 hover:border-accent-yellow/40 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 flex items-center justify-center text-accent-yellow font-bold text-sm mb-1.5">
                    01
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">Destinos</h4>
                  <p className="text-xs text-text-dim leading-relaxed text-left">
                    Las universidades prestigiosas donde cursas tus asignaturas disgregadas.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-accent-yellow uppercase tracking-wider text-left">Universidades Socias →</span>
              </div>

              {/* Columna 2 */}
              <div className="bg-card-bg border border-border-dark rounded-xl p-5 hover:border-accent-yellow/40 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 flex items-center justify-center text-accent-yellow font-bold text-sm mb-1.5">
                    02
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">Sellos</h4>
                  <p className="text-xs text-text-dim leading-relaxed text-left">
                    Tus cursos aprobados estampados digitalmente en tiempo real.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-accent-yellow uppercase tracking-wider text-left">Validación Segura →</span>
              </div>

              {/* Columna 3 */}
              <div className="bg-card-bg border border-border-dark rounded-xl p-5 hover:border-accent-yellow/40 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 flex items-center justify-center text-accent-yellow font-bold text-sm mb-1.5">
                    03
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">Insignias</h4>
                  <p className="text-xs text-text-dim leading-relaxed text-left">
                    Las habilidades técnicas que desarrollas y demuestras sobre la marcha.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-accent-yellow uppercase tracking-wider text-left">Skill Mapping →</span>
              </div>

              {/* Columna 4 */}
              <div className="bg-card-bg border border-border-dark rounded-xl p-5 hover:border-accent-yellow/40 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 flex items-center justify-center text-accent-yellow font-bold text-sm mb-1.5">
                    04
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">Salida Laboral</h4>
                  <p className="text-xs text-text-dim leading-relaxed text-left">
                    Los roles profesionales activos que desbloqueas al completar tu ruta.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-accent-yellow uppercase tracking-wider text-left">Empleabilidad Real →</span>
              </div>

            </div>
          </div>

          {/* COMPONENTE "BUSCADOR RÁPIDO DE CURSOS MODULARES" */}
          <div className="bg-[#111116] border border-border-dark rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-1 text-left">
              <h3 className="text-lg font-bold text-white font-display">Buscador Rápido de Cursos Modulares</h3>
              <p className="text-xs text-text-dim max-w-xl leading-relaxed">
                Busca habilidades de asignaturas atomizadas en tiempo real. Utiliza los filtros seleccionables para descubrir rutas universitarias y sus créditos equivalentes de inmediato.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Input de Búsqueda */}
              <div className="md:col-span-2 flex items-center gap-2.5 bg-[#09090c] border border-border-dark rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-text-dim shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué habilidad o curso quieres aprender hoy?"
                  className="bg-transparent text-xs text-white outline-none w-full"
                />
              </div>

              {/* Limpiar Filtros button */}
              {(searchQuery !== "" || selectedCategory !== "Todos") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Todos");
                  }}
                  className="text-accent-yellow text-xs font-semibold hover:underline cursor-pointer text-left md:text-right"
                >
                  Limpiar Filtros ×
                </button>
              )}
            </div>

            {/* Quick tag filters */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "Todos", filter: "Todos" },
                { label: "Tecnología", filter: "Ingeniería & Tech" },
                { label: "Negocios & Marketing", filter: "Negocios & Marketing" },
                { label: "Diseño & UX", filter: "Diseño & UX" },
                { label: "AI & Data Science", filter: "AI & Data Science" },
              ].map(tag => (
                <button
                  key={tag.filter}
                  onClick={() => setSelectedCategory(tag.filter)}
                  className={`text-xs px-4 py-2 rounded-full border transition-all cursor-pointer ${
                    selectedCategory === tag.filter
                      ? "bg-accent-yellow text-black font-bold border-accent-yellow"
                      : "bg-black/40 text-text-dim border-border-dark hover:text-white hover:border-gray-600"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredCourses.length > 0 ? (
                filteredCourses.slice(0, 6).map(cur => (
                  <div key={cur.id} className="bg-card-bg/60 border border-border-dark rounded-xl p-5 flex flex-col justify-between h-[230px] hover:border-gray-700 transition-all">
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase text-text-dim mb-1">
                        <span className="text-accent-yellow font-bold">{cur.university}</span>
                        <span>{cur.level}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{cur.title}</h4>
                      <p className="text-[11px] text-text-dim mt-1.5 line-clamp-3 leading-relaxed">{cur.description}</p>
                    </div>

                    <div className="border-t border-border-dark/40 pt-3 mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-[8px] uppercase font-mono text-text-dim">Monto Créditos</div>
                        <span className="text-xs font-mono font-bold text-white">USD {cur.cost}</span>
                      </div>

                      <button
                        onClick={() => {
                          triggerToast(`Por favor regístrate o inicia sesión para matricularte en '${cur.title}'`, "info");
                          setMarketingTab("auth");
                          setAuthMode("register");
                        }}
                        className="bg-black hover:bg-neutral-800 border border-border-dark text-white hover:border-accent-yellow text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Inscribirse</span>
                        <ArrowUpRight className="w-3 h-3 text-accent-yellow" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center bg-black/20 border border-dashed border-border-dark rounded-xl">
                  <p className="text-xs text-text-dim font-mono">No se encontraron cursos de '{searchQuery}' para la categoría seleccionada.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
      {marketingTab === "b2b" && (
        <div id="mkt_b2b_section" className="space-y-16 animate-fade-in">
          
          {/* HERO B2B (Propuesta de Valor de Neoeducación) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#121217] to-black rounded-3xl border border-border-dark p-8 md:p-12 text-center space-y-6">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-yellow/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-xs text-accent-yellow font-medium mx-auto">
              <Building className="w-3.5 h-3.5 animate-pulse" />
              <span>Neoeducación Corporativa B2B</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display max-w-4xl mx-auto">
              Potencia el talento de tu empresa con rutas de aprendizaje universitarias a la medida.
            </h1>

            <p className="text-sm md:text-base text-text-dim max-w-3xl mx-auto leading-relaxed">
              Mapea las brechas de habilidades de tus colaboradores de forma automatizada, asigna presupuestos educativos flexibles y audita el progreso real de tu equipo desde una sola consola gerencial.
            </p>

            <div className="flex justify-center pt-2">
              <button
                id="hero_b2b_start_btn"
                onClick={() => {
                  setMarketingTab("auth");
                  setAuthMode("register");
                  setOnboardingRole("corporate");
                  setOnboardingStep(1);
                  triggerToast("Cargando onboarding para Empresas.", "info");
                }}
                className="bg-accent-yellow hover:bg-yellow-400 text-black text-xs md:text-sm font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(255,210,0,0.25)] transition-all cursor-pointer"
              >
                <span>Crear Cuenta Corporativa / Agendar Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SECCIÓN DE INDICADORES DE VALOR (Métricas de Impacto y ROI) */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-white font-display">Métricas de Impacto & Beneficios Corporativos</h3>
              <p className="text-xs text-text-dim max-w-md mx-auto leading-relaxed">
                Cómo transformamos la capacitación tradicional en una ventaja competitiva medible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Bloque 1 */}
              <div className="bg-card-bg border border-border-dark rounded-2xl p-6 space-y-3 hover:border-accent-yellow/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                  <Wallet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Billetera Corporativa Centralizada</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Fondea la cuenta de tu empresa una sola vez y distribuye créditos de manera personalizada para que tus empleados elijan cursos en el marketplace de forma autónoma.
                </p>
              </div>

              {/* Bloque 2 */}
              <div className="bg-card-bg border border-border-dark rounded-2xl p-6 space-y-3 hover:border-accent-yellow/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Consola de Diagnóstico Masivo</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Envía evaluaciones automáticas a cientos de colaboradores en minutos. Olvídate de armar planes manuales; el sistema calcula sus rutas óptimas por ti.
                </p>
              </div>

              {/* Bloque 3 */}
              <div className="bg-card-bg border border-border-dark rounded-2xl p-6 space-y-3 hover:border-accent-yellow/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Auditoría de Pasaportes en Tiempo Real</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Monitorea las insignias de habilidades y sellos académicos que tus empleados van desbloqueando sin necesidad de solicitar diplomas físicos.
                </p>
              </div>

            </div>

            {/* ESTIMADOR ROI COMPONENT */}
            <div className="bg-[#121216] border border-border-dark p-6 md:p-8 rounded-2xl relative">
              <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-accent-yellow">
                ESTIMADOR ROI DE APRENDIZAJE VINKU
              </div>

              <h4 className="text-base font-bold text-white font-display mb-4">Calcula el Retorno de tu Inversión</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center font-sans">
                
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-2">
                      Número de Colaboradores: <strong className="text-white text-xs">{numEmployees} empleados</strong>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      value={numEmployees}
                      onChange={(e) => setNumEmployees(parseInt(e.target.value))}
                      className="w-full accent-accent-yellow bg-neutral-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-text-dim mt-1">
                      <span>5</span>
                      <span>100</span>
                      <span>200</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-2">
                      Costo Estimado de Matrícula (USD): <strong className="text-white text-xs">USD {avgCourseCost} por curso</strong>
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="1500"
                      step="50"
                      value={avgCourseCost}
                      onChange={(e) => setAvgCourseCost(parseInt(e.target.value))}
                      className="w-full accent-accent-yellow bg-neutral-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-text-dim mt-1">
                      <span>USD 200</span>
                      <span>USD 850</span>
                      <span>USD 1500</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Outputs */}
                <div className="grid grid-cols-2 gap-4 bg-black/40 p-5 rounded-xl border border-border-dark">
                  <div>
                    <div className="text-[9px] font-mono text-text-dim uppercase">Costo Vinkupass</div>
                    <div className="text-lg font-bold text-white font-mono mt-1">USD {vinkuCost.toLocaleString()}</div>
                    <span className="text-[9px] text-text-dim block mt-1">Suscripción modular ágil</span>
                  </div>

                  <div>
                    <div className="text-[9px] font-mono text-text-dim uppercase">Ahorro vs Tradicional</div>
                    <div className="text-lg font-bold text-accent-emerald font-mono mt-1">USD {savings.toLocaleString()}</div>
                    <span className="text-[9px] text-accent-emerald block mt-1">ROI del {Math.round((savings / vinkuCost) * 100)}%</span>
                  </div>

                  <div className="border-t border-border-dark/60 pt-3 mt-1 col-span-2">
                    <div className="text-[9px] font-mono text-text-dim uppercase">Horas de Productividad Recuperadas</div>
                    <div className="text-xl font-bold text-accent-yellow font-mono mt-1">{productivityGain} Horas</div>
                    <span className="text-[9px] text-text-dim block mt-0.5">Calculadas por retención modular activa</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECCCIÓN CONEXIÓN CON EL BACKEND - FORMULARIO DE CONTACTO B2B INTEGRADO */}
          <div className="max-w-xl mx-auto bg-card-bg border border-border-dark rounded-3xl p-6 md:p-8 space-y-6 relative">
            <div className="space-y-1 text-center">
              <span className="text-xs font-mono font-bold text-accent-yellow uppercase tracking-widest bg-accent-yellow/10 px-3 py-1 rounded-full">
                Solicitud de Convenio
              </span>
              <h3 className="text-xl font-bold text-white font-display pt-2">Solicitar Información de Convenio</h3>
              <p className="text-xs text-text-dim">Mándanos tus datos corporativos. Los prospectos se registran directamente en la base de datos temporal.</p>
            </div>

            {b2bSuccess ? (
              <div className="bg-accent-emerald/10 border border-accent-emerald/40 rounded-2xl p-6 text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 flex items-center justify-center mx-auto text-accent-emerald">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">¡Prospecto Ingresado Satisfactoriamente!</h4>
                <p className="text-xs text-text-dim max-w-sm mx-auto leading-relaxed">
                  Los detalles de la empresa <strong className="text-white">"{b2bSubmittedLead?.companyName}"</strong> se guardaron exitosamente en 'Prospectos_Empresas' del servidor.
                </p>
                <div className="p-3 bg-black/45 rounded-xl border border-border-dark text-[10px] text-left font-mono space-y-1 max-w-xs mx-auto">
                  <div><span className="text-text-dim">Empresa:</span> {b2bSubmittedLead?.companyName}</div>
                  <div><span className="text-text-dim">Email:</span> {b2bSubmittedLead?.workEmail}</div>
                  <div><span className="text-text-dim">Colaboradores:</span> {b2bSubmittedLead?.employeeCount}</div>
                  <div><span className="text-text-dim">Timestamp:</span> {new Date(b2bSubmittedLead?.createdAt).toLocaleString()}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setB2bSuccess(false)}
                  className="text-accent-yellow text-xs font-semibold hover:underline cursor-pointer"
                >
                  Registrar otra empresa
                </button>
              </div>
            ) : (
              <form onSubmit={handleB2bLeadSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-widest block mb-1.5">Nombre de la Empresa o Razón Social</label>
                  <input
                    type="text"
                    required
                    value={b2bCompanyName}
                    onChange={(e) => setB2bCompanyName(e.target.value)}
                    placeholder="ej. Acme Corp Latam"
                    className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-white outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-widest block mb-1.5">Correo Corporativo de Contacto</label>
                  <input
                    type="email"
                    required
                    value={b2bEmail}
                    onChange={(e) => setB2bEmail(e.target.value)}
                    placeholder="ej. rrhh@acmecorp.com"
                    className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-white outline-none focus:border-accent-yellow"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-widest block mb-1.5">Número aproximado de Colaboradores</label>
                  <select
                    value={b2bEmployees}
                    onChange={(e) => setB2bEmployees(e.target.value)}
                    className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-white outline-none focus:border-accent-yellow"
                  >
                    <option value="1-20">1 a 20 colaboradores</option>
                    <option value="21-100">21 a 100 colaboradores</option>
                    <option value="101-500">101 a 500 colaboradores</option>
                    <option value="500+">Más de 500 colaboradores</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-extrabold p-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer font-sans shadow-lg shadow-yellow-500/10"
                  >
                    Solicitar Información de Convenio
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* 4. MARKETING STATION D: LANDING UNIVERSIDADES               */}
      {/* ========================================================== */}
      {marketingTab === "universidad" && (
        <div id="mkt_uni_section" className="space-y-16 animate-fade-in">
          
          {/* SECCIÓN HERO INSTITUCIONAL (University) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#121217] to-black rounded-3xl border border-border-dark p-8 md:p-12 text-center space-y-6">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-yellow/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-xs text-accent-yellow font-medium mx-auto">
              <GraduationCap className="w-3.5 h-3.5 animate-pulse" />
              <span>Plataforma para Universidades Socias</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display max-w-4xl mx-auto">
              Monetiza el catálogo de tu universidad disgregando tus programas tradicionales.
            </h1>

            <p className="text-sm md:text-base text-text-dim max-w-3xl mx-auto leading-relaxed">
              Conecta tu oferta académica de pregrado, posgrado y educación continua con miles de empresas y profesionales que demandan upskilling inmediato y ágil.
            </p>

            <div className="flex justify-center pt-2">
              <button
                id="hero_university_join_btn"
                onClick={() => {
                  setMarketingTab("auth");
                  setAuthMode("register");
                  setOnboardingRole("university");
                  setOnboardingStep(1);
                  triggerToast("Cargando formulario de validación legal para Universidades.", "info");
                }}
                className="bg-accent-yellow hover:bg-yellow-400 text-black text-xs md:text-sm font-bold py-4 px-8 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(255,210,0,0.25)] transition-all cursor-pointer"
              >
                <span>Unir mi Universidad a Vinkupass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SECCIÓN "PILARES DE LA NEOEDUCACIÓN ASOCIADA" */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-white font-display">Pilares de la Neoeducación Asociada</h3>
              <p className="text-xs text-text-dim max-w-md mx-auto leading-relaxed">
                Cómo la distribución del catálogo modular impulsa tus ingresos institucionales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pilar 1 */}
              <div className="bg-card-bg border border-border-dark rounded-2xl p-6 space-y-3 hover:border-accent-yellow/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Distribución Modular</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Permite que los estudiantes cursen materias específicas y asignaturas individuales de tus carreras existentes sin los procesos burocráticos de una matrícula completa de 5 años.
                </p>
              </div>

              {/* Pilar 2 */}
              <div className="bg-card-bg border border-border-dark rounded-2xl p-6 space-y-3 hover:border-accent-yellow/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Ingresos Predecibles en Créditos</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Recibe transferencias directas a tu balance institucional cada vez que un profesional o colaborador corporativo redima créditos educativos en tus asignaturas.
                </p>
              </div>

              {/* Pilar 3 */}
              <div className="bg-card-bg border border-border-dark rounded-2xl p-6 space-y-3 hover:border-accent-yellow/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Emisión de Certificados Sin Fricción</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Nuestra consola te permite cargar las constancias de aprobación en PDF. El sistema se encarga de estampar de forma automática el sello en el pasaporte digital del alumno.
                </p>
              </div>

            </div>
          </div>

          {/* SECCIÓN DE CREDIBILIDAD Y SEGURIDAD */}
          <div className="border border-border-dark/80 bg-black/40 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between max-w-4xl mx-auto">
            <div className="space-y-2 max-w-md">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-yellow shrink-0" />
                <span>Filtro de Calidad Vinkupass</span>
              </h4>
              <p className="text-xs text-text-dim leading-relaxed">
                Todas las instituciones académicas asociadas pasan por una rigurosa auditoría de registro legal y fiscal por el SuperAdmin para garantizar la excelencia del marketplace de upskilling.
              </p>
              <p className="text-[10px] text-accent-yellow font-mono mt-1">
                * El proceso de onboarding valida de manera estricta los dominios de correo .edu y requiere documentación KYB.
              </p>
            </div>

            <div className="bg-card-bg border border-border-dark p-5 rounded-xl space-y-3 w-full md:w-80 shrink-0">
              <h5 className="text-[9px] font-mono font-bold text-text-dim uppercase tracking-wider">Universidades Conectadas (Balance)</h5>
              <div className="space-y-2 text-[11px] font-mono">
                <div className="p-2 bg-[#09090c] rounded border border-border-dark flex justify-between items-center">
                  <span className="text-white">U. de los Andes</span>
                  <span className="text-accent-emerald font-semibold">USD 9,900</span>
                </div>
                <div className="p-2 bg-[#09090c] rounded border border-border-dark flex justify-between items-center">
                  <span className="text-white">Tec de Monterrey</span>
                  <span className="text-accent-emerald font-semibold">USD 27,900</span>
                </div>
                <div className="p-2 bg-[#09090c] rounded border border-border-dark flex justify-between items-center">
                  <span className="text-white">IE Business School</span>
                  <span className="text-accent-emerald font-semibold">USD 12,460</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* 5. MARKETING STATION E: AUTHENTICATION + MULTIROLE ONBOARDI */}
      {/* ========================================================== */}
      {marketingTab === "auth" && (
        <div id="mkt_auth_section" className="max-w-md mx-auto bg-card-bg border border-border-dark rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in relative z-10">
          
          <div className="text-center space-y-1">
            <h3 className="text-lg md:text-xl font-bold text-white font-display">Ingreso Unificado Vinkupass</h3>
            <p className="text-xs text-text-dim">Completa tu cuenta o prueba el asistente interactivo de onboarding multi-rol.</p>
          </div>

          {/* Toggle Login vs Register */}
          {onboardingStep === 1 && (
            <div className="flex border-b border-border-dark pb-2 text-xs font-bold gap-4 justify-center">
              <button 
                onClick={() => setAuthMode("register")}
                className={`pb-2 relative cursor-pointer ${authMode === "register" ? "text-accent-yellow font-bold" : "text-text-dim hover:text-white"}`}
              >
                <span>Registro Nuevo</span>
                {authMode === "register" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-yellow rounded" />}
              </button>
              <button 
                onClick={() => setAuthMode("login")}
                className={`pb-2 relative cursor-pointer ${authMode === "login" ? "text-accent-yellow font-bold" : "text-text-dim hover:text-white"}`}
              >
                <span>Iniciar Sesión</span>
                {authMode === "login" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-yellow rounded" />}
              </button>
            </div>
          )}

          {/* Step 1: Default Login vs Standard Simple Form */}
          {onboardingStep === 1 && authMode === "login" && (
            <div className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ej. diana.prince@vinkupass.com"
                  className="w-full bg-brand-bg border border-border-dark rounded-lg p-3 text-white outline-none focus:border-accent-yellow"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">Contraseña</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full bg-brand-bg border border-border-dark rounded-lg p-3 text-white outline-none focus:border-accent-yellow"
                />
              </div>

              <button
                onClick={() => {
                  triggerToast("Credenciales simuladas correctamente. Cargando portal.", "success");
                  setActiveRole("student"); // Default demo student
                }}
                className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-bold p-3 rounded-lg text-xs transition-all cursor-pointer text-center font-sans uppercase tracking-widest"
              >
                Ingresar Al Sistema
              </button>
            </div>
          )}

          {/* Step 2: Multi-role Onboarding Wizard Start */}
          {onboardingStep === 1 && authMode === "register" && (
            <div className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-xs font-semibold text-white block mb-2">1. Selecciona tu rol organizacional:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "student", label: "Estudiante", sub: "Upskilling" },
                    { id: "corporate", label: "Empresa", sub: "Nómina" },
                    { id: "university", label: "Universidad", sub: "Catálogo" }
                  ].map(role => (
                    <button
                      key={role.id}
                      onClick={() => setOnboardingRole(role.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        onboardingRole === role.id 
                          ? "bg-accent-yellow/10 border-accent-yellow text-white shadow-md" 
                          : "bg-black/40 border-border-dark text-text-dim hover:text-white"
                      }`}
                    >
                      <span className="font-bold text-[11px] leading-tight">{role.label}</span>
                      <span className="text-[9px] opacity-70 font-mono leading-none">{role.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-bold p-3 rounded-lg text-xs transition-all cursor-pointer text-center uppercase tracking-wider"
                >
                  Continuar Al Siguiente Paso
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete roll details */}
          {onboardingStep === 2 && (
            <form onSubmit={handleFinishOnboarding} className="space-y-4 font-sans text-xs">
              <div className="bg-black/40 border border-border-dark p-3 rounded-xl flex items-center gap-2 justify-between">
                <span className="text-text-dim">Rol Seleccionado:</span>
                <span className="text-accent-yellow font-bold uppercase font-mono text-[10px] bg-accent-yellow/10 px-2 py-0.5 rounded border border-accent-yellow/30">
                  {onboardingRole}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ej. Diana Prince"
                  className="w-full bg-brand-bg border border-border-dark rounded-lg p-3 text-white outline-none focus:border-accent-yellow"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">Correo Electrónico de Trabajo</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ej. diana.prince@empresa.com"
                  className="w-full bg-brand-bg border border-border-dark rounded-lg p-3 text-white outline-none focus:border-accent-yellow"
                />
              </div>

              {onboardingRole === "corporate" && (
                <div>
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-wide block mb-1">Empresa / Razón Social</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="ej. Stark Industries"
                    className="w-full bg-brand-bg border border-border-dark rounded-lg p-3 text-white outline-none focus:border-accent-yellow"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="w-1/3 bg-transparent hover:bg-neutral-800 border border-border-dark text-white font-bold p-3 rounded-lg text-xs transition-all cursor-pointer text-center"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-yellow hover:bg-yellow-400 text-black font-bold p-3 rounded-lg text-xs transition-all cursor-pointer text-center uppercase tracking-wider"
                >
                  Finalizar Onboarding
                </button>
              </div>
            </form>
          )}

          {/* Social login simulated */}
          <div className="border-t border-border-dark/60 pt-4 text-center">
            <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider block mb-3">O Conecta Rápidamente Con:</span>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  triggerToast("Simulación de Google Auth conectada.", "success");
                  setActiveRole("student");
                }}
                className="bg-black hover:bg-neutral-900 border border-border-dark text-white p-2 text-[11px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <span>Google Cloud</span>
              </button>
              <button
                onClick={() => {
                  triggerToast("Simulación de GitHub OAuth conectada.", "success");
                  setActiveRole("student");
                }}
                className="bg-black hover:bg-neutral-900 border border-border-dark text-white p-2 text-[11px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <span>GitHub OAuth</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
