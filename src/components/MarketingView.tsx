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
  Check,
  Loader2,
  AlertCircle,
  Layers
} from "lucide-react";
import { Course } from "../types";
import { useAuth } from "../contexts/AuthContext";

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
  const { signIn, signUp } = useAuth();

  // Homepage state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // B2B Landing ROI calculator state
  const [numEmployees, setNumEmployees] = useState(25);
  const [avgCourseCost, setAvgCourseCost] = useState(500000);

  // B2B Lead Contact Form state
  const [b2bCompanyName, setB2bCompanyName] = useState("");
  const [b2bEmail, setB2bEmail] = useState("");
  const [b2bEmployees, setB2bEmployees] = useState("50");
  const [b2bSuccess, setB2bSuccess] = useState(false);
  const [b2bSubmittedLead, setB2bSubmittedLead] = useState<any>(null);

  const handleB2bLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { submitLead } = await import("../lib/api");
      await submitLead({ company_name: b2bCompanyName, work_email: b2bEmail, employee_count: parseInt(b2bEmployees) });
      setB2bSuccess(true);
      setB2bSubmittedLead({ companyName: b2bCompanyName });
      triggerToast("¡Convenio registrado! Nos pondremos en contacto pronto.", "success");
      setB2bCompanyName(""); setB2bEmail("");
    } catch (err) {
      triggerToast("Error al enviar formulario", "error");
    }
  };

  // Authentication hub state
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingRole, setOnboardingRole] = useState<"student" | "corporate" | "university">("student");
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Per-role registration fields
  const [formCity, setFormCity] = useState("");
  const [formInterest, setFormInterest] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formNit, setFormNit] = useState("");
  const [formSector, setFormSector] = useState("");
  const [formEmployeeCount, setFormEmployeeCount] = useState("");
  const [formUniName, setFormUniName] = useState("");
  const [formUniNit, setFormUniNit] = useState("");
  const [formUniCity, setFormUniCity] = useState("");

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedCategory === "Todos") return matchesSearch;
    return matchesSearch && c.category.includes(selectedCategory);
  });

  // Calculate ROI Metrics
  const traditionalCost = numEmployees * 2800000; // costo promedio de educación continua tradicional
  const vinkuCost = numEmployees * avgCourseCost;
  const savings = traditionalCost - vinkuCost;
  const productivityGain = Math.round(numEmployees * 48); // active retention hours estimated

  const categories = ["Todos", "Ingeniería & Tech", "Negocios & Marketing", "AI & Data Science", "Diseño & UX"];

  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPassword || formPassword.length < 6) {
      setAuthError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    const roleMap: Record<string, import("../lib/database.types").UserRole> = {
      student: "student",
      corporate: "corporate_admin",
      university: "university_admin",
    };
    const { error } = await signUp(formEmail, formPassword, formName, roleMap[onboardingRole]);
    setAuthLoading(false);
    if (error) {
      setAuthError(error);
      return;
    }
    // Fire-and-forget lead capture for corporate and university
    if (onboardingRole === "corporate") {
      import("../lib/api").then(({ submitLead }) => submitLead({
        company_name: formCompanyName || formName,
        contact_name: formName,
        contact_email: formEmail,
        employee_count: parseInt(formEmployeeCount) || null,
        message: `Sector: ${formSector}, Ciudad: ${formCity}, NIT: ${formNit}`,
        source: 'registro_portal'
      }).catch(() => {}));
    } else if (onboardingRole === "university") {
      import("../lib/api").then(({ submitLead }) => submitLead({
        company_name: formUniName || formName,
        contact_name: formName,
        contact_email: formEmail,
        employee_count: null,
        message: `NIT: ${formUniNit}, Ciudad: ${formUniCity}`,
        source: 'registro_universidad'
      }).catch(() => {}));
    }
    triggerToast(`¡Bienvenido a Campus Pass! Verifica tu correo para activar la cuenta.`, "success");
    setActiveRole(onboardingRole);
    if (onboardingRole === "student") setStudentTab("diag");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formPassword) {
      setAuthError("Ingresa tu correo y contraseña.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await signIn(formEmail, formPassword);
    setAuthLoading(false);
    if (error) {
      setAuthError(error === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error);
      return;
    }
    triggerToast("¡Sesión iniciada exitosamente!", "success");
  };

  return (
    <div id="marketing_view_container" className="space-y-12">
      
      {/* ========================================================== */}
      {/* 1. MARKETING STATION A: HOMEPAGE (LANDING PRINCIPAL)       */}
      {/* ========================================================== */}
      {marketingTab === "home" && (
        <div id="mkt_home_section" className="space-y-20 animate-fade-in text-[#1A1A1A]">

          {/* A) HERO GENERAL */}
          <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] rounded-none px-6 py-14 md:px-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            {/* Texto hero */}
            <div className="lg:col-span-1 space-y-8 text-center lg:text-left">
              <span className="inline-block bg-[#FAFAFA] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] px-4 py-1.5 text-[10px] md:text-xs font-mono font-extrabold uppercase tracking-widest">
                🎓 La primera plataforma de educación desagregada de Colombia
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold font-display leading-[1.05] tracking-tight max-w-3xl mx-auto lg:mx-0">
                La universidad, a tu medida. Un curso a la vez.
              </h1>

              <p className="text-sm md:text-base font-bold text-[#1A1A1A]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Campus Pass conecta estudiantes, empresas y universidades en un solo ecosistema: toma materias individuales de universidades aliadas, acumúlalas en tu pasaporte digital y conviértelas en empleabilidad real.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="home_hero_start_btn"
                  onClick={() => {
                    setMarketingTab("auth");
                    setAuthMode("register");
                    setOnboardingRole("student");
                    setOnboardingStep(2);
                  }}
                  className="bg-[#1A1A1A] text-[#FFD000] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#FAFAFA] text-sm font-extrabold py-3.5 px-8 rounded-none flex items-center gap-2 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0px_#FAFAFA]"
                >
                  <span>Comenzar gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#como-funciona"
                  className="bg-[#FAFAFA] text-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] text-sm font-extrabold py-3.5 px-8 rounded-none flex items-center gap-2 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]"
                >
                  <span>Ver cómo funciona</span>
                </a>
              </div>
            </div>

            {/* Composición de tarjetas recortadas pop-art */}
            <div className="lg:col-span-2 relative h-72 hidden lg:block" aria-hidden="true">
              {/* Tarjeta 1 — Estudia */}
              <div className="absolute left-0 top-0 z-10" style={{ transform: 'rotate(-4deg)' }}>
                <div className="p-6 border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A]" style={{ backgroundImage: 'radial-gradient(#FFD000 2.5px, transparent 2.5px)', backgroundSize: '20px 20px', backgroundColor: '#1A1A1A' }}>
                  <div className="text-6xl mb-2">🎓</div>
                  <div className="text-white font-mono font-extrabold text-xl tracking-widest">ESTUDIA</div>
                </div>
              </div>
              {/* Tarjeta 2 — Crece */}
              <div className="absolute left-36 top-8 z-20" style={{ transform: 'rotate(2deg)' }}>
                <div className="bg-[#FFD000] p-6 border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A]">
                  <div className="text-6xl mb-2">💼</div>
                  <div className="text-[#1A1A1A] font-mono font-extrabold text-xl tracking-widest">CRECE</div>
                </div>
              </div>
              {/* Tarjeta 3 — Certifícate */}
              <div className="absolute left-72 top-16 z-30" style={{ transform: 'rotate(-1deg)' }}>
                <div className="bg-[#6C47FF] p-6 border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A]">
                  <div className="text-6xl mb-2">🏛️</div>
                  <div className="text-white font-mono font-extrabold text-xl tracking-widest">CERTIFÍCATE</div>
                </div>
              </div>
            </div>
          </div>

          {/* B) ¿CÓMO FUNCIONA? */}
          <div id="como-funciona" className="scroll-mt-24 border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#6C47FF] p-8 md:p-12 space-y-10" style={{ backgroundColor: '#FAFAFA', backgroundImage: 'repeating-linear-gradient(45deg, #1A1A1A 0px, #1A1A1A 1px, transparent 1px, transparent 8px)' }}>
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-vinku">¿Cómo funciona?</h2>
              <p className="text-sm text-zinc-700 font-bold">Tres pasos para convertir cursos en empleabilidad</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Diagnostica", desc: "Descubre en 5 minutos qué habilidades necesitas según tu meta profesional." },
                { num: "02", title: "Estudia a tu ritmo", desc: "Matricula solo las materias que necesitas, de la universidad que prefieras, pagando en COP." },
                { num: "03", title: "Certifícate y crece", desc: "Cada curso aprobado es un sello verificable en tu pasaporte digital." },
              ].map(step => (
                <div key={step.num} className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-8 space-y-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                  <span className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] text-2xl font-black font-mono text-[#1A1A1A] leading-none">{step.num}</span>
                  <h3 className="text-xl font-extrabold font-display text-[#1A1A1A]">{step.title}</h3>
                  <p className="text-xs font-bold text-zinc-700 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* C) BENEFICIOS CLAVE */}
          <div className="space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-vinku">Beneficios clave</h2>
              <p className="text-sm text-zinc-700 font-bold">Por qué Campus Pass cambia las reglas del juego</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#6C47FF] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#6C47FF]">
                <Wallet className="w-10 h-10 text-[#1A1A1A]" />
                <h3 className="text-base font-extrabold font-display text-[#1A1A1A]">Paga solo lo que cursas</h3>
                <p className="text-xs font-bold text-zinc-700 leading-relaxed">Sin matrículas de 5 años. Créditos en pesos colombianos, sin deudas eternas.</p>
              </div>
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#6C47FF] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#6C47FF]">
                <Award className="w-10 h-10 text-[#1A1A1A]" />
                <h3 className="text-base font-extrabold font-display text-[#1A1A1A]">Certificación universitaria real</h3>
                <p className="text-xs font-bold text-zinc-700 leading-relaxed">Cada sello lo emite directamente la universidad aliada. Verificable, no un PDF genérico.</p>
              </div>
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#6C47FF] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#6C47FF]">
                <TrendingUp className="w-10 h-10 text-[#1A1A1A]" />
                <h3 className="text-base font-extrabold font-display text-[#1A1A1A]">Empleabilidad medible</h3>
                <p className="text-xs font-bold text-zinc-700 leading-relaxed">Tu pasaporte muestra habilidades concretas que las empresas buscan hoy.</p>
              </div>
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#6C47FF] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#6C47FF]">
                <Users className="w-10 h-10 text-[#1A1A1A]" />
                <h3 className="text-base font-extrabold font-display text-[#1A1A1A]">Red de contactos reales</h3>
                <p className="text-xs font-bold text-zinc-700 leading-relaxed">Haz networking con estudiantes y docentes de las mejores universidades del país. Cada curso es también una comunidad.</p>
              </div>
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#6C47FF] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#6C47FF]">
                <Layers className="w-10 h-10 text-[#1A1A1A]" />
                <h3 className="text-base font-extrabold font-display text-[#1A1A1A]">Tantas rutas como roles quieras</h3>
                <p className="text-xs font-bold text-zinc-700 leading-relaxed">¿Quieres ser Data Analyst y también Product Manager? Crea rutas paralelas sin límite. Cada perfil profesional, un pasaporte.</p>
              </div>
            </div>
          </div>

          {/* D) HUB DE 3 PERFILES */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">¿Quién eres en Campus Pass?</h2>
              <p className="text-sm text-zinc-700 font-bold">Elige tu perfil para acceder a tu portal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Tarjeta 1 — Estudiante */}
              <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-6 flex flex-col gap-4 rounded-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                <GraduationCap className="w-12 h-12 text-[#1A1A1A]" />
                <div>
                  <h3 className="text-xl font-extrabold text-[#1A1A1A] font-display">Soy Estudiante</h3>
                  <p className="text-xs text-[#1A1A1A] font-bold mt-1 leading-snug">
                    Diagnóstico gratuito, ruta personalizada y pasaporte educativo con cursos de las mejores universidades.
                  </p>
                </div>
                <ul className="space-y-1 text-xs font-bold text-[#1A1A1A]">
                  <li>✓ Diagnóstico de habilidades</li>
                  <li>✓ Marketplace de cursos</li>
                  <li>✓ Pasaporte digital</li>
                </ul>
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => setMarketingTab("b2c")}
                    className="w-full bg-[#1A1A1A] hover:bg-zinc-800 text-[#FFD000] border-2 border-[#1A1A1A] text-xs font-extrabold py-2.5 px-4 rounded-none transition-all cursor-pointer shadow-[2px_2px_0px_#1A1A1A]"
                  >
                    Explorar portal estudiantil →
                  </button>
                  <button
                    onClick={() => { setMarketingTab("auth"); setAuthMode("login"); setOnboardingStep(1); }}
                    className="w-full text-[10px] text-[#1A1A1A] font-mono font-bold underline cursor-pointer hover:opacity-70"
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>
              </div>

              {/* Tarjeta 2 — Empresa */}
              <div className="bg-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#6C47FF] p-6 flex flex-col gap-4 rounded-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#6C47FF]">
                <Building className="w-12 h-12 text-[#FFD000]" />
                <div>
                  <h3 className="text-xl font-extrabold text-white font-display">Soy Empresa</h3>
                  <p className="text-xs text-zinc-300 font-bold mt-1 leading-snug">
                    Gestiona la formación de tu equipo, asigna presupuestos y mide el progreso de cada colaborador.
                  </p>
                </div>
                <ul className="space-y-1 text-xs font-bold text-white">
                  <li>✓ Consola de empleados</li>
                  <li>✓ Billetera corporativa</li>
                  <li>✓ Diagnóstico masivo</li>
                </ul>
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => setMarketingTab("b2b")}
                    className="w-full bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] border-2 border-[#FFD000] text-xs font-extrabold py-2.5 px-4 rounded-none transition-all cursor-pointer shadow-[2px_2px_0px_#6C47FF]"
                  >
                    Explorar portal empresarial →
                  </button>
                  <button
                    onClick={() => { setMarketingTab("auth"); setAuthMode("login"); setOnboardingStep(1); }}
                    className="w-full text-[10px] text-zinc-400 font-mono font-bold underline cursor-pointer hover:opacity-70"
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>
              </div>

              {/* Tarjeta 3 — Universidad */}
              <div className="bg-[#6C47FF] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-6 flex flex-col gap-4 rounded-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                <BookOpen className="w-12 h-12 text-[#FFD000]" />
                <div>
                  <h3 className="text-xl font-extrabold text-white font-display">Soy Universidad</h3>
                  <p className="text-xs text-indigo-100 font-bold mt-1 leading-snug">
                    Monetiza tu catálogo académico, emite certificados digitales y conecta con miles de estudiantes y empresas.
                  </p>
                </div>
                <ul className="space-y-1 text-xs font-bold text-white">
                  <li>✓ Catálogo de cursos</li>
                  <li>✓ Panel de matrículas</li>
                  <li>✓ Certificaciones digitales</li>
                </ul>
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => setMarketingTab("universidad")}
                    className="w-full bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] border-2 border-[#FFD000] text-xs font-extrabold py-2.5 px-4 rounded-none transition-all cursor-pointer shadow-[2px_2px_0px_#1A1A1A]"
                  >
                    Explorar portal universitario →
                  </button>
                  <button
                    onClick={() => { setMarketingTab("auth"); setAuthMode("login"); setOnboardingStep(1); }}
                    className="w-full text-[10px] text-indigo-200 font-mono font-bold underline cursor-pointer hover:opacity-70"
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* BANNER BUSCADOR DE CURSOS */}
          <div className="space-y-6">
            <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_#1A1A1A] rounded-none">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-lg font-extrabold text-[#1A1A1A] font-display uppercase tracking-vinku">¿Quieres ver los cursos disponibles?</h3>
                <p className="text-xs text-zinc-700 font-bold">Explora el catálogo de cursos universitarios disponibles</p>
              </div>

              {/* TAB CATEGORIES */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-4 py-2 font-extrabold rounded-none border-2 transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#FFD000] text-black border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
                        : "bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* BUSCADOR INPUT */}
              <div className="max-w-md mx-auto flex items-center gap-2 bg-white border-3 border-[#1A1A1A] rounded-none px-4 py-3 shadow-[4px_4px_0px_#1A1A1A] mb-6">
                <Search className="w-5 h-5 text-[#1A1A1A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca por temas (AWS, React, IA, Growth...)"
                  className="bg-transparent text-xs text-[#1A1A1A] outline-none w-full font-bold placeholder-zinc-500"
                />
              </div>

              {/* GRID OF COURSES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.slice(0, 6).map(cur => (
                  <div key={cur.id} className="bg-white border-3 border-[#1A1A1A] p-5 flex flex-col justify-between h-[255px] relative shadow-rigid-violet rounded-none">
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
                        <span className="text-sm font-black text-[#1A1A1A] font-mono">${cur.cost.toLocaleString("es-CO")} COP</span>
                      </div>

                      <button
                        onClick={() => {
                          triggerToast("Crea tu cuenta para inscribirte en este curso.", "info");
                          setStudentTab("market");
                          setMarketingTab("auth");
                          setAuthMode("register");
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

        </div>
      )}

      {/* ========================================================== */}
      {/* 2. MARKETING STATION B: LANDING B2C (PARA PERSONAS)        */}
      {/* ========================================================== */}
      {marketingTab === "b2c" && (
        <div id="mkt_b2c_section" className="space-y-16 animate-fade-in">
          
          {/* SECCIÓN HERO DE CAPTACIÓN EMOCIONAL */}
          <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] rounded-none p-8 md:p-12 text-center space-y-6 text-[#1A1A1A]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAFAFA] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] rounded-none text-[10px] md:text-xs text-[#1A1A1A] font-mono font-extrabold uppercase tracking-widest mx-auto">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pasaporte de Empleabilidad Activo</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A] leading-tight font-display max-w-4xl mx-auto">
              Tu pasaporte al empleo del futuro.
            </h1>

            <p className="text-sm md:text-base font-bold text-[#1A1A1A]/80 max-w-2xl mx-auto leading-relaxed">
              Arma una ruta de 3, 5 o 7 cursos de las mejores universidades del país, adaptada a tu perfil, tu presupuesto y tus metas.
            </p>

            <div className="flex justify-center pt-2">
              <button
                id="hero_start_b2c_diagnostico_btn"
                onClick={() => {
                  setMarketingTab("auth");
                  setAuthMode("register");
                  setOnboardingRole("student");
                  setOnboardingStep(2);
                }}
                className="bg-[#1A1A1A] text-[#FFD000] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#FAFAFA] text-xs md:text-sm font-extrabold py-4 px-8 rounded-none flex items-center gap-2 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0px_#FAFAFA]"
              >
                <span>Iniciar Diagnóstico Gratuito</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono font-bold uppercase text-[#1A1A1A]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#1A1A1A]" />
                <span>100% Sincrónico & Modular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#1A1A1A]" />
                <span>Validado por Universidades</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#1A1A1A]" />
                <span>Créditos Transferibles</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN INTERACTIVA "EL CONCEPTO CAMPUS PASS" */}
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <h3 className="text-xl md:text-2xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">El Concepto Campus Pass</h3>
              <p className="text-xs font-bold text-zinc-700 max-w-md mx-auto leading-relaxed">
                Cómo se compone tu pasaporte educativo digital sincrónico descentralizado.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Columna 1 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A] flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-8 h-8 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A] font-mono font-extrabold text-sm mb-1.5">
                    01
                  </div>
                  <h4 className="text-sm font-extrabold font-display text-[#1A1A1A] mb-2 leading-snug">Destinos</h4>
                  <p className="text-xs font-semibold text-zinc-700 leading-relaxed text-left">
                    Las universidades prestigiosas donde cursas tus asignaturas disgregadas.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#6C47FF] uppercase tracking-wider text-left">Universidades Socias →</span>
              </div>

              {/* Columna 2 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A] flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-8 h-8 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A] font-mono font-extrabold text-sm mb-1.5">
                    02
                  </div>
                  <h4 className="text-sm font-extrabold font-display text-[#1A1A1A] mb-2 leading-snug">Sellos</h4>
                  <p className="text-xs font-semibold text-zinc-700 leading-relaxed text-left">
                    Tus cursos aprobados estampados digitalmente en tiempo real.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#6C47FF] uppercase tracking-wider text-left">Validación Segura →</span>
              </div>

              {/* Columna 3 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A] flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-8 h-8 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A] font-mono font-extrabold text-sm mb-1.5">
                    03
                  </div>
                  <h4 className="text-sm font-extrabold font-display text-[#1A1A1A] mb-2 leading-snug">Insignias</h4>
                  <p className="text-xs font-semibold text-zinc-700 leading-relaxed text-left">
                    Las habilidades técnicas que desarrollas y demuestras sobre la marcha.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#6C47FF] uppercase tracking-wider text-left">Skill Mapping →</span>
              </div>

              {/* Columna 4 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A] flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-8 h-8 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A] font-mono font-extrabold text-sm mb-1.5">
                    04
                  </div>
                  <h4 className="text-sm font-extrabold font-display text-[#1A1A1A] mb-2 leading-snug">Salida Laboral</h4>
                  <p className="text-xs font-semibold text-zinc-700 leading-relaxed text-left">
                    Los roles profesionales activos que desbloqueas al completar tu ruta.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#6C47FF] uppercase tracking-wider text-left">Empleabilidad Real →</span>
              </div>

            </div>
          </div>

          {/* COMPONENTE "BUSCADOR RÁPIDO DE CURSOS MODULARES" */}
          <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-6 md:p-8 space-y-6">
            <div className="space-y-1 text-left">
              <h3 className="text-lg font-extrabold text-[#1A1A1A] font-display tracking-vinku uppercase">Buscador Rápido de Cursos Modulares</h3>
              <p className="text-xs font-bold text-zinc-700 max-w-xl leading-relaxed">
                Busca habilidades de asignaturas atomizadas en tiempo real. Utiliza los filtros seleccionables para descubrir rutas universitarias y sus créditos equivalentes de inmediato.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Input de Búsqueda */}
              <div className="md:col-span-2 flex items-center gap-2.5 bg-white border-3 border-[#1A1A1A] rounded-none px-4 py-3 shadow-[4px_4px_0px_#1A1A1A]">
                <Search className="w-5 h-5 text-[#1A1A1A] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué habilidad o curso quieres aprender hoy?"
                  className="bg-transparent text-xs text-[#1A1A1A] font-bold placeholder-zinc-500 outline-none w-full"
                />
              </div>

              {/* Limpiar Filtros button */}
              {(searchQuery !== "" || selectedCategory !== "Todos") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Todos");
                  }}
                  className="text-[#6C47FF] text-xs font-mono font-bold uppercase hover:underline cursor-pointer text-left md:text-right"
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
                  className={`text-xs px-4 py-2 rounded-none border-2 font-extrabold transition-all cursor-pointer ${
                    selectedCategory === tag.filter
                      ? "bg-[#FFD000] text-black border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
                      : "bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-zinc-200"
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
                  <div key={cur.id} className="bg-white border-3 border-[#1A1A1A] rounded-none p-5 flex flex-col justify-between h-[230px] shadow-[4px_4px_0px_#1A1A1A] transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase text-zinc-600 font-extrabold mb-1">
                        <span className="text-[#6C47FF] font-extrabold">{cur.university}</span>
                        <span>{cur.level}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-[#1A1A1A] line-clamp-2 leading-snug font-display uppercase tracking-tight">{cur.title}</h4>
                      <p className="text-[11px] text-zinc-700 font-semibold mt-1.5 line-clamp-3 leading-relaxed">{cur.description}</p>
                    </div>

                    <div className="border-t-2 border-[#1A1A1A] pt-3 mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-[8px] uppercase font-mono text-zinc-600 font-extrabold">Monto Créditos</div>
                        <span className="text-xs font-mono font-black text-[#1A1A1A]">${cur.cost.toLocaleString("es-CO")} COP</span>
                      </div>

                      <button
                        onClick={() => {
                          triggerToast("Crea tu cuenta para inscribirte en este curso.", "info");
                          setStudentTab("market");
                          setMarketingTab("auth");
                          setAuthMode("register");
                        }}
                        className="bg-[#FFD000] hover:bg-yellow-400 border-2 border-[#1A1A1A] text-black text-[10px] font-bold py-1.5 px-3 rounded-none shadow-[2px_2px_0px_#1A1A1A] transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Inscribirse</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center bg-white border-2 border-dashed border-[#1A1A1A] rounded-none">
                  <p className="text-xs text-zinc-600 font-mono font-bold">No se encontraron cursos de '{searchQuery}' para la categoría seleccionada.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
      {marketingTab === "b2b" && (
        <div id="mkt_b2b_section" className="space-y-16 animate-fade-in">
          
          {/* HERO B2B (Propuesta de Valor de Neoeducación) */}
          <div className="bg-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#FFD000] rounded-none p-8 md:p-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#6C47FF] rounded-none text-[10px] md:text-xs text-[#1A1A1A] font-mono font-extrabold uppercase tracking-widest mx-auto">
              <Building className="w-3.5 h-3.5" />
              <span>Neoeducación Corporativa B2B</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display max-w-4xl mx-auto">
              El talento de tu equipo, potenciado con formación universitaria real.
            </h1>

            <p className="text-sm md:text-base font-bold text-zinc-300 max-w-3xl mx-auto leading-relaxed">
              Diagnostica brechas de habilidades, asigna presupuestos en COP y mide el progreso de cada colaborador desde una sola consola.
            </p>

            <div className="flex justify-center pt-2">
              <button
                id="hero_b2b_start_btn"
                onClick={() => {
                  setMarketingTab("auth");
                  setAuthMode("register");
                  setOnboardingRole("corporate");
                  setOnboardingStep(2);
                }}
                className="bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#FAFAFA] text-xs md:text-sm font-extrabold py-4 px-8 rounded-none flex items-center gap-2 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0px_#FAFAFA]"
              >
                <span>Crear Cuenta Corporativa / Agendar Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SECCIÓN DE INDICADORES DE VALOR (Métricas de Impacto y ROI) */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">Métricas de Impacto & Beneficios Corporativos</h3>
              <p className="text-xs font-bold text-zinc-700 max-w-md mx-auto leading-relaxed">
                Cómo transformamos la capacitación tradicional en una ventaja competitiva medible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Bloque 1 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                <div className="w-10 h-10 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A]">
                  <Wallet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold font-display text-[#1A1A1A]">Billetera Corporativa Centralizada</h4>
                <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                  Fondea la cuenta de tu empresa una sola vez y distribuye créditos de manera personalizada para que tus empleados elijan cursos en el marketplace de forma autónoma.
                </p>
              </div>

              {/* Bloque 2 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                <div className="w-10 h-10 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A]">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold font-display text-[#1A1A1A]">Consola de Diagnóstico Masivo</h4>
                <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                  Envía evaluaciones automáticas a cientos de colaboradores en minutos. Olvídate de armar planes manuales; el sistema calcula sus rutas óptimas por ti.
                </p>
              </div>

              {/* Bloque 3 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                <div className="w-10 h-10 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold font-display text-[#1A1A1A]">Auditoría de Pasaportes en Tiempo Real</h4>
                <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                  Monitorea las insignias de habilidades y sellos académicos que tus empleados van desbloqueando sin necesidad de solicitar diplomas físicos.
                </p>
              </div>

            </div>

            {/* ESTIMADOR ROI COMPONENT */}
            <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#6C47FF] p-6 md:p-8 rounded-none relative">
              <div className="absolute top-0 right-0 p-3 text-[10px] font-mono font-bold uppercase text-[#6C47FF]">
                ESTIMADOR ROI DE APRENDIZAJE CAMPUS PASS
              </div>

              <h4 className="text-base font-extrabold text-[#1A1A1A] font-display tracking-vinku mb-4">Calcula el Retorno de tu Inversión</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center font-sans">
                
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-2">
                      Número de Colaboradores: <strong className="text-[#1A1A1A] text-xs">{numEmployees} empleados</strong>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      value={numEmployees}
                      onChange={(e) => setNumEmployees(parseInt(e.target.value))}
                      className="w-full accent-[#6C47FF] bg-zinc-300 border border-[#1A1A1A] rounded-none appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-600 mt-1">
                      <span>5</span>
                      <span>100</span>
                      <span>200</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-2">
                      Costo Estimado de Matrícula (COP): <strong className="text-[#1A1A1A] text-xs">${avgCourseCost.toLocaleString("es-CO")} COP por curso</strong>
                    </label>
                    <input
                      type="range"
                      min="200000"
                      max="1500000"
                      step="50000"
                      value={avgCourseCost}
                      onChange={(e) => setAvgCourseCost(parseInt(e.target.value))}
                      className="w-full accent-[#6C47FF] bg-zinc-300 border border-[#1A1A1A] rounded-none appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-600 mt-1">
                      <span>${(200000).toLocaleString("es-CO")} COP</span>
                      <span>${(850000).toLocaleString("es-CO")} COP</span>
                      <span>${(1500000).toLocaleString("es-CO")} COP</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Outputs */}
                <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-none border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A]">
                  <div>
                    <div className="text-[9px] font-mono font-bold text-zinc-600 uppercase">Costo Campus Pass</div>
                    <div className="text-lg font-black text-[#1A1A1A] font-mono mt-1">${vinkuCost.toLocaleString("es-CO")} COP</div>
                    <span className="text-[9px] font-bold text-zinc-600 block mt-1">Suscripción modular ágil</span>
                  </div>

                  <div>
                    <div className="text-[9px] font-mono font-bold text-zinc-600 uppercase">Ahorro vs Tradicional</div>
                    <div className="text-lg font-black text-emerald-600 font-mono mt-1">${savings.toLocaleString("es-CO")} COP</div>
                    <span className="text-[9px] font-bold text-emerald-600 block mt-1">ROI del {Math.round((savings / vinkuCost) * 100)}%</span>
                  </div>

                  <div className="border-t-2 border-[#1A1A1A] pt-3 mt-1 col-span-2">
                    <div className="text-[9px] font-mono font-bold text-zinc-600 uppercase">Horas de Productividad Recuperadas</div>
                    <div className="text-xl font-black text-[#6C47FF] font-mono mt-1">{productivityGain} Horas</div>
                    <span className="text-[9px] font-bold text-zinc-600 block mt-0.5">Calculadas por retención modular activa</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECCCIÓN CONEXIÓN CON EL BACKEND - FORMULARIO DE CONTACTO B2B INTEGRADO */}
          <div className="max-w-xl mx-auto bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#FFD000] rounded-none p-6 md:p-8 space-y-6 relative">
            <div className="space-y-1 text-center">
              <span className="text-xs font-mono font-bold text-[#1A1A1A] uppercase tracking-widest bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] px-3 py-1 rounded-none inline-block">
                Solicitud de Convenio
              </span>
              <h3 className="text-xl font-extrabold text-[#1A1A1A] font-display tracking-vinku pt-2">Solicitar Información de Convenio</h3>
              <p className="text-xs font-bold text-zinc-700">Mándanos tus datos corporativos. Los prospectos se registran directamente en la base de datos temporal.</p>
            </div>

            {b2bSuccess ? (
              <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-6 text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center mx-auto text-[#1A1A1A]">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold font-display text-[#1A1A1A]">¡Prospecto Ingresado Satisfactoriamente!</h4>
                <p className="text-xs font-bold text-zinc-700 max-w-sm mx-auto leading-relaxed">
                  Los detalles de la empresa <strong className="text-[#1A1A1A]">"{b2bSubmittedLead?.companyName}"</strong> se guardaron exitosamente en 'Prospectos_Empresas' del servidor.
                </p>
                <div className="p-3 bg-[#FAFAFA] rounded-none border-2 border-[#1A1A1A] text-[10px] text-left font-mono font-bold text-[#1A1A1A] space-y-1 max-w-xs mx-auto">
                  <div><span className="text-zinc-600">Empresa:</span> {b2bSubmittedLead?.companyName}</div>
                  <div><span className="text-zinc-600">Email:</span> {b2bSubmittedLead?.workEmail}</div>
                  <div><span className="text-zinc-600">Colaboradores:</span> {b2bSubmittedLead?.employeeCount}</div>
                  <div><span className="text-zinc-600">Timestamp:</span> {new Date(b2bSubmittedLead?.createdAt).toLocaleString()}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setB2bSuccess(false)}
                  className="text-[#6C47FF] text-xs font-mono font-bold uppercase hover:underline cursor-pointer"
                >
                  Registrar otra empresa
                </button>
              </div>
            ) : (
              <form onSubmit={handleB2bLeadSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Nombre de la Empresa o Razón Social</label>
                  <input
                    type="text"
                    required
                    value={b2bCompanyName}
                    onChange={(e) => setB2bCompanyName(e.target.value)}
                    placeholder="ej. Acme Corp Latam"
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Correo Corporativo de Contacto</label>
                  <input
                    type="email"
                    required
                    value={b2bEmail}
                    onChange={(e) => setB2bEmail(e.target.value)}
                    placeholder="ej. rrhh@acmecorp.com"
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Número aproximado de Colaboradores</label>
                  <select
                    value={b2bEmployees}
                    onChange={(e) => setB2bEmployees(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
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
                    className="w-full bg-[#FFD000] hover:bg-yellow-400 text-black border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] font-extrabold p-3.5 rounded-none text-xs uppercase tracking-widest transition-all cursor-pointer font-sans hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1A1A1A]"
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
          <div className="bg-[#6C47FF] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] rounded-none p-8 md:p-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] rounded-none text-[10px] md:text-xs text-[#1A1A1A] font-mono font-extrabold uppercase tracking-widest mx-auto">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Plataforma para Universidades Socias</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display max-w-4xl mx-auto">
              Tu catálogo académico, nuevas fuentes de ingreso.
            </h1>

            <p className="text-sm md:text-base font-bold text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              Desagrega tus programas en cursos individuales, llega a miles de estudiantes y empresas, y recibe ingresos por cada matrícula. Sin cambiar tu operación académica.
            </p>

            <div className="flex justify-center pt-2">
              <button
                id="hero_university_join_btn"
                onClick={() => {
                  setMarketingTab("auth");
                  setAuthMode("register");
                  setOnboardingRole("university");
                  setOnboardingStep(2);
                }}
                className="bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] text-xs md:text-sm font-extrabold py-4 px-8 rounded-none flex items-center gap-2 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]"
              >
                <span>Unir mi Universidad a Campus Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SECCIÓN "PILARES DE LA NEOEDUCACIÓN ASOCIADA" */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">Pilares de la Neoeducación Asociada</h3>
              <p className="text-xs font-bold text-zinc-700 max-w-md mx-auto leading-relaxed">
                Cómo la distribución del catálogo modular impulsa tus ingresos institucionales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pilar 1 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                <div className="w-10 h-10 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold font-display text-[#1A1A1A]">Distribución Modular</h4>
                <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                  Permite que los estudiantes cursen materias específicas y asignaturas individuales de tus carreras existentes sin los procesos burocráticos de una matrícula completa de 5 años.
                </p>
              </div>

              {/* Pilar 2 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                <div className="w-10 h-10 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold font-display text-[#1A1A1A]">Ingresos Predecibles en Créditos</h4>
                <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                  Recibe transferencias directas a tu balance institucional cada vez que un profesional o colaborador corporativo redima créditos educativos en tus asignaturas.
                </p>
              </div>

              {/* Pilar 3 */}
              <div className="bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1A1A1A]">
                <div className="w-10 h-10 rounded-none bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-[#1A1A1A]">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold font-display text-[#1A1A1A]">Emisión de Certificados Sin Fricción</h4>
                <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                  Nuestra consola te permite cargar las constancias de aprobación en PDF. El sistema se encarga de estampar de forma automática el sello en el pasaporte digital del alumno.
                </p>
              </div>

            </div>
          </div>

          {/* SECCIÓN DE CREDIBILIDAD Y SEGURIDAD */}
          <div className="border-4 border-[#1A1A1A] bg-[#FAFAFA] shadow-[4px_4px_0px_#6C47FF] p-6 md:p-8 rounded-none flex flex-col md:flex-row items-center gap-6 justify-between max-w-4xl mx-auto">
            <div className="space-y-2 max-w-md">
              <h4 className="text-sm font-extrabold font-display text-[#1A1A1A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6C47FF] shrink-0" />
                <span>Filtro de Calidad Campus Pass</span>
              </h4>
              <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
                Todas las instituciones académicas asociadas pasan por una rigurosa auditoría de registro legal y fiscal por el SuperAdmin para garantizar la excelencia del marketplace de upskilling.
              </p>
              <p className="text-[10px] text-[#6C47FF] font-mono font-bold mt-1">
                * El proceso de onboarding valida de manera estricta los dominios de correo .edu y requiere documentación KYB.
              </p>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-5 rounded-none space-y-3 w-full md:w-80 shrink-0">
              <h5 className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-wider">Universidades Conectadas (Balance)</h5>
              <div className="space-y-2 text-[11px] font-mono">
                <div className="p-2 bg-[#FAFAFA] rounded-none border-2 border-[#1A1A1A] flex justify-between items-center">
                  <span className="text-[#1A1A1A] font-bold">U. Andina del Futuro</span>
                  <span className="text-emerald-600 font-bold">${(3200000).toLocaleString("es-CO")} COP</span>
                </div>
                <div className="p-2 bg-[#FAFAFA] rounded-none border-2 border-[#1A1A1A] flex justify-between items-center">
                  <span className="text-[#1A1A1A] font-bold">Instituto Colombo Digital</span>
                  <span className="text-emerald-600 font-bold">${(1850000).toLocaleString("es-CO")} COP</span>
                </div>
                <div className="p-2 bg-[#FAFAFA] rounded-none border-2 border-[#1A1A1A] flex justify-between items-center">
                  <span className="text-[#1A1A1A] font-bold">Politécnico Innovación Sur</span>
                  <span className="text-emerald-600 font-bold">${(2100000).toLocaleString("es-CO")} COP</span>
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
        <div id="mkt_auth_section" className="max-w-md mx-auto bg-[#FAFAFA] border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#6C47FF] rounded-none p-6 md:p-8 space-y-6 animate-fade-in relative z-10">

          <button onClick={() => setMarketingTab("home")} className="text-xs text-zinc-600 hover:text-[#1A1A1A] font-mono font-bold cursor-pointer flex items-center gap-1">
            <span>← Volver al inicio</span>
          </button>

          <div className="text-center space-y-1">
            {authMode === "login" ? (
              <>
                <h3 className="text-lg md:text-xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">Ingresar a Campus Pass</h3>
                <p className="text-xs font-bold text-zinc-600">Accede a tu portal con tu correo y contraseña.</p>
              </>
            ) : onboardingStep === 2 && onboardingRole === "student" ? (
              <>
                <h3 className="text-lg md:text-xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">Crea tu cuenta de Estudiante</h3>
                <p className="text-xs font-bold text-zinc-600">Regístrate gratis y activa tu pasaporte educativo.</p>
              </>
            ) : onboardingStep === 2 && onboardingRole === "corporate" ? (
              <>
                <h3 className="text-lg md:text-xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">Registro de Empresa</h3>
                <p className="text-xs font-bold text-zinc-600">Accede a la consola de formación corporativa.</p>
              </>
            ) : onboardingStep === 2 && onboardingRole === "university" ? (
              <>
                <h3 className="text-lg md:text-xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">Registro de Universidad</h3>
                <p className="text-xs font-bold text-zinc-600">Une tu institución al ecosistema Campus Pass.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg md:text-xl font-extrabold text-[#1A1A1A] font-display tracking-vinku">¿Cómo quieres ingresar?</h3>
                <p className="text-xs font-bold text-zinc-600">Selecciona tu perfil para personalizar el registro.</p>
              </>
            )}
          </div>

          {/* Toggle Login vs Register */}
          {onboardingStep === 1 && (
            <div className="flex border-b-2 border-[#1A1A1A] pb-2 text-xs font-bold gap-4 justify-center">
              <button
                onClick={() => setAuthMode("register")}
                className={`pb-2 relative cursor-pointer ${authMode === "register" ? "text-[#1A1A1A] font-extrabold" : "text-zinc-500 hover:text-[#1A1A1A]"}`}
              >
                <span>Registro Nuevo</span>
                {authMode === "register" && <span className="absolute bottom-0 left-0 w-full h-1 bg-[#6C47FF] rounded-none" />}
              </button>
              <button
                onClick={() => setAuthMode("login")}
                className={`pb-2 relative cursor-pointer ${authMode === "login" ? "text-[#1A1A1A] font-extrabold" : "text-zinc-500 hover:text-[#1A1A1A]"}`}
              >
                <span>Iniciar Sesión</span>
                {authMode === "login" && <span className="absolute bottom-0 left-0 w-full h-1 bg-[#6C47FF] rounded-none" />}
              </button>
            </div>
          )}

          {/* Step 1: Login Form */}
          {onboardingStep === 1 && authMode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => { setFormEmail(e.target.value); setAuthError(null); }}
                  placeholder="ej. diana@empresa.com"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={formPassword}
                  onChange={(e) => { setFormPassword(e.target.value); setAuthError(null); }}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>
              {authError && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-100 border-2 border-red-600 p-3 rounded-none">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#FFD000] hover:bg-yellow-400 text-black border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] font-extrabold p-3 rounded-none text-xs transition-all cursor-pointer text-center font-sans uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Ingresar al Sistema
              </button>
            </form>
          )}

          {/* Step 2: Multi-role Onboarding Wizard Start */}
          {onboardingStep === 1 && authMode === "register" && (
            <div className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-xs font-extrabold text-[#1A1A1A] block mb-2">1. Selecciona tu rol organizacional:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "student", label: "Estudiante", sub: "Upskilling" },
                    { id: "corporate", label: "Empresa", sub: "Nómina" },
                    { id: "university", label: "Universidad", sub: "Catálogo" }
                  ].map(role => (
                    <button
                      key={role.id}
                      onClick={() => setOnboardingRole(role.id as any)}
                      className={`p-3 rounded-none border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        onboardingRole === role.id
                          ? "bg-[#FFD000] border-[#1A1A1A] text-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]"
                          : "bg-white border-[#1A1A1A] text-zinc-600 hover:text-[#1A1A1A] hover:bg-zinc-100"
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
                  className="w-full bg-[#FFD000] hover:bg-yellow-400 text-black border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] font-extrabold p-3 rounded-none text-xs transition-all cursor-pointer text-center uppercase tracking-wider"
                >
                  Continuar Al Siguiente Paso
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Role-specific registration forms */}
          {onboardingStep === 2 && onboardingRole === "student" && (
            <form onSubmit={handleFinishOnboarding} className="space-y-4 font-sans text-xs">
              {/* Header card */}
              <div className="border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none bg-[#FFD000] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1A1A1A]" />
                  <span className="font-extrabold text-[#1A1A1A] text-[11px] uppercase tracking-wide">Estudiante</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="text-[10px] text-[#1A1A1A] hover:text-[#6C47FF] font-mono font-bold cursor-pointer underline"
                >
                  ← Cambiar rol
                </button>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ej. Diana Prince"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ej. diana@correo.com"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Contraseña * (mín. 6 caracteres)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formPassword}
                  onChange={(e) => { setFormPassword(e.target.value); setAuthError(null); }}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Ciudad</label>
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                >
                  <option value="">Selecciona tu ciudad</option>
                  <option value="Bogotá">Bogotá</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Área de interés</label>
                <select
                  value={formInterest}
                  onChange={(e) => setFormInterest(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                >
                  <option value="">Selecciona un área</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Negocios">Negocios</option>
                  <option value="Diseño">Diseño</option>
                  <option value="Datos & IA">Datos & IA</option>
                  <option value="Derecho">Derecho</option>
                  <option value="Salud">Salud</option>
                </select>
              </div>

              {authError && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-100 border-2 border-red-600 p-3 rounded-none">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] font-extrabold p-3 rounded-none text-xs transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Crear mi cuenta gratis
              </button>
            </form>
          )}

          {onboardingStep === 2 && onboardingRole === "corporate" && (
            <form onSubmit={handleFinishOnboarding} className="space-y-4 font-sans text-xs">
              {/* Header card */}
              <div className="border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none bg-[#FFD000] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#1A1A1A]" />
                  <span className="font-extrabold text-[#1A1A1A] text-[11px] uppercase tracking-wide">Empresa</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="text-[10px] text-[#1A1A1A] hover:text-[#6C47FF] font-mono font-bold cursor-pointer underline"
                >
                  ← Cambiar rol
                </button>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Nombre del contacto *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ej. Carlos Ramírez"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Correo corporativo *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ej. carlos@empresa.com"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Contraseña * (mín. 6 caracteres)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formPassword}
                  onChange={(e) => { setFormPassword(e.target.value); setAuthError(null); }}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Nombre de la empresa *</label>
                <input
                  type="text"
                  required
                  value={formCompanyName}
                  onChange={(e) => setFormCompanyName(e.target.value)}
                  placeholder="ej. Bancolombia S.A."
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">NIT de la empresa</label>
                <input
                  type="text"
                  value={formNit}
                  onChange={(e) => setFormNit(e.target.value)}
                  placeholder="ej. 900.123.456-7"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Ciudad</label>
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                >
                  <option value="">Selecciona ciudad</option>
                  <option value="Bogotá">Bogotá</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Sector / Industria</label>
                <select
                  value={formSector}
                  onChange={(e) => setFormSector(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                >
                  <option value="">Selecciona sector</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Salud">Salud</option>
                  <option value="Manufactura">Manufactura</option>
                  <option value="Retail">Retail</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Número de empleados</label>
                <input
                  type="number"
                  min="1"
                  value={formEmployeeCount}
                  onChange={(e) => setFormEmployeeCount(e.target.value)}
                  placeholder="ej. 150"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              {authError && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-100 border-2 border-red-600 p-3 rounded-none">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] font-extrabold p-3 rounded-none text-xs transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Registrar empresa en Campus Pass
              </button>
            </form>
          )}

          {onboardingStep === 2 && onboardingRole === "university" && (
            <form onSubmit={handleFinishOnboarding} className="space-y-4 font-sans text-xs">
              {/* Header card */}
              <div className="border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-none bg-[#FFD000] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#1A1A1A]" />
                  <span className="font-extrabold text-[#1A1A1A] text-[11px] uppercase tracking-wide">Universidad</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="text-[10px] text-[#1A1A1A] hover:text-[#6C47FF] font-mono font-bold cursor-pointer underline"
                >
                  ← Cambiar rol
                </button>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Nombre del responsable *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ej. María González"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Correo institucional *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ej. maria@universidad.edu.co"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Contraseña * (mín. 6 caracteres)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formPassword}
                  onChange={(e) => { setFormPassword(e.target.value); setAuthError(null); }}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Nombre de la universidad *</label>
                <input
                  type="text"
                  required
                  value={formUniName}
                  onChange={(e) => setFormUniName(e.target.value)}
                  placeholder="ej. Universidad de los Andes"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">NIT institucional</label>
                <input
                  type="text"
                  value={formUniNit}
                  onChange={(e) => setFormUniNit(e.target.value)}
                  placeholder="ej. 800.123.456-1"
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wide block mb-1">Ciudad</label>
                <select
                  value={formUniCity}
                  onChange={(e) => setFormUniCity(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] rounded-none p-3 text-[#1A1A1A] font-semibold outline-none focus:border-[#6C47FF]"
                >
                  <option value="">Selecciona ciudad</option>
                  <option value="Bogotá">Bogotá</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              {authError && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-100 border-2 border-red-600 p-3 rounded-none">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] font-extrabold p-3 rounded-none text-xs transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Registrar mi universidad
              </button>
            </form>
          )}

          <div className="border-t-2 border-[#1A1A1A] pt-4 text-center">
            <p className="text-[10px] font-mono font-bold text-zinc-600">
              Al registrarte aceptas los términos de uso de Campus Pass by VinkU.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
