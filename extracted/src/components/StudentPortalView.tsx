import React, { useState, useEffect } from "react";
import { 
  Award, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  Compass, 
  BookOpen, 
  Briefcase, 
  Wallet, 
  Calendar, 
  Check, 
  TrendingUp, 
  CreditCard, 
  Building2, 
  ArrowRight, 
  RefreshCw, 
  Plus, 
  Search, 
  ChevronRight, 
  Sliders, 
  HelpCircle, 
  ArrowLeftRight, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Github,
  FolderDot,
  FileText,
  Clock,
  Video
} from "lucide-react";
import { Student, Course, UniversityStats } from "../types";

interface StudentPortalViewProps {
  student: Student;
  courses: Course[];
  universities: UniversityStats[];
  studentTab: "pass" | "diag" | "market" | "wallet" | "fellowship" | "portfolio";
  setStudentTab: (tab: "pass" | "diag" | "market" | "wallet" | "fellowship" | "portfolio") => void;
  onDiagnoseSubmit: (e: React.FormEvent) => void;
  onEnrollCourse: (courseId: string, actor: "student" | "corporate") => void | Promise<void>;
  onWalletRecharge: (e: React.FormEvent) => void;
  onAddGoal: (e: React.FormEvent) => void;
  onBookFellowship: (e: React.FormEvent) => void;
  rechargeAmt: string;
  setRechargeAmt: (val: string) => void;
  rechargeSource: string;
  setRechargeSource: (val: string) => void;
  fellowshipForm: { mentorName: string; topic: string; dateTime: string };
  setFellowshipForm: (val: any) => void;
  newGoalText: string;
  setNewGoalText: (val: string) => void;
  newGoalProducts: string;
  setNewGoalProducts: (val: string) => void;
  diagAnswers: { primaryGoal: string; technicalExperience: string; budgetRange: string; lengthPreference: string };
  setDiagAnswers: (val: any) => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => void;
}

export default function StudentPortalView({
  student,
  courses,
  universities,
  studentTab,
  setStudentTab,
  onDiagnoseSubmit,
  onEnrollCourse,
  onWalletRecharge,
  onAddGoal,
  onBookFellowship,
  rechargeAmt,
  setRechargeAmt,
  rechargeSource,
  setRechargeSource,
  fellowshipForm,
  setFellowshipForm,
  newGoalText,
  setNewGoalText,
  newGoalProducts,
  setNewGoalProducts,
  diagAnswers,
  setDiagAnswers,
  triggerToast,
  fetchState
}: StudentPortalViewProps) {
  
  // Internal State switches
  const [passportSubTab, setPassportSubTab] = useState<"destinos" | "sellos" | "insignias" | "perfil">("destinos");
  
  // Simulating user mode toggled inside the Wallet or Dashboard widget: B2C (Independiente) vs B2B (Patrocinado / Empresa)
  const [studentUserType, setStudentUserType] = useState<"B2C" | "B2B">("B2C");
  const [b2bCompanyName, setB2bCompanyName] = useState("Globant S.A.");
  const [b2bPresupuesto, setB2bPresupuesto] = useState(2500);

  // Diagnostic questionnaire states
  const [diagQuizStep, setDiagQuizStep] = useState(1);
  const [localInterest, setLocalInterest] = useState("Software");
  const [localExp, setLocalExp] = useState("Principiante");
  const [localTime, setLocalTime] = useState("6-10 horas");
  const [localObjective, setLocalObjective] = useState("Consigue mi primer empleo");
  const [isProcessingDiag, setIsProcessingDiag] = useState(false);
  const [hasCompletedDiagQuiz, setHasCompletedDiagQuiz] = useState(student.diagnosed);

  // Suggested Route lists
  const [suggestedRouteCourses, setSuggestedRouteCourses] = useState<Course[]>([]);
  const [selectedSwapIndex, setSelectedSwapIndex] = useState<number | null>(null);

  // Marketplace states
  const [marketSearchText, setMarketSearchText] = useState("");
  const [marketCategory, setMarketCategory] = useState("Todos");
  const [marketUniversity, setMarketUniversity] = useState("Todos");
  
  // Custom Shopping Cart representing courses to check out with credits
  const [cart, setCart] = useState<Course[]>([]);

  // Fellowship states
  const [fellowshipSuccessLocal, setFellowshipSuccessLocal] = useState(false);
  const [activeZoomSession, setActiveZoomSession] = useState<string | null>(null);

  // Link Evidence form
  const [evLinkText, setEvLinkText] = useState("");
  const [evLinkCategory, setEvLinkCategory] = useState<"Github" | "Drive" | "Notion">("Github");
  const [evGoalIndex, setEvGoalIndex] = useState<number>(0);

  // Populate recommended courses when diagonal state changes or student has route
  useEffect(() => {
    if (student.suggestedRoute && student.suggestedRoute.length > 0) {
      const filtered = courses.filter(c => student.suggestedRoute.includes(c.id));
      if (filtered.length > 0) {
        setSuggestedRouteCourses(filtered);
      } else {
        // Fallback default suggestions
        setSuggestedRouteCourses(courses.slice(0, 3));
      }
    } else {
      setSuggestedRouteCourses(courses.slice(0, 3));
    }
  }, [student.suggestedRoute, courses]);

  // Keep track of diagonal status
  useEffect(() => {
    setHasCompletedDiagQuiz(student.diagnosed);
  }, [student.diagnosed]);

  // Handlers for cart
  const handleToggleCart = (course: Course) => {
    const exists = cart.find(c => c.id === course.id);
    if (exists) {
      setCart(prev => prev.filter(c => c.id !== course.id));
      triggerToast(`'${course.title}' removido del carrito.`, "info");
    } else {
      // Check if student has enough budget
      const totalCost = cart.reduce((acc, c) => acc + c.cost, 0) + course.cost;
      const budget = studentUserType === "B2C" ? student.walletBalance : b2bPresupuesto;
      
      if (totalCost > budget) {
        triggerToast("Costo supera tu presupuesto/créditos de billetera. Recarga fondos primero.", "error");
      }
      
      setCart(prev => [...prev, course]);
      triggerToast(`'${course.title}' agregado.`, "success");
    }
  };

  const handleCheckoutWithCredits = async () => {
    if (cart.length === 0) {
      triggerToast("Tu carrito se encuentra vacío.", "error");
      return;
    }

    const totalCost = cart.reduce((acc, c) => acc + c.cost, 0);
    const budget = studentUserType === "B2C" ? student.walletBalance : b2bPresupuesto;

    if (totalCost > budget) {
      triggerToast("Saldo insuficiente en tu pasaporte para realizar la operación.", "error");
      return;
    }

    triggerToast("Iniciando débito de créditos y firma criptográfica de matrículas...", "info");

    // Process enrollments
    for (const course of cart) {
      await onEnrollCourse(course.id, studentUserType === "B2C" ? "student" : "corporate");
    }

    // Deduct locally or trigger backend sync
    if (studentUserType === "B2B") {
      setB2bPresupuesto(prev => prev - totalCost);
    }
    
    setCart([]);
    triggerToast("¡Matrícula Síncrona Exitosa! Tus sellos han sido inyectados al pasaporte.", "success");
    fetchState();
  };

  // Drag & drop interactive replacement route swaps
  const handleSwapCourse = (indexToSwap: number) => {
    setSelectedSwapIndex(indexToSwap);
    triggerToast("Selecciona una asignatura de reemplazo del menú de personalización.", "info");
  };

  const executeSwap = (newCourse: Course) => {
    if (selectedSwapIndex === null) return;
    
    // Check if new course is already in the route list
    if (suggestedRouteCourses.some(c => c.id === newCourse.id)) {
      triggerToast("Ese curso ya está incluido en tu ruta activa.", "error");
      return;
    }

    const updated = [...suggestedRouteCourses];
    updated[selectedSwapIndex] = newCourse;
    setSuggestedRouteCourses(updated);
    setSelectedSwapIndex(null);
    triggerToast(`Ruta actualizada con éxito. '${newCourse.title}' reemplazó la asignatura anterior.`, "success");
  };

  // Quiz progression
  const handleLocalQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingDiag(true);
    triggerToast("Algoritmo Vinku mapeando perfil de competencias académicas...", "info");

    setTimeout(() => {
      setIsProcessingDiag(false);
      setHasCompletedDiagQuiz(true);
      
      // Update actual backend state asynchronously by calling default triggers
      onDiagnoseSubmit(e);
      
      triggerToast("¡Ruta óptima calculada para tu perfil profesional!", "success");
    }, 1800);
  };

  // Add evidence to student goals
  const handleAddEvidenceLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evLinkText) {
      triggerToast("Por favor digita una URL de evidencia válida.", "error");
      return;
    }

    triggerToast("Vinculando URL externa comprobable como producto de logro...", "success");
    
    // Modify the student object representation locally or trigger save
    if (student.passport.logros && student.passport.logros.length > 0) {
      const idx = Math.min(evGoalIndex, student.passport.logros.length - 1);
      const targetGoal = student.passport.logros[idx];
      if (targetGoal) {
        targetGoal.associatedProducts = [...targetGoal.associatedProducts, `${evLinkCategory}: ${evLinkText}`];
        targetGoal.status = "Cumplido"; // auto transition as proof is served!
      }
    }
    
    setEvLinkText("");
  };

  // Dynamic values calculated
  const totalCartCost = cart.reduce((sum, c) => sum + c.cost, 0);

  // Insignias mock list complement if empty
  const defaultInsignias = [
    { skillName: "Arquitectura Cloud", brand: "UniAndes", dateEarned: "24-May-2026", color: "from-blue-600 to-cyan-500" },
    { skillName: "Liderazgo Ágil", brand: "EAFIT", dateEarned: "10-May-2026", color: "from-violet-600 to-fuchsia-500" },
    { skillName: "Backend REST", brand: "Javeriana", dateEarned: "02-May-2026", color: "from-emerald-600 to-teal-500" }
  ];

  return (
    <div id="student_workspace_viewport" className="space-y-6 font-sans">
      
      {/* --------------------------------------------------------- */}
      {/* HEADER WIDGET: BILLETERA DIGITAL VINKUPASS (UNIVERSAL TOP) */}
      {/* --------------------------------------------------------- */}
      <div id="uni_wallet_widget" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#111116] border border-border-dark p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-violet/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Left Side: Credit Balance and Subtype Switch */}
        <div className="lg:col-span-7 space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-accent-yellow uppercase tracking-widest block">
                Mi Billetera Digital Vinku
              </span>
              <h2 className="text-sm text-text-dim">
                Administra tus fondos sincrónicos para compra directa de cátedras modularizadas.
              </h2>
            </div>

            {/* B2C vs B2B Account Selector */}
            <div className="flex items-center p-1 bg-black/40 border border-border-dark rounded-xl shrink-0 self-start">
              <button
                type="button"
                onClick={() => {
                  setStudentUserType("B2C");
                  triggerToast("Modo de cuenta cambiado a: Independiente B2C", "info");
                }}
                className={`py-1 px-3 text-[10px] font-mono font-bold rounded-lg transition-all ${
                  studentUserType === "B2C" ? "bg-accent-violet text-white" : "text-text-dim hover:text-white"
                }`}
              >
                B2C Personal
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentUserType("B2B");
                  triggerToast("Modo de cuenta cambiado a: Corporativo B2B", "info");
                }}
                className={`py-1 px-3 text-[10px] font-mono font-bold rounded-lg transition-all ${
                  studentUserType === "B2B" ? "bg-accent-violet text-white" : "text-text-dim hover:text-white"
                }`}
              >
                B2B Empresa
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2.5">
            <div className="text-3xl font-black text-white font-display flex items-baseline gap-1.5">
              <span>
                {studentUserType === "B2C" 
                  ? student.walletBalance.toLocaleString() 
                  : b2bPresupuesto.toLocaleString()
                }
              </span>
              <span className="text-accent-violet text-sm font-bold uppercase tracking-wider">Créditos Vinku</span>
            </div>
            <span className="text-xs text-text-dim font-mono">
              (Equivalente a USD $
              {studentUserType === "B2C" 
                ? student.walletBalance.toFixed(2) 
                : b2bPresupuesto.toFixed(2)
              } )
            </span>
          </div>

          {/* Conditional Controls rendering as per spec */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {studentUserType === "B2C" ? (
              <>
                <button
                  onClick={() => setStudentTab("wallet")}
                  className="bg-accent-yellow hover:bg-yellow-400 text-black font-extrabold text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Recargar Créditos con Tarjeta</span>
                </button>
                <button
                  onClick={() => setStudentTab("wallet")}
                  className="text-xs text-text-dim hover:text-white font-bold font-mono underline underline-offset-4 flex items-center gap-1 cursor-pointer"
                >
                  <span>Solicitar Crédito Digital Financiero</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  disabled
                  className="bg-neutral-800 text-neutral-400 font-extrabold text-xs py-2 px-4 rounded-xl border border-neutral-700/60 inline-flex items-center gap-1.5 cursor-not-allowed"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Fondeado por {b2bCompanyName}</span>
                </button>
                <div className="p-2 py-1 bg-accent-violet/10 border border-accent-violet/20 rounded-lg text-[10px] font-mono text-accent-violet">
                  Presupuesto Anual Corporativo asignado por la organización.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick summary metrics card */}
        <div className="lg:col-span-5 bg-black/40 border border-border-dark p-4.5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-text-dim">PASAPORTE ACTIVO:</span>
            <strong className="text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-1.5 py-0.5 rounded font-bold uppercase">
              Verificado Legal
            </strong>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-brand-bg/50 p-2.5 rounded-xl border border-border-dark/60">
              <div className="text-[10px] font-mono text-text-dim">SELLOS</div>
              <div className="text-base font-bold text-white mt-0.5">
                {student.passport.sellos.filter(s => s.status === "Certificado").length} / {student.passport.sellos.length}
              </div>
            </div>
            <div className="bg-brand-bg/50 p-2.5 rounded-xl border border-border-dark/60">
              <div className="text-[10px] font-mono text-text-dim">INSIGNIAS</div>
              <div className="text-base font-bold text-white mt-0.5">
                {student.passport.insignias.length || defaultInsignias.length}
              </div>
            </div>
            <div className="bg-brand-bg/50 p-2.5 rounded-xl border border-border-dark/60">
              <div className="text-[10px] font-mono text-text-dim">CARRITO</div>
              <div className="text-base font-bold text-accent-yellow mt-0.5">
                {cart.length} Cursos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RENDER ACTIVE STUDENT TAB VIEW BASED ON NAVEGACIÓN PERMANENTE */}
      {/* ------------------------------------------------------------- */}
      
      {/* TAB 1: EL PASAPORTE GAMIFICADO COMPLETO */}
      {studentTab === "pass" && (
        <div id="tab_passport_active_flow" className="space-y-6">
          <div className="border border-border-dark rounded-3xl bg-[#0e0e12] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-violet via-indigo-500 to-accent-emerald" />
            
            {/* Header Identity banner */}
            <div className="p-6 md:p-8 bg-gradient-to-b from-[#14141a] to-[#0e0e12] border-b border-border-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-accent-violet to-indigo-900 flex items-center justify-center font-black text-xl text-white shadow-xl shadow-accent-violet/10">
                  {student.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display tracking-tight uppercase flex items-center gap-2">
                    <span>{student.name}</span>
                    <Sparkles className="w-4 h-4 text-accent-yellow animate-pulse" />
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-dim mt-1 font-mono">
                    <span>{student.email}</span>
                    <span>•</span>
                    <span className="text-accent-violet">Pasaporte Sincrónico Vinkupass ID: {student.id}</span>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right font-mono text-[10px] space-y-1">
                <div><span className="text-text-dim">ESTADO DEL CITIZEN:</span> <strong className="text-white">ACTIVO EN NEOCLUSTER</strong></div>
                <div><span className="text-text-dim">CONVENIOS DE CRÉDITO:</span> <strong className="text-accent-emerald">VINCULADO CO-CREATION</strong></div>
              </div>
            </div>

            {/* SPECIFICATION VISUAL STITCH: INTERACTIVE TAB MENU */}
            <div className="flex border-b border-border-dark bg-black/30 overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { id: "destinos", label: "Mis Destinos", count: student.passport.destinations.length },
                { id: "sellos", label: "Mis Sellos", count: student.passport.sellos.length },
                { id: "insignias", label: "Mis Insignias", count: student.passport.insignias.length || defaultInsignias.length },
                { id: "perfil", label: "Mi Perfil Laboral", count: 1 }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setPassportSubTab(sub.id as any);
                    triggerToast(`Viendo ${sub.label} del pasaporte`, "info");
                  }}
                  className={`py-3 px-6 text-xs font-bold shrink-0 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
                    passportSubTab === sub.id 
                    ? "border-accent-violet text-white bg-white/5" 
                    : "border-transparent text-text-dim hover:text-white"
                  }`}
                >
                  <span>{sub.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-neutral-800 text-text-dim">
                    {sub.count}
                  </span>
                </button>
              ))}
            </div>

            {/* SUBTAB CONTENTS */}
            <div className="p-6 md:p-8">
              
              {/* SUBTAB 1A: MIS DESTINOS */}
              {passportSubTab === "destinos" && (
                <div id="pane_destinations" className="space-y-4 animate-fade-in text-xs">
                  <div className="space-y-1 mb-4">
                    <h4 className="text-base font-bold text-white font-display">Universidades Aliadas Autorizadas</h4>
                    <p className="text-xs text-text-dim">Asignaturas desagregadas de educación continua registradas en tu historial en estas universidades.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {student.passport.destinations.map((dest, idx) => (
                      <div key={idx} className="bg-black/40 border border-border-dark p-5 rounded-2xl flex flex-col justify-between hover:border-accent-violet/30 transition-all group">
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center font-bold text-accent-violet text-sm">
                            {dest.university.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="font-bold text-white text-sm tracking-tight">{dest.university}</h5>
                            <span className="text-[10px] font-mono text-accent-emerald uppercase font-bold tracking-wider mt-1 block">Socio Activo</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border-dark/60 flex items-center justify-between text-[11px] font-mono text-text-dim">
                          <span>Asignaturas Matriculadas:</span>
                          <span className="font-bold text-white">{dest.enrollCount} Tracks</span>
                        </div>
                      </div>
                    ))}

                    {/* Placeholder Slot */}
                    <div className="border border-dashed border-border-dark bg-black/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center opacity-65 min-h-[140px] hover:border-gray-500 transition-all cursor-pointer" onClick={() => setStudentTab("market")}>
                      <Plus className="w-6 h-6 text-text-dim mb-1" />
                      <span className="font-bold text-white">Vincular Nueva Universidad</span>
                      <p className="text-[10px] text-text-dim mt-1.5 max-w-xs px-2">Explora universidades en el Marketplace sincrónico para inyectar su pasaporte.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 1B: MIS SELLOS (PHYSICAL EMBOSSED CIRCLE STAMPS) */}
              {passportSubTab === "sellos" && (
                <div id="pane_sellos" className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white font-display">Tus Sellos y Títulos de Formación</h4>
                    <p className="text-xs text-text-dim">Cada sello circular firma tu expediente garantizando la rigurosidad sincrónica acreditada por la universidad proveedora.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                    {student.passport.sellos.map((sello, idx) => {
                      const isCert = sello.status === "Certificado";
                      return (
                        <div 
                          key={idx} 
                          className={`relative border p-6 rounded-3xl flex flex-col items-center text-center justify-between transition-all aspect-square max-w-[280px] mx-auto w-full ${
                            isCert 
                              ? "bg-[#101015] border-accent-emerald/20 shadow-[0_4px_20px_rgba(16,185,129,0.03)]" 
                              : "bg-black/40 border-border-dark/60 opacity-60"
                          }`}
                        >
                          {/* STAMP EMBOSSED INNER CIRCLE */}
                          <div className={`w-32 h-32 rounded-full border-4 border-dashed p-1 flex items-center justify-center transition-all ${
                            isCert 
                              ? "border-accent-emerald animate-pulse duration-4000 rotate-12" 
                              : "border-neutral-700 -rotate-12"
                          }`}>
                            <div className={`w-full h-full rounded-full border-2 flex flex-col items-center justify-center p-2 text-center font-mono ${
                              isCert 
                                ? "border-accent-emerald/40 bg-accent-emerald/5 text-accent-emerald" 
                                : "border-neutral-700/40 bg-neutral-900/10 text-neutral-500"
                            }`}>
                              <span className="text-[7px] font-black tracking-widest uppercase">
                                {isCert ? "✓ CERTIFICADO" : "EN CURSO"}
                              </span>
                              <div className="text-[10px] font-bold tracking-tight font-display my-1 leading-tight uppercase truncate max-w-[100px]">
                                {sello.university.slice(0, 10)}
                              </div>
                              <span className="text-[6px]">
                                {isCert ? "COMO COMPLETO" : "VINKUPASS LABS"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 space-y-1">
                            <h5 className="font-bold text-white text-xs tracking-tight line-clamp-1">{sello.courseTitle}</h5>
                            <span className="text-[10px] font-mono text-text-dim block">{sello.university}</span>
                            {isCert && (
                              <span className="text-[9px] font-mono text-accent-emerald font-bold block">Aprobado: 04-Jun-2026</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {student.passport.sellos.length === 0 && (
                      <div className="col-span-3 text-center py-12 border border-dashed border-border-dark rounded-2xl">
                        <Award className="w-8 h-8 text-text-dim mx-auto mb-2 opacity-50" />
                        <span className="font-bold text-white text-xs">Sin sellos cargados</span>
                        <p className="text-xs text-text-dim mt-1.5">No has adquirido cursos de catálogo sincrónicos aún.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 1C: MIS INSIGNIAS (DIGITAL MEDALS) */}
              {passportSubTab === "insignias" && (
                <div id="pane_insignias" className="space-y-4 animate-fade-in">
                  <div className="space-y-1 mb-2">
                    <h4 className="text-base font-bold text-white font-display">Medallas y Credenciales de Competencia</h4>
                    <p className="text-xs text-text-dim">Habilidades técnicas auditadas reales en tu pasaporte mediante blockchain universitario.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* Combine with default if none */}
                    {defaultInsignias.map((ins, idx) => (
                      <div key={idx} className="bg-black/30 border border-border-dark p-4 rounded-2xl flex items-center gap-4 hover:border-gray-600 transition-all">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${ins.color} flex items-center justify-center font-bold text-white shrink-0 shadow-lg`}>
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white text-xs">{ins.skillName}</h5>
                          <span className="text-[10px] font-mono text-text-dim block mt-0.5">{ins.brand} • {ins.dateEarned}</span>
                          <span className="text-[9px] font-mono text-accent-violet block font-bold mt-1">✓ Firma Criptográfica</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 1D: MI PERFIL LABORAL */}
              {passportSubTab === "perfil" && (
                <div id="pane_perfil" className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white font-display">Cargo Laboral Consolidado</h4>
                    <p className="text-xs text-text-dim">Monitorea los roles o cargos que las empresas buscarán contratar en base a los mallas aprobadas en tu pasaporte.</p>
                  </div>

                  <div className="bg-black/40 border border-border-dark p-6 rounded-2xl space-y-4 max-w-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-5 h-5 text-accent-violet" />
                        <div>
                          <h5 className="font-bold text-white text-sm">Analista de Datos Junior</h5>
                          <span className="text-[10px] font-mono text-text-dim block">Progreso de Formación Adaptativa</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-accent-violet font-bold">75% Completo</span>
                    </div>

                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-violet w-3/4 rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-border-dark/60">
                      <div>
                        <span className="text-text-dim block">Demanda Tecnológica:</span>
                        <strong className="text-accent-emerald">Muy Alta (+95%)</strong>
                      </div>
                      <div>
                        <span className="text-text-dim block">Rango Salarial Promedio:</span>
                        <strong className="text-white">USD 1,800/Mes</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIAGNÓSTICO TÉCNICO Y RUTA FORMATIVA SUGERIDA */}
      {studentTab === "diag" && (
        <div id="tab_diagnosis_active_flow" className="space-y-6">
          {!hasCompletedDiagQuiz ? (
            // Form View por Pasos (Questionnaire)
            <div id="diag_quiz_form_view" className="max-w-xl mx-auto bg-[#101014] border border-border-dark p-6 md:p-8 rounded-3xl space-y-6 animate-fade-in">
              
              {/* Indicator top */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-accent-yellow uppercase">Diagnóstico Adaptativo Vinku Quiz</span>
                  <span className="text-[10px] font-mono text-text-dim">Paso {diagQuizStep} de 4</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-yellow transition-all duration-300" 
                    style={{ width: `${(diagQuizStep / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* QUESTION STEPS */}
              <div className="space-y-4">
                {diagQuizStep === 1 && (
                  <div className="space-y-3 animate-fade-in">
                    <h4 className="text-base font-bold text-white font-display">Paso 1: ¿Cuál es tu área de interés principal?</h4>
                    <p className="text-xs text-text-dim">Mallas creadas directamente con las facultades universitarias aliadas.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {[
                        { id: "Software", label: "Desarrollo de Software", desc: "Front-end, Cloud & Python" },
                        { id: "Science", label: "Ciencia de Datos", desc: "BI, Analítica y Modelos" },
                        { id: "Marketing", label: "Marketing Digital", desc: "Growth, SEO & Ads" },
                        { id: "Management", label: "Gerencia de Proyectos", desc: "Scrubm, Ágil e Innovación" },
                        { id: "Sustainability", label: "Sostenibilidad & Estrategia ASG", desc: "Impacto, Economía Circular & ESG" },
                        { id: "Cybersecurity", label: "Ciberseguridad & DevSecOps", desc: "Hardening de Servidores & Redes" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setLocalInterest(opt.id);
                            setDiagAnswers((prev: any) => ({ ...prev, primaryGoal: opt.id }));
                          }}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            localInterest === opt.id 
                              ? "bg-accent-yellow/10 border-accent-yellow text-white" 
                              : "bg-black/30 border-border-dark text-text-dim hover:text-white"
                          }`}
                        >
                          <h5 className="font-bold text-xs">{opt.label}</h5>
                          <p className="text-[10px] text-text-dim mt-1">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {diagQuizStep === 2 && (
                  <div className="space-y-3 animate-fade-in">
                    <h4 className="text-base font-bold text-white font-display">Paso 2: ¿Cuál es tu nivel de experiencia actual?</h4>
                    <p className="text-xs text-text-dim">Ajustaremos la mallas para que no repitas contenidos obvios.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {[
                        { id: "Principiante", label: "Principiante", desc: "Comienzo desde cero" },
                        { id: "Intermedio", label: "Intermedio", desc: "Tengo bases básicas" },
                        { id: "Avanzado", label: "Avanzado", desc: "Desarrollo avanzado" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setLocalExp(opt.id);
                            setDiagAnswers((prev: any) => ({ ...prev, technicalExperience: opt.id.toLowerCase() }));
                          }}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            localExp === opt.id 
                              ? "bg-accent-yellow/10 border-accent-yellow text-white" 
                              : "bg-black/30 border-border-dark text-text-dim hover:text-white"
                          }`}
                        >
                          <h5 className="font-bold text-xs">{opt.label}</h5>
                          <p className="text-[10px] text-text-dim mt-1">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {diagQuizStep === 3 && (
                  <div className="space-y-3 animate-fade-in">
                    <h4 className="text-base font-bold text-white font-display">Paso 3: ¿Cuánto tiempo semanal puedes dedicar al estudio?</h4>
                    <p className="text-xs text-text-dim">Organizaremos los tracks óptimos para evitar deserción académica.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {[
                        { id: "2-5 horas", label: "Ruta Corta", desc: "2-5 horas/semana" },
                        { id: "6-10 horas", label: "Ruta Media", desc: "6-10 horas/semana" },
                        { id: "Más de 10 horas", label: "Ruta Intensiva", desc: "+10 horas/semana" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLocalTime(opt.id)}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            localTime === opt.id 
                              ? "bg-accent-yellow/10 border-accent-yellow text-white" 
                              : "bg-black/30 border-border-dark text-text-dim hover:text-white"
                          }`}
                        >
                          <h5 className="font-bold text-xs">{opt.label}</h5>
                          <p className="text-[10px] text-text-dim mt-1">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {diagQuizStep === 4 && (
                  <div className="space-y-3 animate-fade-in">
                    <h4 className="text-base font-bold text-white font-display">Paso 4: ¿Cuál es tu objetivo profesional inmediato?</h4>
                    <p className="text-xs text-text-dim">Materia de graduación adaptada al mercado global sincrónico.</p>
                    
                    <div className="grid grid-cols-1 gap-3 pt-1">
                      {[
                        { id: "Consigue mi primer empleo", label: "Conseguir mi primer empleo", desc: "Enfocado en portafolio de logros básicos para reclutadores." },
                        { id: "Consigue un ascenso", label: "Conseguir un ascenso", desc: "Módulos de especialización gerencial e integración corporativa." },
                        { id: "Reskilling", label: "Cambiar de industria / Reskilling total", desc: "Ruta de reconversión laboral estructurada sin perder tus bases." }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLocalObjective(opt.id)}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            localObjective === opt.id 
                              ? "bg-accent-yellow/10 border-accent-yellow text-white" 
                              : "bg-black/30 border-border-dark text-text-dim hover:text-white"
                          }`}
                        >
                          <h5 className="font-bold text-xs text-white">{opt.label}</h5>
                          <p className="text-[10px] text-text-dim mt-1">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CONTROLS */}
              <div className="pt-4 border-t border-border-dark/60 flex justify-between items-center text-xs">
                {diagQuizStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setDiagQuizStep(prev => prev - 1)}
                    className="text-text-dim hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Retroceder
                  </button>
                )}

                <div className="ml-auto">
                  {diagQuizStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setDiagQuizStep(prev => prev + 1)}
                      className="bg-accent-yellow text-black font-extrabold py-2 px-5 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-yellow-400"
                    >
                      <span>Siguiente</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isProcessingDiag}
                      onClick={handleLocalQuizSubmit}
                      className="bg-accent-yellow text-black font-extrabold py-2 px-5 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-yellow-400"
                    >
                      {isProcessingDiag ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Calculando Algoritmo...</span>
                        </>
                      ) : (
                        <span>Generar mi Ruta Adaptativa Universitaria</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // RESULTS VIEW: Suggested Formative Route Timeline
            <div id="diag_results_timeline_view" className="space-y-6 animate-fade-in text-xs">
              
              {/* Banner superior */}
              <div className="bg-gradient-to-r from-[#171725] to-[#0d0d12] border border-border-dark p-6 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-[9px] text-accent-yellow uppercase font-mono tracking-wider">
                    <Compass className="w-3 h-3 text-accent-yellow" />
                    <span>Tu Ruta Inteligente Sugerida</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display">
                    Tu perfil aplica para el rol de: <strong className="text-accent-yellow font-extrabold">Fullstack Cloud Engineer</strong>
                  </h3>
                  <p className="text-text-dim max-w-xl text-xs">
                    Ruta recomendada según tu diagnóstico comportamental de {localInterest} ({localExp}). Compra la ruta o personalízala modificando los bloques académicos.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setHasCompletedDiagQuiz(false);
                    setDiagQuizStep(1);
                  }}
                  className="bg-neutral-800/80 text-text-dim hover:text-white px-3 py-1.5 rounded-lg font-mono text-[10px] cursor-pointer"
                >
                  Reiniciar Quiz
                </button>
              </div>

              {/* TIMELINE OF COURSES OR MAP CONNECTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Connected Map / Timeline Blocks (Left Column) */}
                <div className="lg:col-span-8 bg-[#0c0c10] border border-border-dark rounded-3xl p-6 space-y-6 relative">
                  <div className="absolute left-[39px] top-12 bottom-12 w-[2px] bg-border-dark/60 z-0" />

                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-widest text-text-dim">Mapa Secuencial de Asignaturas Síncronas</h3>

                  <div className="space-y-6 relative z-10">
                    {suggestedRouteCourses.map((c, idx) => {
                      const isEnrolled = student.passport.sellos.some(s => s.courseId === c.id);
                      const isSwapping = selectedSwapIndex === idx;
                      return (
                        <div 
                          key={c.id || idx} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                            isEnrolled 
                              ? "bg-[#101b15] border-accent-emerald/20" 
                              : isSwapping 
                                ? "bg-accent-violet/5 border-accent-violet"
                                : "bg-black/50 border-border-dark/80 hover:border-gray-700"
                          }`}
                        >
                          {/* Timeline Number stamp */}
                          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono text-sm shrink-0 border uppercase ${
                            isEnrolled 
                              ? "bg-accent-emerald border-accent-emerald text-black"
                              : "bg-neutral-900 border-border-dark text-text-dim"
                          }`}>
                            <span>Paso</span>
                            <span className="text-base font-extrabold mt-0.5">{idx + 1}</span>
                          </div>

                          {/* Content Detail */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-mono text-accent-yellow">{c.university}</span>
                              <span className="text-text-dim">•</span>
                              <span className="text-[10px] font-mono text-text-dim">{c.duration}</span>
                            </div>

                            <h4 className="text-white font-bold text-sm tracking-tight mt-1 truncate">{c.title}</h4>
                            <p className="text-[11px] text-text-dim line-clamp-1 mt-1 leading-normal">{c.description}</p>

                            <div className="flex items-center justify-between gap-3 mt-3.5 pt-2.5 border-t border-border-dark/60 text-[10px] font-mono">
                              <span className="text-accent-yellow font-bold">{c.cost} VINKU CRÉDITOS</span>
                              
                              <div className="flex items-center gap-2">
                                {/* Swap / Interact Button */}
                                <button
                                  onClick={() => handleSwapCourse(idx)}
                                  className="text-text-dim hover:text-white inline-flex items-center gap-1 bg-black/60 px-2 py-1 border border-border-dark rounded cursor-pointer transition-all"
                                  title="Reemplazar esta asignatura"
                                >
                                  <ArrowLeftRight className="w-3 h-3" />
                                  <span>Swap</span>
                                </button>

                                {isEnrolled ? (
                                  <span className="font-bold text-accent-emerald tracking-wide">✓ ASOCIADO PASAPORTE</span>
                                ) : (
                                  <button
                                    onClick={() => handleToggleCart(c)}
                                    className={`px-2.5 py-1 rounded font-bold text-[10px] transition-all cursor-pointer ${
                                      cart.some(x => x.id === c.id) 
                                        ? "bg-accent-violet text-white" 
                                        : "bg-accent-yellow text-black hover:bg-yellow-400"
                                    }`}
                                  >
                                    {cart.some(x => x.id === c.id) ? "En Carrito" : "Inscribirse"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Swap / Customization sidebar Panel (Right Column) */}
                <div className="lg:col-span-4 bg-[#0a0a0d] border border-border-dark rounded-3xl p-5 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-mono font-bold text-accent-yellow uppercase">
                      Panel de Personalización
                    </h4>
                    <p className="text-[11px] text-text-dim leading-relaxed">
                      Si decides cambiar alguna asignatura de tu ruta adaptativa, puedes dar clic al botón <strong className="text-white">Swap</strong> del paso y elegir uno de los siguientes cursos alternativos compatibles a continuación.
                    </p>
                  </div>

                  {selectedSwapIndex !== null ? (
                    <div className="space-y-3 animate-fade-in border border-accent-violet/30 bg-accent-violet/[0.02] p-4 rounded-2xl">
                      <span className="text-[9px] font-bold text-accent-violet uppercase block">Compatible para Paso {selectedSwapIndex + 1}</span>
                      <h5 className="font-bold text-white text-xs leading-snug">Selecciona la materia de reemplazo:</h5>
                      
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {courses
                          .filter(c => !suggestedRouteCourses.some(sc => sc.id === c.id))
                          .map(altCourse => (
                            <button
                              key={altCourse.id}
                              onClick={() => executeSwap(altCourse)}
                              className="w-full text-left p-2.5 bg-black/60 border border-border-dark rounded-xl hover:border-accent-violet transition-all cursor-pointer flex justify-between items-center text-[11px]"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="text-[8px] font-mono text-accent-yellow font-bold uppercase">{altCourse.university}</span>
                                <h6 className="font-bold text-white leading-tight truncate mt-0.5">{altCourse.title}</h6>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-accent-violet shrink-0" />
                            </button>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-black/30 border border-border-dark/60 rounded-2xl text-center py-6 text-text-dim space-y-2">
                      <Sliders className="w-5 h-5 mx-auto text-text-dim opacity-50" />
                      <p className="text-[11px]">No has indicado reemplazos. Da clic en "Swap" para personalizar tu track académico.</p>
                    </div>
                  )}

                  {/* Adopt Route Collectively Action */}
                  <div className="pt-2 border-t border-border-dark/60 space-y-3">
                    <button
                      onClick={() => {
                        const notEnrolled = suggestedRouteCourses.filter(c => !student.passport.sellos.some(s => s.courseId === c.id));
                        if (notEnrolled.length === 0) {
                          triggerToast("Ya estás matriculado en toda la ruta recomendada.", "info");
                          return;
                        }
                        
                        setCart(prev => {
                          const updated = [...prev];
                          notEnrolled.forEach(c => {
                            if (!updated.some(x => x.id === c.id)) updated.push(c);
                          });
                          return updated;
                        });
                        
                        triggerToast("¡Mallas agregadas colectivamente al Carrito de Créditos!", "success");
                        setStudentTab("market");
                      }}
                      className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-extrabold text-center block p-3 rounded-xl uppercase tracking-wider font-mono text-[10px] cursor-pointer"
                    >
                      Adoptar esta Ruta Sugerida
                    </button>
                    <button
                      onClick={() => {
                        setStudentTab("market");
                        triggerToast("Explora el catálogo libre con filtros inteligentes.", "info");
                      }}
                      className="w-full bg-transparent hover:bg-neutral-900 border border-border-dark text-white font-bold text-center block p-3 rounded-xl text-[10px] cursor-pointer"
                    >
                      Personalizar en el Marketplace
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 3: MARKETPLACE DE CURSOS, PERSONALIZACIÓN Y ROBUSTO CHECKOUT */}
      {studentTab === "market" && (
        <div id="tab_market_active_flow" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
          
          {/* General Catalog Marketplace Grid (Left Column) */}
          <div className="lg:col-span-8 bg-black/40 border border-border-dark p-6 rounded-3xl space-y-6">
            
            {/* Realtime Search & Category Filters */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-text-dim absolute left-3 top-3" />
                  <input
                    type="text"
                    value={marketSearchText}
                    onChange={(e) => setMarketSearchText(e.target.value)}
                    placeholder="Buscar asignaturas por nombre, habilidad, facultad..."
                    className="w-full bg-[#0a0a0d] border border-border-dark text-xs p-2.5 pl-10 rounded-xl text-white outline-none focus:border-accent-yellow"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={marketUniversity}
                    onChange={(e) => setMarketUniversity(e.target.value)}
                    className="bg-[#0a0a0d] border border-border-dark text-xs p-2 rounded-xl text-white outline-none"
                  >
                    <option value="Todos">Todas las U</option>
                    <option value="Universidad de los Andes">Univ. de los Andes</option>
                    <option value="Pontificia Universidad Javeriana">Javeriana</option>
                    <option value="EAFIT Medellín">EAFIT</option>
                  </select>
                </div>
              </div>

              {/* Pills Filters */}
              <div className="flex flex-wrap gap-1.5 border-b border-border-dark/60 pb-3">
                {["Todos", "Tecnología", "Ingeniería & Tech", "Diseño", "Habilidades Blandas", "Negocios"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setMarketCategory(cat);
                      triggerToast(`Filtro asignado: ${cat}`, "info");
                    }}
                    className={`py-1 px-3 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                      marketCategory === cat 
                        ? "bg-accent-yellow text-black" 
                        : "bg-neutral-900 text-text-dim hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* General Courses Grid */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white font-display mb-3 uppercase tracking-wider">Plan de Estudios Disgregado & Adquirible</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses
                  .filter(c => {
                    const matchSearch = c.title.toLowerCase().includes(marketSearchText.toLowerCase()) || 
                                        c.description.toLowerCase().includes(marketSearchText.toLowerCase()) ||
                                        c.university.toLowerCase().includes(marketSearchText.toLowerCase());
                    const matchCat = marketCategory === "Todos" ? true : c.category === marketCategory;
                    const matchUni = marketUniversity === "Todos" ? true : c.university === marketUniversity;
                    return matchSearch && matchCat && matchUni;
                  })
                  .map(c => {
                    const isEnrolled = student.passport.sellos.some(s => s.courseId === c.id);
                    const isInRoute = suggestedRouteCourses.some(sc => sc.id === c.id);
                    const isInCart = cart.some(x => x.id === c.id);
                    return (
                      <div 
                        key={c.id} 
                        className={`bg-black/50 border rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-gray-600 transition-all ${
                          isEnrolled ? "border-accent-emerald/20" : "border-border-dark"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-accent-yellow uppercase font-bold">{c.university}</span>
                            <span className="text-text-dim">{c.duration}</span>
                          </div>

                          <h4 className="font-bold text-white text-xs line-clamp-1 leading-snug">{c.title}</h4>
                          <p className="text-[10px] text-text-dim line-clamp-2 leading-relaxed">{c.description}</p>
                        </div>

                        <div className="pt-2 border-t border-border-dark/60 flex items-center justify-between text-xs">
                          <div className="text-[10px] text-text-dim">
                            Costo: <strong className="text-white font-mono">{c.cost} Vinku</strong>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isInRoute && (
                              <span className="text-[9px] font-mono text-accent-violet font-bold bg-accent-violet/15 px-2 py-0.5 rounded border border-accent-violet/10">
                                En tu Ruta
                              </span>
                            )}

                            {isEnrolled ? (
                              <span className="text-accent-emerald text-[10px] font-bold font-mono">
                                ✓ Matriculado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleCart(c)}
                                className={`py-1 px-3.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                  isInCart 
                                    ? "bg-neutral-800 text-white" 
                                    : "bg-accent-yellow text-black hover:bg-yellow-400"
                                }`}
                              >
                                {isInCart ? "Quitar" : "Agregar"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Checkout & Digital Wallet Projections (Right Column) */}
          <div className="lg:col-span-4 bg-[#101014] border border-border-dark p-5 rounded-3xl space-y-4 text-xs">
            <div className="space-y-1 pb-2 border-b border-border-dark/60">
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">Carrito & Checkout</h3>
              <p className="text-xs text-text-dim">Revisa los créditos a pagar y proyecciones de tu pasaporte.</p>
            </div>

            {/* List of items inside cart */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="p-3 bg-black/40 border border-border-dark rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                  <div className="min-w-0">
                    <span className="text-[8px] font-mono text-accent-yellow font-bold uppercase">{item.university}</span>
                    <h5 className="font-bold text-white text-xs truncate leading-tight">{item.title}</h5>
                    <span className="text-[10px] font-mono text-text-dim block mt-0.5">{item.cost} Créditos</span>
                  </div>
                  <button
                    onClick={() => handleToggleCart(item)}
                    className="p-1 hover:text-red-500 text-text-dim transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-8 text-text-dim space-y-1.5">
                  <BookOpen className="w-6 h-6 mx-auto text-text-dim opacity-50" />
                  <p className="text-[11px]">No has agregado asignaturas libres para checkout.</p>
                </div>
              )}
            </div>

            {/* Desglose Financiero */}
            <div className="space-y-2 bg-black/40 border border-border-dark p-3.5 rounded-2xl relative font-mono text-[11px] leading-relaxed">
              <div className="flex justify-between">
                <span className="text-text-dim">Subtotal:</span>
                <span className="text-white">{totalCartCost} Vinku</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Descuento de Ruta:</span>
                <span className="text-accent-emerald">-0 Vinku</span>
              </div>
              <div className="flex justify-between border-t border-border-dark/60 pt-2 font-bold text-white">
                <span>TOTAL A PAGAR:</span>
                <span className="text-accent-yellow">{totalCartCost} VINKU</span>
              </div>
            </div>

            {/* Projected Wallet Draft Representation as per specs */}
            <div className="p-3 bg-accent-violet/5 border border-accent-violet/20 rounded-2xl space-y-2">
              <span className="text-[9px] font-mono text-accent-violet font-bold block uppercase">Proyección Financiera Pasaporte:</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-text-dim block leading-tight">Saldo Actual:</span>
                  <strong className="text-white">
                    {studentUserType === "B2C" ? student.walletBalance : b2bPresupuesto} Vinku
                  </strong>
                </div>
                <div>
                  <span className="text-text-dim block leading-tight">Saldo Restante:</span>
                  <strong className={
                    ((studentUserType === "B2C" ? student.walletBalance : b2bPresupuesto) - totalCartCost) < 0 
                      ? "text-red-500 font-bold" 
                      : "text-accent-emerald font-bold"
                  }>
                    {((studentUserType === "B2C" ? student.walletBalance : b2bPresupuesto) - totalCartCost)} Vinku
                  </strong>
                </div>
              </div>
            </div>

            {/* checkout CTA */}
            <button
              onClick={handleCheckoutWithCredits}
              disabled={cart.length === 0}
              className={`w-full text-center block p-3.5 rounded-xl uppercase font-extrabold tracking-wider text-[11px] transition-all ${
                cart.length > 0 
                  ? "bg-accent-yellow text-black hover:bg-yellow-400 cursor-pointer shadow-lg shadow-yellow-500/5" 
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/60"
              }`}
            >
              Confirmar Compra con mis Créditos Vinku
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PORTAFOLIO DE LOGROS Y EVIDENCIAS DE PRODUCTOS */}
      {studentTab === "portfolio" && (
        <div id="tab_portfolio_active_flow" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
          
          {/* Main Achievements List (Left Column) */}
          <div className="lg:col-span-8 bg-black/40 border border-border-dark p-6 rounded-3xl space-y-6">
            <div className="space-y-1 pb-2 border-b border-border-dark/60">
              <h3 className="text-lg font-display font-bold text-white">Mi Portafolio Público de Logros y Evidencias</h3>
              <p className="text-xs text-text-dim">Muestra tus propósitos, logros sincrónicos validados y los productos URL comprobables conectados.</p>
            </div>

            {/* SECCIÓN "MIS LOGROS CUMPLIDOS" */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-accent-yellow uppercase tracking-widest">Mis Logros Cumplidos</h4>
              
              <div className="space-y-3">
                {student.passport.logros.map((achievement, idx) => (
                  <div key={idx} className="bg-black/30 border border-border-dark/80 p-5 rounded-2xl space-y-3 hover:border-gray-600 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />
                        <h5 className="font-bold text-white text-xs">{achievement.goal}</h5>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border self-start ${
                        achievement.status === "Cumplido" 
                          ? "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20" 
                          : "bg-amber-400/15 text-amber-400 border-amber-400/20"
                      }`}>
                        {achievement.status}
                      </span>
                    </div>

                    {/* Associated Products URL badges editable as per specs */}
                    <div className="space-y-2 pt-1 border-t border-border-dark/40">
                      <span className="text-[10px] font-mono text-text-dim block">Evidencias y Productos Asociados:</span>
                      
                      <div className="flex flex-wrap gap-2">
                        {achievement.associatedProducts.map((p, pIdx) => {
                          const isGit = p.toLowerCase().includes("github");
                          const isDrive = p.toLowerCase().includes("drive") || p.toLowerCase().includes("google");
                          const isNotion = p.toLowerCase().includes("notion");
                          
                          return (
                            <a 
                              key={pIdx}
                              href={p.split(": ")[1] || "#"} 
                              target="_blank" 
                              rel="noreferrer referrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-border-dark rounded-xl text-[10px] hover:border-accent-violet transition-all text-zinc-300"
                            >
                              {isGit && <Github className="w-3.5 h-3.5 text-white" />}
                              {isDrive && <FolderDot className="w-3.5 h-3.5 text-accent-emerald" />}
                              {isNotion && <FileText className="w-3.5 h-3.5 text-yellow-500" />}
                              {!isGit && !isDrive && !isNotion && <ExternalLink className="w-3.5 h-3.5" />}
                              <span className="font-bold font-mono truncate max-w-[150px]">{p}</span>
                            </a>
                          );
                        })}

                        {achievement.associatedProducts.length === 0 && (
                          <span className="text-[10px] font-mono text-text-dim block">No hay productos comprobables vinculados a este logro académico.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {student.passport.logros.length === 0 && (
                  <div className="p-8 border border-dashed border-border-dark text-center rounded-2xl space-y-1.5">
                    <Briefcase className="w-6 h-6 mx-auto text-text-dim opacity-50" />
                    <p className="text-text-dim text-xs">No has configurado metas en tu portafolio de egresado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Goal Form & Add Evidences Link Input (Right Column) */}
          <div className="lg:col-span-4 bg-[#101014] border border-border-dark p-5 rounded-3xl space-y-5 text-xs">
            
            {/* Form to submit and register achievements */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-accent-yellow uppercase">Registrar Logro Profesional</h4>
                <p className="text-[11px] text-text-dim">Sube un hito técnico para vincularlo a tu perfil de empleabilidad.</p>
              </div>

              <form onSubmit={onAddGoal} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Meta o Logro Alcanzado</label>
                  <textarea
                    rows={2}
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    placeholder="ej. Desplegué un modelo predictivo en mi curso modular universitario."
                    className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-2.5 text-xs text-white outline-none focus:border-accent-yellow"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Tags de Logro (ej. Python, AI)</label>
                  <input
                    type="text"
                    value={newGoalProducts}
                    onChange={(e) => setNewGoalProducts(e.target.value)}
                    placeholder="Python, Flask, Docker"
                    className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-2.5 text-xs text-white outline-none focus:border-accent-yellow"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-extrabold text-center block p-2.5 rounded-xl uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  Registrar Avance
                </button>
              </form>
            </div>

            {/* SECCIÓN "EVIDENCIAS Y PRODUCTOS ASOCIADOS" */}
            <div className="space-y-3 pt-4 border-t border-border-dark/60">
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-accent-yellow uppercase">Inyectar Soporte URL de Evidencia</h4>
                <p className="text-[11px] text-text-dim">Pega el link de github, notion o drive del producto para validación.</p>
              </div>

              <form onSubmit={handleAddEvidenceLink} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Logro a Vincular</label>
                  <select
                    value={evGoalIndex}
                    onChange={(e) => setEvGoalIndex(parseInt(e.target.value))}
                    className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-2.5 text-xs text-white outline-none focus:border-accent-yellow"
                  >
                    {student.passport.logros.map((g, idx) => (
                      <option key={idx} value={idx}>{g.goal.slice(0, 32)}...</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Tipo de Plataforma</label>
                  <select
                    value={evLinkCategory}
                    onChange={(e) => setEvLinkCategory(e.target.value as any)}
                    className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-2.5 text-xs text-white outline-none focus:border-accent-yellow"
                  >
                    <option value="Github">Github Repository (.git)</option>
                    <option value="Drive">Google Drive Folder / Slide</option>
                    <option value="Notion">Notion Document / Wiki</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">URL de Evidencia Externa</label>
                  <input
                    type="url"
                    value={evLinkText}
                    onChange={(e) => setEvLinkText(e.target.value)}
                    placeholder="https://github.com/vinku-alumni/predictive-model"
                    className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-2.5 text-xs text-white outline-none focus:border-accent-yellow"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-violet hover:bg-violet-600 text-white font-extrabold text-center block p-2.5 rounded-xl uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  Vincular Evidencia Técnica
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: VINKU FELLOWSHIP HUB DE MENTORÍAS SÍNCRONAS */}
      {studentTab === "fellowship" && (
        <div id="tab_fellowship_active_flow" className="space-y-6 font-sans">
          
          {/* Header Propuesta de valor */}
          <div className="bg-gradient-to-br from-[#12121c] to-black border border-border-dark p-6 md:p-8 rounded-3xl relative overflow-hidden space-y-3">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-yellow/5 rounded-full blur-3xl pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-[10px] text-accent-yellow uppercase font-mono tracking-wider font-bold">
              <Sparkles className="w-3.5 h-3.5 text-accent-yellow animate-pulse" />
              <span>Soporte Académico Sincrónico</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white font-display leading-tight">
              Vinku Fellowship — Acompañamiento sincrónico para potenciar tus logros y expandir tu círculo de networking.
            </h3>
            <p className="text-xs text-text-dim max-w-2xl leading-relaxed">
              Reserva mentorías uno a uno con expertos del ecosistema corporativo para resolver dudas técnicas, revisar tus productos url, acelerar tus mallas y conseguir referenciación de empleo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Booking Form and Schedulers (Left Column) */}
            <div className="lg:col-span-8 bg-black/40 border border-border-dark p-6 rounded-3xl space-y-6">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-display">Reserva una Mentoría Sincrónica</h4>
                <p className="text-xs text-text-dim">Mide tus avances con fellows experimentados en la nube.</p>
              </div>

              {/* SIMULATED WIDGET CALENDLY / GOOGLE CALENDAR AS PER SPEC */}
              <div className="border border-[#1f1f28] rounded-2xl bg-[#09090d] p-5 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 left-0 w-48 h-48 bg-accent-violet/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-3 max-w-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent-violet shrink-0" />
                    <span className="text-xs font-mono font-bold text-white uppercase">Widget de Reserva Externa</span>
                  </div>
                  <h5 className="font-bold text-white text-sm tracking-tight leading-snug">Vincular mi Agenda de Calendly / Google Calendar</h5>
                  <p className="text-[11px] text-text-dim leading-relaxed">
                    Sincroniza agendas y genera salones de zoom automáticos en un click. Todo tu track académico se actualiza en el calendar de tu evaluador.
                  </p>
                </div>

                <div className="bg-black/60 border border-border-dark p-4 rounded-xl text-center shrink-0 w-full md:w-56 space-y-3 font-mono text-[11px]">
                  <div className="text-text-dim text-[10px] uppercase">Integrador Google Stitch</div>
                  <div className="p-2.5 bg-[#14141d] rounded-lg border border-border-dark text-[10px] text-accent-yellow">
                    ⚡ Servidor Active API Connect
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerToast("Calendario de Citas sincronizado con Google Workspace API", "success")}
                    className="w-full text-center bg-accent-violet text-white font-bold p-2 text-[10px] rounded hover:bg-violet-600 transition-all cursor-pointer block"
                  >
                    Vincular Calendly / Meet
                  </button>
                </div>
              </div>

              {/* Form Submission */}
              <form onSubmit={(e) => {
                e.preventDefault();
                setFellowshipSuccessLocal(true);
                onBookFellowship(e);
                triggerToast("Sesión agendada de Vinku Fellowship!", "success");
                setTimeout(() => setFellowshipSuccessLocal(false), 3000);
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-dim uppercase">Selecciona tu Fellow/Mentor</label>
                    <select
                      value={fellowshipForm.mentorName}
                      onChange={(e) => setFellowshipForm((prev: any) => ({ ...prev, mentorName: e.target.value }))}
                      className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-white outline-none text-xs"
                    >
                      <option value="Ing. Alejandro Cruz">Ing. Alejandro Cruz (Fullstack Fellow)</option>
                      <option value="Diana Martínez">Diana Martínez (Cloud Infrastructure Expert)</option>
                      <option value="Prof. Miguel Soto">Prof. Miguel Soto (AI Researcher Andes)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-dim uppercase">Bloque de Horario Sincrónico</label>
                    <select
                      value={fellowshipForm.dateTime}
                      onChange={(e) => setFellowshipForm((prev: any) => ({ ...prev, dateTime: e.target.value }))}
                      className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-white outline-none text-xs"
                    >
                      <option value="Lunes Próximo, 4:00 PM">Lunes Próximo, 4:00 PM (Hora de Colombia)</option>
                      <option value="Miércoles Entrante, 10:00 AM">Miércoles Entrante, 10:00 AM</option>
                      <option value="Viernes en la Tarde, 2:00 PM">Viernes en la Tarde, 2:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-mono text-text-dim uppercase">Tema a Revisar con tu Fellow (Dudas Técnicas)</label>
                  <input
                    type="text"
                    required
                    value={fellowshipForm.topic}
                    onChange={(e) => setFellowshipForm((prev: any) => ({ ...prev, topic: e.target.value }))}
                    placeholder="ej. Revisión de modelo y test unitarios del track de AWS"
                    className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-white outline-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-accent-yellow hover:bg-yellow-400 text-black font-extrabold text-xs py-2.5 px-6 rounded-xl inline-flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agendar Mentoría Sincrónica</span>
                </button>
              </form>
            </div>

            {/* List of Scheduled sessions with Zoom links (Right Column) */}
            <div className="lg:col-span-4 bg-[#0a0a0d] border border-[#1b1b22] p-5 rounded-3xl space-y-4 text-xs">
              <span className="text-[10px] font-mono font-bold text-accent-yellow uppercase block">Mis Próximas Sesiones</span>

              <div className="space-y-3">
                {universities.length > 0 && (
                  <div className="p-4 bg-black/40 border border-border-dark rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-accent-emerald uppercase font-bold tracking-wider">Hoy Agendado</span>
                      <span className="text-[9px] font-mono text-text-dim">En Línea</span>
                    </div>

                    <div>
                      <h5 className="font-bold text-white text-xs leading-snug">Ing. Alejandro Cruz</h5>
                      <p className="text-[10px] text-text-dim mt-0.5">Tema: Dudas sincrónicas de integración Cloud</p>
                      <span className="text-[10px] font-mono text-accent-violet block mt-1">Hoy • 3:30 PM (Colombia)</span>
                    </div>

                    {/* Specifications Zoom CTA */}
                    <button
                      onClick={() => {
                        setActiveZoomSession("https://zoom.vinkupass.com/j/984310842-meet");
                        triggerToast("Iniciando videoconferencia sincrónica Vinku Fellowship...", "success");
                      }}
                      className="w-full text-center bg-accent-emerald hover:bg-emerald-500 text-black font-extrabold p-2 rounded-xl text-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Unirse a la Mentoría (Zoom/Meet)</span>
                    </button>
                  </div>
                )}

                {/* Fellow sessions scheduled */}
                <div id="booked_sessions_list_container" className="space-y-2 pointer-events-auto">
                  {student.passport.logros.slice(0, 2).map((item, id) => (
                    <div key={id} className="p-3 bg-black/30 border border-border-dark rounded-xl flex items-center justify-between gap-2.5">
                      <div className="min-w-0">
                        <h6 className="font-bold text-white text-xs truncate">Mentor: Diana Martínez</h6>
                        <span className="text-[10px] text-text-dim truncate block">Topic: {item.goal.slice(0, 32)}</span>
                        <span className="text-[9px] font-mono text-text-dim mt-1 block">Próxima semana • 10:00 AM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeZoomSession && (
                <div className="p-3 bg-[#11231b] border border-accent-emerald/30 rounded-2xl space-y-2 animate-fade-in text-center">
                  <span className="text-[10px] font-mono text-accent-emerald font-bold">CONEXIÓN ABIERTA:</span>
                  <p className="text-[9px] text-text-dim leading-snug">Se ha abierto una nueva pestaña. Si no abre, copia la sesión para ingresar.</p>
                  <code className="text-[9px] bg-black/50 p-2 font-mono rounded block text-zinc-300 select-all truncate">{activeZoomSession}</code>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
