import React, { useState, useEffect } from "react";
import { 
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Download,
  Search,
  BookOpen,
  DollarSign,
  Users,
  Award,
  Wallet,
  Upload,
  Lock,
  Mail,
  User,
  MapPin,
  ChevronRight,
  AlertCircle,
  FileText,
  BadgeAlert,
  Sliders,
  CheckCircle,
  Loader2,
  RefreshCw,
  Menu,
  X
} from "lucide-react";
import { Course, UniversityStats } from "../types";

interface UniversityPortalViewProps {
  courses: Course[];
  universities: UniversityStats[];
  onCourseAdded: () => void;
  onCertifyApprove: (studentId: string, courseId: string, universityId: string) => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => void;
}

// Student mock for directory
interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  courseTitle: string;
  courseId: string;
  enrollDate: string;
  progress: number; // percentage
  status: "En Curso" | "Por Certificar" | "Completado";
  attachedPdfName?: string;
}

export default function UniversityPortalView({
  courses,
  universities,
  onCourseAdded,
  onCertifyApprove,
  triggerToast,
  fetchState
}: UniversityPortalViewProps) {
  // Session / Authentication state
  const [isLogged, setIsLogged] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  
  // Registration Form States
  const [eduName, setEduName] = useState("");
  const [eduEmail, setEduEmail] = useState("");
  const [eduNit, setEduNit] = useState("");
  const [eduCountry, setEduCountry] = useState("Colombia");
  const [eduCity, setEduCity] = useState("");
  const [eduPass, setEduPass] = useState("");
  const [eduConfirmPass, setEduConfirmPass] = useState("");
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Simulated Verification/Audit State
  const [isUnderAudit, setIsUnderAudit] = useState(false);

  // Onboarding Wizard Block State
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  
  // Onboarding Data States
  const [logoOption, setLogoOption] = useState<"default" | "uploaded">("default");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState("#FFD200");
  const [bankName, setBankName] = useState("Bancolombia S.A.");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountType, setBankAccountType] = useState("Ahorros");
  const [isCompletingWizard, setIsCompletingWizard] = useState(false);

  // Active Tab/Section state after access is fully granted
  const [activeTab, setActiveTab] = useState<"dashboard" | "catalogo" | "matriculados" | "certificaciones">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Course Add/Edit modal/form state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseFormTitle, setCourseFormTitle] = useState("");
  const [courseFormProgram, setCourseFormProgram] = useState("");
  const [courseFormCategory, setCourseFormCategory] = useState("Ingeniería & Tech");
  const [courseFormDesc, setCourseFormDesc] = useState("");
  const [courseFormCost, setCourseFormCost] = useState("450");
  const [courseFormHours, setCourseFormHours] = useState("64");
  const [courseFormSkills, setCourseFormSkills] = useState("");

  // Shared enrolled directory state (populated with rich realistic metrics)
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [isExporting, setIsExporting] = useState(false);

  // Certifications list upload progress states
  const [uploadProgress, setUploadProgress] = useState<{ [studentId: string]: { percent: number; fileName: string } }>({});
  const [certifyingId, setCertifyingId] = useState<string | null>(null);

  // Bank stats & liquid cash
  const [liquidBalance, setLiquidBalance] = useState(4800);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Active University session data (simulated based on UI/Onboarding)
  const [currentUniDetails, setCurrentUniDetails] = useState({
    name: "Universidad de los Andes",
    logoColor: "#FFD200",
    logo: "UniAndes"
  });

  // Calculate stats dynamically on the client
  const activeUniCourses = courses.filter(c => c.university === currentUniDetails.name);
  const activeUniStats = universities.find(u => u.name === currentUniDetails.name) || {
    uploadedCoursesCount: activeUniCourses.length,
    enrolledStudentsCount: 22,
    totalEarnings: 9900,
    certificationsPending: []
  };

  // Populate mock enrolled student directory
  useEffect(() => {
    // Generate simulated enrolled students synced with course options
    const list: EnrolledStudent[] = [
      {
        id: "stud-1",
        name: "Diana Prince",
        email: "diana.prince@vinkupass.com",
        courseTitle: "Arquitectura e Integración de Sistemas en la Nube",
        courseId: "c-1",
        enrollDate: "2026-05-18",
        progress: 100,
        status: "Por Certificar"
      },
      {
        id: "stud-2",
        name: "Esteban Córdoba",
        email: "esteban.cordoba@vinku.com",
        courseTitle: "Arquitectura e Integración de Sistemas en la Nube",
        courseId: "c-1",
        enrollDate: "2026-05-20",
        progress: 75,
        status: "En Curso"
      },
      {
        id: "stud-3",
        name: "Laura Restrepo",
        email: "laura.restrepo@emp-vinku.com",
        courseTitle: "Desarrollo Fullstack Profesional con React y Node.js",
        courseId: "c-3",
        enrollDate: "2026-05-24",
        progress: 45,
        status: "En Curso"
      },
      {
        id: "stud-4",
        name: "Gabriel Medina",
        email: "gabriel.medina@telecom.com",
        courseTitle: "Arquitectura e Integración de Sistemas en la Nube",
        courseId: "c-1",
        enrollDate: "2026-05-10",
        progress: 100,
        status: "Completado",
        attachedPdfName: "CERT-UNIANDES-9831.pdf"
      },
      {
        id: "stud-5",
        name: "Sofía Martínez",
        email: "sofia.martinez@analytics.org",
        courseTitle: "Diplomado en Inteligencia Artificial y Machine Learning",
        courseId: "c-4",
        enrollDate: "2026-05-02",
        progress: 95,
        status: "En Curso"
      },
      {
        id: "stud-6",
        name: "Andrés Delgado",
        email: "andres.delgado@edu.co",
        courseTitle: "Estrategias de Growth Marketing y Analítica Digital",
        courseId: "c-2",
        enrollDate: "2026-05-15",
        progress: 100,
        status: "Por Certificar"
      }
    ];
    setEnrolledStudents(list);
  }, []);

  // Sync state if universities list shifts
  useEffect(() => {
    const uni = universities.find(u => u.name === currentUniDetails.name);
    if (uni && uni.certificationsPending.length > 0) {
      // Sincronizar alumnos locales con certificaciones pendientes del backend si aplica
      setEnrolledStudents(prev => {
        // Asegurarse de que Diana Prince tenga estado correcto si está en la lista pendiente del backend
        const hasDianaPending = uni.certificationsPending.some(p => p.studentId === "s-101");
        return prev.map(st => {
          if (st.name === "Diana Prince" && hasDianaPending) {
            return { ...st, status: "Por Certificar", progress: 100 };
          }
          return st;
        });
      });
    }
  }, [universities]);

  // Validadores
  const isEmailEdu = (email: string) => email.toLowerCase().endsWith(".edu") || email.toLowerCase().endsWith(".edu.co") || email.toLowerCase().endsWith(".edu.mx") || email.toLowerCase().split("@")[1]?.includes("edu");

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "Vacía", color: "bg-neutral-800", text: "text-text-dim", width: "w-0" };
    if (pass.length < 6) return { label: "Débil", color: "bg-red-500", text: "text-red-500", width: "w-1/4" };
    if (pass.length < 10) return { label: "Media", color: "bg-yellow-500", text: "text-yellow-500", width: "w-2/4" };
    return { label: "Fuerte", color: "bg-accent-emerald", text: "text-accent-emerald", width: "w-full" };
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduName || !eduEmail || !eduNit || !eduCity || !eduPass) {
      triggerToast("Por favor complementa todos los campos obligatorios.", "error");
      return;
    }
    if (!isEmailEdu(eduEmail)) {
      triggerToast("El correo electrónico debe ser de dominio educativo oficial (.edu)", "error");
      return;
    }
    if (eduPass !== eduConfirmPass) {
      triggerToast("Las contraseñas ingresadas no coinciden.", "error");
      return;
    }

    // Trigger visual audit block representational state
    setIsUnderAudit(true);
    triggerToast("Registrando universidad... Enviando credenciales a auditoría de SuperAdmin.", "info");

    setTimeout(() => {
      // Mock passing the audit after a short delay
      setIsUnderAudit(false);
      setNeedsOnboarding(true);
      setIsLogged(true);
      setCurrentUniDetails({
        name: eduName,
        logoColor: primaryColor,
        logo: "CustomLogo"
      });
      triggerToast("¡Auditoría de Registro Aprobada por SuperAdmin! Bienvenido a Vinkupass.", "success");
    }, 4000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      triggerToast("Por favor ingresa tu correo y contraseña.", "error");
      return;
    }
    
    // Simulate logging in
    triggerToast("Autenticando credenciales e interactuando con firmas...", "info");
    
    setTimeout(() => {
      // Default mock university for simulation login
      setIsLogged(true);
      setNeedsOnboarding(true); // Let them go through the wizard
      setOnboardingStep(1);
      setCurrentUniDetails({
        name: "Universidad de los Andes",
        logoColor: "#FFD200",
        logo: "UniAndes"
      });
      triggerToast("Sello de sesión validado. ¡Acceso concedido!", "success");
    }, 1500);
  };

  // Onboarding action
  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardingStep === 1) {
      if (logoOption === "uploaded" && !logoPreview) {
        triggerToast("Por favor carga el logo oficial transparente o usa la opción predeterminada.", "error");
        return;
      }
      setOnboardingStep(2);
      triggerToast("Identidad visual guardada con éxito. Procediendo al paso financiero.", "success");
    } else {
      if (!bankAccount) {
        triggerToast("Por favor digita tu número de cuenta bancaria.", "error");
        return;
      }
      setIsCompletingWizard(true);
      setTimeout(() => {
        setIsCompletingWizard(false);
        setNeedsOnboarding(false);
        setActiveTab("dashboard");
        triggerToast("¡Onboarding Exitoso! Tu consola de dispersión y acreditamiento se encuentra en línea.", "success");
      }, 2000);
    }
  };

  // Simulated liquidation
  const handleLiquidAction = () => {
    if (liquidBalance <= 0) {
      triggerToast("No tienes saldos pendientes para liquidar.", "error");
      return;
    }
    setIsWithdrawing(true);
    triggerToast(`Iniciando transferencia de USD ${liquidBalance.toLocaleString()} hacia la cuenta ${bankAccountType} en ${bankName}...`, "info");
    
    setTimeout(() => {
      setIsWithdrawing(false);
      triggerToast(`¡Dispersión Exitosa! USD ${liquidBalance.toLocaleString()} transferidos. Recibido en tu portal corporativo bancario.`, "success");
      setLiquidBalance(0);
    }, 3000);
  };

  // Create course inside CMS Catalogo
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormTitle || !courseFormCost || !courseFormHours) {
      triggerToast("Favor digita todos los campos obligatorios.", "error");
      return;
    }

    try {
      const response = await fetch("/api/vinkupass/course/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseFormTitle,
          university: currentUniDetails.name,
          level: "Educación Continua",
          duration: `${courseFormHours} Horas`,
          cost: parseFloat(courseFormCost),
          skills: courseFormSkills ? courseFormSkills.split(",").map(sk => sk.trim()) : ["Competencia Técnica"],
          description: courseFormDesc,
          category: courseFormCategory
        })
      });
      
      const data = await response.json();
      if (data.success) {
        triggerToast(`Curso '${courseFormTitle}' publicado en el catálogo corporativo.`, "success");
        setShowCatalogModal(false);
        
        // Reset
        setCourseFormTitle("");
        setCourseFormProgram("");
        setCourseFormSkills("");
        setCourseFormDesc("");
        
        onCourseAdded();
        fetchState();
      } else {
        triggerToast("Error publicando curso.", "error");
      }
    } catch {
      triggerToast("Error de conexión al guardar catálogo.", "error");
    }
  };

  // Toggle active/paused status on courses
  const handleToggleCourseStatus = (courseId: string, currentTitle: string) => {
    triggerToast(`Estado del curso '${currentTitle}' alternado. Suscriptores informados en el marketplace.`, "info");
  };

  // Simulating dragging or uploading file
  const handleFakePdfDrop = (studentId: string, fileName: string) => {
    let progress = 0;
    setUploadProgress(prev => ({
      ...prev,
      [studentId]: { percent: 0, fileName }
    }));

    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(prev => ({
        ...prev,
        [studentId]: { percent: progress, fileName }
      }));

      if (progress >= 100) {
        clearInterval(interval);
        triggerToast(`Archivo '${fileName}' cargado correctamente. Formato validado como PDF de la Institución.`, "success");
        
        // Sincronizar en el listado local de matriculados
        setEnrolledStudents(prev => 
          prev.map(st => st.id === studentId ? { ...st, attachedPdfName: fileName } : st)
        );
      }
    }, 300);
  };

  const handleSellarPasaporte = async (student: EnrolledStudent) => {
    if (!student.attachedPdfName) {
      triggerToast("Por favor carga el soporte de certificación PDF oficial antes de emitir.", "error");
      return;
    }

    setCertifyingId(student.id);
    triggerToast(`Sello criptográfico en cola. Firmando pasaporte para '${student.name}'...`, "info");

    setTimeout(async () => {
      // Llama a la API real del backend para cerrar la certificación
      try {
        const uniObj = universities.find(u => u.name === currentUniDetails.name) || universities[0];
        const res = await fetch("/api/vinkupass/university/certify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.name === "Diana Prince" ? "s-101" : student.id,
            courseId: student.courseId,
            universityId: uniObj.id
          })
        });

        if (res.ok) {
          triggerToast(`Sello e insignia emitidos exitosamente en el Vinkupass de ${student.name}!`, "success");
          
          // Actualiza visualmente el estado del alumno local
          setEnrolledStudents(prev => 
            prev.map(st => st.id === student.id ? { ...st, status: "Completado" } : st)
          );

          // Sumar saldo líquido simulado
          setLiquidBalance(prev => prev + 500);
          fetchState();
        } else {
          // Si falla de backend, igual forzarlo localmente en la demo
          triggerToast(`Sello e insignia emitidos localmente para ${student.name}.`, "success");
          setEnrolledStudents(prev => 
            prev.map(st => st.id === student.id ? { ...st, status: "Completado" } : st)
          );
        }
      } catch (err) {
        console.error(err);
        // Fallback local
        setEnrolledStudents(prev => 
          prev.map(st => st.id === student.id ? { ...st, status: "Completado" } : st)
        );
      } finally {
        setCertifyingId(null);
      }
    }, 1800);
  };

  // Mock export csv
  const handleExportCsv = () => {
    setIsExporting(true);
    triggerToast("Generando reporte de avance estudiantil integral...", "info");
    setTimeout(() => {
      setIsExporting(false);
      triggerToast("¡Descarga Exitosa! Guardado 'vinkupass-matriculados-andes.csv' en tu computadora.", "success");
    }, 2000);
  };

  // Filter local listings
  const filteredStudents = enrolledStudents.filter(st => {
    const matchSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        st.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCourse = filterCourse === "Todos" ? true : st.courseTitle.includes(filterCourse);
    const matchStatus = filterStatus === "Todos" ? true : st.status === filterStatus;
    return matchSearch && matchCourse && matchStatus;
  });

  const strengthObj = getPasswordStrength(eduPass);

  // =========================================================================
  // VIEW RENDERER A: ACCESS (REGISTER / LOGIN SCREEN) WITH 2 COLUMNS
  // =========================================================================
  if (!isLogged) {
    return (
      <div id="uni_auth_container" className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] bg-brand-bg rounded-3xl border border-border-dark overflow-hidden animate-fade-in font-sans">
        
        {/* Left Column - Beautiful Institutional Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1c1c24] to-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-r border-border-dark">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-yellow/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-[10px] text-accent-yellow uppercase font-mono tracking-wider font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Socio de Aprendizaje Sincrónico</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight font-display">
              El Pasaporte hacia la Empleabilidad de tu Universidad
            </h2>
            
            <p className="text-xs text-text-dim leading-relaxed">
              Vinkupass te permite disgregar diplomados, asignaturas y posgrados vigentes en micro-cursos consumibles directamente por corporativos nacionales e internacionales, cobrando matrículas de forma directa.
            </p>
          </div>

          <div className="space-y-4 pt-12 relative z-10 font-mono text-[11px] text-text-dim">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-accent-emerald bg-accent-emerald/10 p-0.5 rounded-full" />
              <span>Registros validados contra dominios .edu oficiales</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-accent-emerald bg-accent-emerald/10 p-0.5 rounded-full" />
              <span>Emisión de sellos criptográficos transparentes</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-accent-emerald bg-accent-emerald/10 p-0.5 rounded-full" />
              <span>Dispersiones inmediatas a cuentas fiscales bancarias</span>
            </div>
          </div>

          <div className="pt-8 border-t border-border-dark/60 mt-12">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-accent-yellow text-black flex items-center justify-center font-black text-xs">
                V
              </div>
              <span className="text-[11px] uppercase tracking-widest text-white font-bold font-display">
                Vinku<strong className="text-accent-yellow font-bold">pass</strong> Academico
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Input Forms (Both Register and Login) */}
        <div className="lg:col-span-7 bg-[#0b0b0e] p-6 md:p-10 flex flex-col justify-center">
          {isUnderAudit ? (
            <div className="max-w-md mx-auto text-center space-y-6 animate-pulse py-12">
              <div className="w-20 h-20 rounded-2xl bg-accent-yellow/10 border border-accent-yellow/30 flex items-center justify-center mx-auto text-accent-yellow animate-spin duration-3000">
                <RefreshCw className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Auditoría Fiscal & Legal de Registro</h3>
              <p className="text-xs text-text-dim max-w-sm mx-auto leading-relaxed">
                Nuestros algoritmos están rastreando la identificación tributaria y el dominio <strong className="text-white">"{eduEmail}"</strong> con el Ministerio de Educación. Por favor espera unos segundos.
              </p>
              <div className="p-3 bg-black/40 border border-border-dark rounded-xl max-w-xs mx-auto text-[10px] font-mono text-left space-y-1">
                <div><span className="text-text-dim">Consultando:</span> Registro Nacional de NIT</div>
                <div><span className="text-text-dim">Dominio:</span> .edu verifier active</div>
                <div><span className="text-text-dim">Verificador:</span> SuperAdmin Sandbox Panel</div>
              </div>
              <span className="text-[9px] font-mono text-accent-yellow uppercase block animate-pulse">Estatus: Validando Firma Criptográfica...</span>
            </div>
          ) : (
            <div className="max-w-md mx-auto w-full space-y-6">
              
              {/* Toggles */}
              <div className="flex p-1 bg-black/40 border border-border-dark rounded-xl mb-4 self-start max-w-xs">
                <button
                  onClick={() => setAuthMode("register")}
                  className={`flex-1 py-1 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === "register" ? "bg-accent-yellow text-black" : "text-text-dim hover:text-white"
                  }`}
                >
                  Registrarse
                </button>
                <button
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 py-1 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === "login" ? "bg-accent-yellow text-black" : "text-text-dim hover:text-white"
                  }`}
                >
                  Iniciar Sesión
                </button>
              </div>

              {authMode === "register" ? (
                // 1. REGISTRO FORM
                <form id="u_register_form" onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white font-display">Registro Institucional de Educación síncrona</h3>
                    <p className="text-xs text-text-dim">Ingresa los datos para solicitar la vinculación a la pasarela.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Nombre de la Institución</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-text-dim absolute left-3 top-3.5" />
                        <input
                          type="text"
                          required
                          value={eduName}
                          onChange={(e) => setEduName(e.target.value)}
                          placeholder="ej. Universidad de Los Andes"
                          className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 pl-10 text-xs text-white outline-none focus:border-accent-yellow"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block flex items-center justify-between">
                        <span>Email Institucional (.edu)</span>
                        {eduEmail && (
                          <span className={isEmailEdu(eduEmail) ? "text-accent-emerald font-bold" : "text-red-500 font-bold"}>
                            {isEmailEdu(eduEmail) ? "✓ Válido" : "✗ Sin terminación @...edu"}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-text-dim absolute left-3 top-3.5" />
                        <input
                          type="email"
                          required
                          value={eduEmail}
                          onChange={(e) => setEduEmail(e.target.value)}
                          placeholder="m.luna@universidad.edu"
                          className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 pl-10 text-xs text-white outline-none focus:border-accent-yellow"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">NIT / Identificación Legal</label>
                      <input
                        type="text"
                        required
                        value={eduNit}
                        onChange={(e) => setEduNit(e.target.value)}
                        placeholder="ej. NIT 860.005.860-2"
                        className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">País Principal</label>
                      <select
                        value={eduCountry}
                        onChange={(e) => setEduCountry(e.target.value)}
                        className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow"
                      >
                        <option value="Colombia">Colombia</option>
                        <option value="México">México</option>
                        <option value="España">España</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Chile">Chile</option>
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Ciudad de Operación</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-text-dim absolute left-3 top-3.5" />
                        <input
                          type="text"
                          required
                          value={eduCity}
                          onChange={(e) => setEduCity(e.target.value)}
                          placeholder="ej. Bogotá, D.C."
                          className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 pl-10 text-xs text-white outline-none focus:border-accent-yellow"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Contraseña</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-text-dim absolute left-3 top-3.5" />
                        <input
                          type="password"
                          required
                          value={eduPass}
                          onChange={(e) => setEduPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 pl-10 text-xs text-white outline-none focus:border-accent-yellow"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Confirmar Contraseña</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-text-dim absolute left-3 top-3.5" />
                        <input
                          type="password"
                          required
                          value={eduConfirmPass}
                          onChange={(e) => setEduConfirmPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 pl-10 text-xs text-white outline-none focus:border-accent-yellow"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Indicator bar */}
                  {eduPass && (
                    <div className="space-y-1 bg-black/30 p-2.5 rounded-lg border border-border-dark">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-text-dim">Seguridad:</span>
                        <strong className={strengthObj.text}>{strengthObj.label}</strong>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className={`h-full ${strengthObj.color} ${strengthObj.width} transition-all duration-500`} />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-extrabold text-xs uppercase p-3.5 rounded-xl block text-center tracking-widest transition-all cursor-pointer shadow-lg shadow-yellow-500/10"
                    >
                      Registrar Institución
                    </button>
                  </div>

                  <p className="text-[10px] text-text-dim tracking-wide leading-relaxed text-center mt-3">
                    Nuestra plataforma audita legalmente cada registro. Al hacer clic en Registrar, tu solicitud pasará al panel de verificación del SuperAdmin.
                  </p>
                </form>
              ) : (
                // 2. INICIAR SESIÓN FORM
                <form id="u_login_form" onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white font-display">Ingreso al Portal Universitario</h3>
                    <p className="text-xs text-text-dim">Accede al centro de catalogamiento, matriculación y firmas.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-dim uppercase block">Correo Electrónico de la Universidad</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-text-dim absolute left-3 top-3.5" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="ej. rrhh.continuado@uniandes.edu"
                        className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 pl-10 text-xs text-white outline-none focus:border-accent-yellow"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-dim uppercase block">Contraseña de Firma</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-text-dim absolute left-3 top-3.5" />
                      <input
                        type="password"
                        required
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-brand-bg/80 border border-border-dark rounded-xl p-3 pl-10 text-xs text-white outline-none focus:border-accent-yellow"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-extrabold text-xs uppercase p-3.5 rounded-xl block text-center tracking-widest transition-all cursor-pointer shadow-lg shadow-yellow-500/10"
                    >
                      Entrar de Seguro
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW RENDERER B: ONBOARDING WIZARD BLOCK (2 STEPS WITH PREVIEW)
  // =========================================================================
  if (needsOnboarding) {
    return (
      <div id="u_onboarding_wizard_container" className="max-w-xl mx-auto bg-[#121216] border border-border-dark p-6 md:p-8 rounded-3xl space-y-6 animate-fade-in font-sans shadow-2xl relative">
        <div className="absolute top-0 right-0 p-4 text-[10px] font-mono text-accent-yellow flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-accent-yellow animate-pulse" />
          <span>Fase de Onboarding Guiada</span>
        </div>

        {/* Header and Step Indicators */}
        <div className="space-y-4">
          <div className="space-y-1.5 text-center">
            <h3 className="text-xl font-bold text-white font-display">Asistente de Acreditación Vinkupass</h3>
            <p className="text-xs text-text-dim max-w-sm mx-auto leading-relaxed">
              Configura tu identidad visual y canal de retiros reales para entrar al portal activo.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
            <div className={`flex-1 h-1.5 rounded-full ${onboardingStep >= 1 ? "bg-accent-yellow" : "bg-neutral-800"}`} />
            <span className="text-[10px] font-mono text-text-dim shrink-0">Paso {onboardingStep} de 2</span>
            <div className={`flex-1 h-1.5 rounded-full ${onboardingStep >= 2 ? "bg-accent-yellow" : "bg-neutral-800"}`} />
          </div>
        </div>

        <form onSubmit={handleFinishOnboarding} className="space-y-5 text-xs">
          {onboardingStep === 1 ? (
            // PASO 1: Identidad Visual
            <div id="u_step_one_container" className="space-y-4 animate-fade-in">
              <span className="text-[11px] font-mono text-accent-yellow font-bold uppercase tracking-wider block border-b border-border-dark pb-2 mb-2">Paso 1: Identidad Visual Corporativa</span>
              
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Logo de la Universidad</label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLogoOption("default");
                      setLogoPreview("");
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      logoOption === "default" ? "bg-accent-yellow/10 border-accent-yellow text-white" : "bg-black/20 border-border-dark text-text-dim"
                    }`}
                  >
                    Usar Logo Predeterminado ({currentUniDetails.name})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoOption("uploaded")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      logoOption === "uploaded" ? "bg-accent-yellow/10 border-accent-yellow text-white" : "bg-black/20 border-border-dark text-text-dim"
                    }`}
                  >
                    Subir Logo Transparente
                  </button>
                </div>

                {logoOption === "uploaded" && (
                  <div className="border border-dashed border-border-dark rounded-2xl p-6 bg-black/40 text-center space-y-2 relative cursor-pointer hover:border-gray-500 transition-all">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      id="uni_logo_upload_field"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoPreview(file.name);
                          triggerToast(`Archivo logo '${file.name}' reconocido.`, "success");
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-text-dim mx-auto" />
                    <div className="font-bold text-white text-xs">Arrastra y suelta tu archivo aquí</div>
                    <p className="text-[10px] text-text-dim leading-normal">Carga el Logo Oficial de la Universidad (Formato PNG/JPG transparente)</p>
                    {logoPreview && (
                      <div className="p-2 bg-accent-yellow/10 border border-accent-yellow/20 rounded-xl max-w-xs mx-auto text-[10px] font-mono text-accent-yellow">
                        Logo cargado: {logoPreview}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Selecciona el Color Hexadecimal Principal de tu Institución</label>
                <div className="flex items-center gap-4 bg-black/35 border border-border-dark p-3.5 rounded-xl">
                  <input
                    type="color"
                    id="color_picker_field"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <div>
                    <h5 className="font-bold text-white font-mono text-xs">{primaryColor.toUpperCase()}</h5>
                    <p className="text-[10px] text-text-dim">Color vibrante asignado a tus insignias y micro-certificados.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // PASO 2: Cuenta de Retiros
            <div id="u_step_two_container" className="space-y-4 animate-fade-in">
              <span className="text-[11px] font-mono text-accent-yellow font-bold uppercase tracking-wider block border-b border-border-dark pb-2 mb-2">Paso 2: Configuración de Retiros Financieros (Dispersión)</span>
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-text-dim uppercase block">Entidad Bancaria</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-white outline-none focus:border-accent-yellow"
                >
                  <option value="Bancolombia S.A.">Bancolombia S.A.</option>
                  <option value="Banco de Bogotá">Banco de Bogotá</option>
                  <option value="BBVA Colombia">BBVA Colombia</option>
                  <option value="Citibanamex">Citibanamex</option>
                  <option value="Banco Santander">Banco Santander</option>
                  <option value="Banco Itaú">Banco Itaú</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-text-dim uppercase block">Número de Cuenta Bancaria</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="ej. 0953-294021-93"
                  className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-white outline-none focus:border-accent-yellow font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-text-dim uppercase block">Tipo de Cuenta de Destino</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="account_type"
                      checked={bankAccountType === "Ahorros"}
                      onChange={() => setBankAccountType("Ahorros")}
                      className="accent-accent-yellow w-4 h-4"
                    />
                    <span>Ahorros Corporativa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="account_type"
                      checked={bankAccountType === "Corriente"}
                      onChange={() => setBankAccountType("Corriente")}
                      className="accent-accent-yellow w-4 h-4"
                    />
                    <span>Corriente Fiscal</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 bg-black/40 border border-border-dark rounded-xl space-y-1 text-text-dim">
                <h6 className="font-bold text-white text-[10px] uppercase">Cláusula de Dispersión Automática</h6>
                <p className="text-[9px] leading-relaxed">
                  Las liquidaciones se ejecutan semanalmente. Las compras de materias o créditos liquidados se registrarán de forma transparente y con firmas verificadas.
                </p>
              </div>
            </div>
          )}

          {/* Action controls */}
          <div className="pt-3 border-t border-border-dark/60 flex items-center justify-between">
            {onboardingStep === 2 && (
              <button
                type="button"
                onClick={() => setOnboardingStep(1)}
                className="text-text-dim hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                ← Retroceder
              </button>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={isCompletingWizard}
                className="bg-accent-yellow hover:bg-yellow-400 text-black font-extrabold py-3 px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-yellow-500/10 text-xs"
              >
                {isCompletingWizard ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vinculando Cifrado...</span>
                  </>
                ) : onboardingStep === 1 ? (
                  <>
                    <span>Siguiente Paso</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <span>Finalizar Configuración y Entrar al Portal</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW RENDERER C: DASHBOARD SUITE DE UNIVERSIDAD TOTALMENTE OPERATIVO
  // =========================================================================
  return (
    <div id="u_full_dashboard_viewport" className="flex flex-col lg:flex-row gap-6 min-h-[640px] font-sans">
      
      {/* 1. SIDEBAR DE NAVEGACIÓN PERMANENTE */}
      <aside id="u_sidebar_control" className="w-full lg:w-64 bg-sidebar-bg/90 border border-border-dark p-5 rounded-2xl flex flex-col justify-between shrink-0 h-fit lg:sticky lg:top-4 z-20">
        
        <div className="space-y-6">
          {/* Logo Vinkupass y Universidad */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent-yellow text-black flex items-center justify-center font-black text-xs shadow-md">
                V
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-white uppercase block leading-tight font-display">
                  Vinku<span className="text-accent-yellow">pass</span>
                </span>
                <span className="text-[9px] text-text-dim uppercase font-mono block leading-none">Portal Académico</span>
              </div>
            </div>

            {/* Light Indicator dot of session */}
            <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_8px_#10b981]" title="Firma de sesión activa" />
          </div>

          {/* Universidad identificador visual */}
          <div className="p-3 bg-black/40 border border-border-dark rounded-xl flex items-center gap-2.5">
            <div 
              style={{ backgroundColor: currentUniDetails.logoColor }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-extrabold text-xs shrink-0"
            >
              {currentUniDetails.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-white truncate">{currentUniDetails.name}</h4>
              <span className="text-[8px] font-mono text-text-dim block truncate uppercase font-bold">Convenio Conectado</span>
            </div>
          </div>

          {/* MENÚ DE LINKS CON ICONOS */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard de Control", icon: Sliders },
              { id: "catalogo", label: "Mi Catálogo de Cursos", icon: BookOpen },
              { id: "matriculados", label: "Directorio de Matriculados", icon: Users },
              { id: "certificaciones", label: "Centro de Certificaciones", icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isSelected 
                      ? "bg-accent-yellow text-black shadow-md font-extrabold" 
                      : "text-text-dim hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.id === "certificaciones" && enrolledStudents.filter(s => s.status === "Por Certificar").length > 0 && (
                    <span className={`ml-auto w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold ${
                      isSelected ? "bg-black text-accent-yellow" : "bg-accent-yellow text-black animate-pulse"
                    }`}>
                      {enrolledStudents.filter(s => s.status === "Por Certificar").length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer controls inside sidebar */}
        <div className="pt-5 border-t border-border-dark/60 mt-8 space-y-3">
          <div className="p-3 bg-[#070709] rounded-xl border border-border-dark hover:border-gray-700 transition-all">
            <div className="text-[8px] font-mono uppercase text-text-dim font-bold">Banco enlazado</div>
            <div className="text-[10px] text-white font-bold leading-tight mt-1 truncate">{bankName}</div>
            <div className="text-[9px] text-text-dim truncate mt-0.5">Retiro: aut. semanal</div>
          </div>

          <button
            onClick={() => {
              setIsLogged(false);
              triggerToast("Cerraste sesión de forma segura y destruiste token de firma.", "info");
            }}
            className="w-full text-center text-[10px] font-mono text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
          >
            Cerrar Sesión Portal
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE / CONTENT CHANNELS */}
      <main id="u_main_content" className="flex-1 space-y-6">
        
        {/* FILA SUPERIOR DE TARJETAS DE MÉTRICAS (KPIs CLAVE) */}
        <section id="u_kpi_row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          
          {/* Tarjeta 1 - Ingresos Totales */}
          <div className="bg-card-bg border border-border-dark p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-text-dim/20">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-dim uppercase tracking-wider block font-bold">Ingresos Totales Redimidos</span>
              <h3 className="text-xl font-bold font-mono text-white mt-2">
                {(activeUniStats.totalEarnings + (activeUniStats.uploadedCoursesCount * 450)).toLocaleString()} Vinku
              </h3>
            </div>
            <span className="text-[10px] text-text-dim mt-2 block font-medium">Equivalente a ${(activeUniStats.totalEarnings + (activeUniStats.uploadedCoursesCount * 450)).toLocaleString()} USD</span>
          </div>

          {/* Tarjeta 2 - Saldo Líquido */}
          <div className="bg-card-bg border border-border-dark p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-text-dim/20">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-dim uppercase tracking-wider block font-bold">Saldo Pendiente por Retirar</span>
              <h3 className="text-xl font-bold font-mono text-accent-emerald mt-2">
                {liquidBalance.toLocaleString()} Vinku
              </h3>
            </div>
            <button
              onClick={handleLiquidAction}
              disabled={isWithdrawing || liquidBalance <= 0}
              className={`w-full mt-3 py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                liquidBalance > 0 
                  ? "bg-accent-yellow hover:bg-yellow-400 text-black shadow-md shadow-yellow-500/10"
                  : "bg-neutral-900 text-text-dim cursor-not-allowed border border-border-dark"
              }`}
            >
              {isWithdrawing ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Espere...</span>
                </span>
              ) : (
                <span>Solicitar Liquidación</span>
              )}
            </button>
          </div>

          {/* Tarjeta 3 - Alumnos */}
          <div className="bg-card-bg border border-border-dark p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-text-dim/20">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-dim uppercase tracking-wider block font-bold">Estudiantes Matriculados Activos</span>
              <h3 className="text-xl font-bold font-mono text-white mt-2">
                {enrolledStudents.length} Alumnos
              </h3>
            </div>
            <span className="text-[10px] text-text-dim mt-2 block font-medium">Capacidad síncrona: ilimitada</span>
          </div>

          {/* Tarjeta 4 - Catálogo */}
          <div className="bg-card-bg border border-border-dark p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-text-dim/20">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-dim uppercase tracking-wider block font-bold">Asignaturas Modulares Publicadas</span>
              <h3 className="text-xl font-bold font-mono text-white mt-2">
                {activeUniCourses.length || activeUniStats.uploadedCoursesCount} Cursos
              </h3>
            </div>
            <span className="text-[10px] text-text-dim mt-2 block font-medium">Bajo programa de desglose académico</span>
          </div>

        </section>

        {/* -------------------------------------------------------------------
            SUBTAB A: DASHBOARD DE CONTROL (METRICAS & TOP 3)
           ------------------------------------------------------------------- */}
        {activeTab === "dashboard" && (
          <div id="u_tab_dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Left Side: Mock Revenue Chart bar */}
            <div className="lg:col-span-8 bg-card-bg border border-border-dark p-5 md:p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="text-base font-bold text-white font-display">Ingresos Mensuales por Venta Modular de Asignaturas</h4>
                  <p className="text-[11px] text-text-dim leading-relaxed">Métricas calculadas por dispersión de créditos Vinku semanales.</p>
                </div>
                <span className="text-[10px] font-mono text-accent-yellow bg-accent-yellow/10 border border-accent-yellow/20 px-3 py-1 rounded-full uppercase font-bold">
                  Periodo Actual: Primer Semestre 2026
                </span>
              </div>

              {/* STYLISH CUSTOM CHANNELS BAR CHART WITH SVGS */}
              <div className="relative pt-6 h-64 border border-border-dark/60 bg-black/40 rounded-xl p-4 flex items-end justify-between gap-2 md:gap-4 select-none">
                
                {/* Horizontal guide lines */}
                <div className="absolute left-0 right-0 top-1/4 border-b border-border-dark/20 pointer-events-none" />
                <div className="absolute left-0 right-0 top-2/4 border-b border-border-dark/20 pointer-events-none" />
                <div className="absolute left-0 right-0 top-3/4 border-b border-border-dark/20 pointer-events-none" />

                {/* Bars */}
                {[
                  { month: "Enero", val: 5600, percent: "35%", color: "text-accent-yellow bg-accent-yellow" },
                  { month: "Febrero", val: 8900, percent: "55%", color: "text-accent-yellow bg-accent-yellow" },
                  { month: "Marzo", val: 12400, percent: "80%", color: "text-accent-yellow bg-accent-yellow" },
                  { month: "Abril", val: 16500, percent: "100%", color: "text-accent-yellow bg-yellow-400" },
                  { month: "Mayo", val: 14200, percent: "90%", color: "text-accent-yellow bg-accent-yellow" },
                  { month: "Junio", val: 11000, percent: "72%", color: "text-accent-yellow bg-accent-yellow" }
                ].map((item, id) => (
                  <div key={id} className="flex-1 flex flex-col items-center group relative cursor-pointer z-10">
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 bg-[#1b1b22] border border-border-dark text-white px-2 py-1 text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                      USD {item.val.toLocaleString()}
                    </div>
                    {/* Bar */}
                    <div className="w-8 md:w-12 bg-neutral-900 rounded-t-lg overflow-hidden h-44 flex items-end">
                      <div 
                        style={{ height: item.percent }}
                        className={`w-full rounded-t-md transition-all duration-1000 bg-gradient-to-t from-yellow-600 to-accent-yellow group-hover:opacity-85`}
                      />
                    </div>
                    {/* Label */}
                    <span className="text-[10px] font-mono text-text-dim mt-2.5 truncate w-full text-center">{item.month}</span>
                  </div>
                ))}

              </div>

              {/* Extra micro parameters feedback */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-black/30 border border-border-dark/60 rounded-xl text-xs space-y-1">
                  <span className="text-text-dim text-[10px] uppercase font-mono tracking-wide">Tasa de Certificación Ágil</span>
                  <div className="font-extrabold text-white text-sm">96.4% de efectividad</div>
                  <p className="text-[10px] text-text-dim">Egresados con sellos firmados satisfactoriamente.</p>
                </div>
                <div className="p-3.5 bg-black/30 border border-border-dark/60 rounded-xl text-xs space-y-1">
                  <span className="text-text-dim text-[10px] uppercase font-mono tracking-wide">Valor Unitario por Crédito</span>
                  <div className="font-extrabold text-accent-yellow text-sm font-mono">1 CRÉDITO = USD 1.00</div>
                  <p className="text-[10px] text-text-dim">Tratamiento sincrónico descentralizado.</p>
                </div>
              </div>
            </div>

            {/* Right Side: Top 3 courses list */}
            <div className="lg:col-span-4 bg-card-bg border border-border-dark p-5 md:p-6 rounded-2xl h-fit space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white font-display">Top 3 de Cursos más Demandados</h4>
                <p className="text-[10px] text-text-dim leading-relaxed">Las asignaturas con mayor volumen de matrícula corporativa.</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 1, title: "Arquitectura e Integración de Sistemas en la Nube", faculty: "Facultad de Ingeniería", enrolled: 18, profit: "8,100 Vinku", color: "bg-accent-yellow/10 text-accent-yellow" },
                  { id: 2, title: "Desarrollo Fullstack Profesional con React", faculty: "Educación Continuada", enrolled: 14, profit: "8,680 Vinku", color: "bg-accent-emerald/10 text-accent-emerald" },
                  { id: 3, title: "Diplomado en Inteligencia Artificial", faculty: "Sistemas & Computación", enrolled: 12, profit: "13,200 Vinku", color: "bg-blue-500/10 text-blue-400" }
                ].map((tc) => (
                  <div key={tc.id} className="p-3 bg-[#0a0a0e] border border-border-dark rounded-xl space-y-2 hover:border-gray-700 transition-all">
                    <div className="flex items-start justify-between gap-1">
                      <div className="space-y-0.5 min-w-0">
                        <h5 className="font-bold text-white text-xs truncate">{tc.title}</h5>
                        <p className="text-[10px] text-text-dim font-medium">{tc.faculty}</p>
                      </div>
                      <span className="text-[10px] font-mono text-white bg-black/55 py-0.5 px-2 rounded-md border border-border-dark shrink-0">
                        #{tc.id}
                      </span>
                    </div>

                    <div className="border-t border-border-dark/60 pt-2 mt-1.5 flex items-center justify-between text-[10px] font-mono">
                      <div>
                        <span className="text-text-dim">Estudiantes: </span>
                        <strong className="text-white">{tc.enrolled} matriculados</strong>
                      </div>
                      <span className="text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded font-bold">
                        {tc.profit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("catalogo")}
                  className="w-full bg-black border border-border-dark hover:border-accent-yellow text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 hover:text-accent-yellow"
                >
                  <span>Ir a Catálogo CMS</span>
                  <ChevronRight className="w-4 h-4 text-accent-yellow" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------
            SUBTAB B: PORTFOLIO CMS / CATÁLOGO DE CURSOS (CMS COMPLETO)
           ------------------------------------------------------------------- */}
        {activeTab === "catalogo" && (
          <div id="u_tab_catalogo" className="space-y-6 animate-fade-in">
            
            {/* Header control */}
            <div className="bg-[#121216] border border-border-dark p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">Administración de Oferta Unificada</h3>
                <p className="text-xs text-text-dim">Añade o edita con interruptores directos de visibilidad en el marketplace.</p>
              </div>

              <button
                id="create_course_trigger_btn"
                onClick={() => {
                  setEditingCourseId(null);
                  setCourseFormTitle("");
                  setCourseFormProgram("");
                  setCourseFormSkills("");
                  setCourseFormDesc("");
                  setCourseFormCost("450");
                  setCourseFormHours("64");
                  setShowCatalogModal(true);
                  triggerToast("Cargando plantilla de desglose de asignatura.", "info");
                }}
                className="bg-accent-yellow hover:bg-yellow-400 text-black text-xs font-bold py-3 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-yellow-500/10 cursor-pointer self-start sm:self-center transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Nuevo Curso Modular</span>
              </button>
            </div>

            {/* ADVANCED DATA TABLE */}
            <div className="bg-card-bg border border-border-dark rounded-2xl overflow-hidden">
              <div className="p-4 bg-black/20 border-b border-border-dark/60">
                <h4 className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider">Asignaturas Modulares Desagregadas</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-border-dark text-[10px] text-text-dim uppercase tracking-widest font-mono bg-black/25">
                      <th className="p-4 font-bold">Código ID</th>
                      <th className="p-4 font-bold">Título de la Asignatura</th>
                      <th className="p-4 font-bold">Programa Origen</th>
                      <th className="p-4 font-bold">Categoría</th>
                      <th className="p-4 font-bold">Matrícula (Créditos Vinku)</th>
                      <th className="p-4 font-bold text-center">Alumnos Activos</th>
                      <th className="p-4 font-bold text-center">Estado</th>
                      <th className="p-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/30">
                    {/* Map courses or default ones */}
                    {courses.map((cur) => (
                      <tr 
                        key={cur.id} 
                        className="hover:bg-white/5 transition-colors font-mono"
                      >
                        <td className="p-4 font-bold text-text-dim">{cur.id}</td>
                        <td className="p-4 font-bold text-white font-sans max-w-xs">{cur.title}</td>
                        <td className="p-4 text-text-dim font-sans">{cur.university}</td>
                        <td className="p-4 text-white">
                          <span className="text-[10px] bg-black/45 border border-border-dark py-1 px-2.5 rounded-full font-mono font-bold">
                            {cur.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-accent-yellow">{cur.cost} Vinku</td>
                        <td className="p-4 text-center font-bold text-white">
                          {cur.id === "c-1" ? 18 : cur.id === "c-3" ? 14 : 4}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                            Activo
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3 font-sans">
                            {/* Toggle switch for active/pause */}
                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-text-dim">
                              <span className="font-mono text-[9px] uppercase">Visible</span>
                              <input
                                type="checkbox"
                                defaultChecked
                                onChange={() => handleToggleCourseStatus(cur.id, cur.title)}
                                className="sr-only peer"
                              />
                              <div className="relative w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent-yellow peer-checked:after:bg-black" />
                            </label>

                            <button
                              onClick={() => {
                                setEditingCourseId(cur.id);
                                setCourseFormTitle(cur.title);
                                setCourseFormProgram(cur.university);
                                setCourseFormSkills(cur.skills.join(", "));
                                setCourseFormDesc(cur.description);
                                setCourseFormCost(cur.cost.toString());
                                setCourseFormHours(cur.duration);
                                setShowCatalogModal(true);
                              }}
                              className="w-8 h-8 rounded-lg bg-black/40 hover:bg-neutral-800 text-white border border-border-dark flex items-center justify-center cursor-pointer transition-all hover:border-gray-500"
                              title="Editar asignatura"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. FORMULARIO EMERGENTE MODAL DE EDICIÓN O CREACIÓN */}
            {showCatalogModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-[#121216] border border-border-dark p-6 rounded-3xl max-w-xl w-full space-y-4 animate-fade-in text-xs font-sans relative">
                  
                  <div className="flex items-center justify-between border-b border-border-dark pb-3">
                    <h3 className="text-base font-bold text-white font-display">
                      {editingCourseId ? `Editar Asignatura Modular #${editingCourseId}` : "Crear Nuevo Curso Modular de Posgrado/Educación"}
                    </h3>
                    <button
                      onClick={() => setShowCatalogModal(false)}
                      className="text-text-dim hover:text-white p-1 rounded-lg hover:bg-neutral-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCourse} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Título del Curso Modular</label>
                      <input
                        type="text"
                        required
                        value={courseFormTitle}
                        onChange={(e) => setCourseFormTitle(e.target.value)}
                        placeholder="ej. Fundamentos de Inteligencia Artificial Aplicada"
                        className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Programa Académico de Origen</label>
                        <input
                          type="text"
                          required
                          value={courseFormProgram}
                          onChange={(e) => setCourseFormProgram(e.target.value)}
                          placeholder="ej. Especialización en Analítica de Datos"
                          className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block font-mono">Categoría Temática</label>
                        <select
                          value={courseFormCategory}
                          onChange={(e) => setCourseFormCategory(e.target.value)}
                          className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow"
                        >
                          <option value="Ingeniería & Tech">Tecnología (Engineering)</option>
                          <option value="Negocios & Marketing">Negocios & Marketing</option>
                          <option value="Diseño & UX">Diseño & UX</option>
                          <option value="AI & Data Science">AI & Data Science</option>
                          <option value="Habilidades Blandas">Habilidades Blandas</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Costo de la Asignatura (Créditos Vinku)</label>
                        <input
                          type="number"
                          min="50"
                          max="2500"
                          required
                          value={courseFormCost}
                          onChange={(e) => setCourseFormCost(e.target.value)}
                          placeholder="Costo de matrícula e.g. 450"
                          className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Duración (En horas totales)</label>
                        <input
                          type="number"
                          min="10"
                          max="200"
                          required
                          value={courseFormHours}
                          onChange={(e) => setCourseFormHours(e.target.value)}
                          placeholder="e.g. 64"
                          className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow font-mono"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Habilidades Entregadas (Separadas por Comas)</label>
                        <input
                          type="text"
                          value={courseFormSkills}
                          onChange={(e) => setCourseFormSkills(e.target.value)}
                          placeholder="AWS, Docker, Python, REST APIs"
                          className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">Descripción Técnica Extensa</label>
                        <span className="text-[9px] font-mono text-text-dim">{courseFormDesc.length} / 500 caracteres</span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={courseFormDesc}
                        onChange={(e) => setCourseFormDesc(e.target.value)}
                        placeholder="ej. Programa completo para dominar almacenamiento, arquitectura e inyección elástica de sistemas en la nube..."
                        className="w-full bg-[#0a0a0d] border border-border-dark rounded-xl p-3 text-xs text-white outline-none focus:border-accent-yellow"
                      />
                    </div>

                    <div className="pt-3 border-t border-border-dark/60 flex items-center justify-end gap-3 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setShowCatalogModal(false)}
                        className="text-text-dim hover:text-white px-4 py-2 border border-border-dark rounded-xl hover:bg-neutral-900 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-accent-yellow hover:bg-yellow-400 text-black px-6 py-2 rounded-xl transition-all shadow shadow-yellow-500/10 cursor-pointer"
                      >
                        Publicar Asignatura Modular
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            )}

          </div>
        )}

        {/* -------------------------------------------------------------------
            SUBTAB C: DIRECTORIO DE MATRICULADOS
           ------------------------------------------------------------------- */}
        {activeTab === "matriculados" && (
          <div id="u_tab_matriculados" className="space-y-6 animate-fade-in">
            
            {/* Header controls with Search & Filter */}
            <div className="bg-[#121216] border border-border-dark p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display">Directorio de Alumnos Matriculados</h3>
                  <p className="text-xs text-text-dim">Revisa los estudiantes activos, sus progresos académicos e hitos modulares.</p>
                </div>

                <button
                  onClick={handleExportCsv}
                  disabled={isExporting}
                  className="bg-black hover:bg-neutral-900 border border-border-dark text-white hover:border-accent-yellow text-xs font-bold py-3 px-5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow self-start sm:self-center"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-accent-yellow" />}
                  <span>Exportar Directorio (.CSV)</span>
                </button>
              </div>

              {/* Advanced search controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                <div className="md:col-span-5 flex items-center gap-2 bg-[#09090c] border border-border-dark rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-text-dim shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar estudiante por nombre o correo electrónico..."
                    className="bg-transparent text-xs text-white outline-none w-full"
                  />
                </div>

                <div className="md:col-span-4 flex items-center gap-2 bg-[#09090c] border border-border-dark rounded-xl px-3 py-2">
                  <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider">Asignatura:</span>
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none w-full cursor-pointer"
                  >
                    <option value="Todos">Todos los Cursos</option>
                    <option value="Arquitectura e Integración">Arquitectura Cloud</option>
                    <option value="React y Node.js">React & Node.js</option>
                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex items-center gap-2 bg-[#09090c] border border-border-dark rounded-xl px-3 py-2">
                  <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider">Avance:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none w-full cursor-pointer"
                  >
                    <option value="Todos">Todos los Estatus</option>
                    <option value="En Curso">En Curso</option>
                    <option value="Por Certificar">Por Certificar</option>
                    <option value="Completado">Completados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DIRECTORY TABLE LIST */}
            <div className="bg-card-bg border border-border-dark rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-border-dark text-[10px] text-text-dim uppercase tracking-widest font-mono bg-black/25">
                      <th className="p-4">Estudiante</th>
                      <th className="p-4">Correo Electrónico</th>
                      <th className="p-4">Curso Inscrito</th>
                      <th className="p-4">Fecha de Matrícula</th>
                      <th className="p-4">Progreso Académico</th>
                      <th className="p-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/30">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-white/5 transition-all">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-neutral-800 text-text-dim flex items-center justify-center font-bold text-xs uppercase border border-border-dark">
                                {st.name.slice(0, 2)}
                              </div>
                              <span className="font-bold text-white font-sans">{st.name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-text-dim">{st.email}</td>
                          <td className="p-4 font-bold text-white font-sans truncate max-w-xs">{st.courseTitle}</td>
                          <td className="p-4 font-mono text-text-dim">{st.enrollDate}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2.5 font-mono">
                              <div className="w-32 h-1.5 bg-neutral-800 rounded-full overflow-hidden shrink-0">
                                <div 
                                  style={{ width: `${st.progress}%` }}
                                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                                    st.progress === 100 ? "from-accent-emerald to-green-450" : "from-yellow-500 to-accent-yellow"
                                  }`}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-white">{st.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {st.status === "En Curso" && (
                              <span className="text-[9px] font-bold text-white bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full uppercase">
                                En Curso
                              </span>
                            )}
                            {st.status === "Por Certificar" && (
                              <span className="text-[9px] font-bold text-black bg-accent-yellow border border-accent-yellow px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                                Por Certificar
                              </span>
                            )}
                            {st.status === "Completado" && (
                              <span className="text-[9px] font-bold text-accent-emerald bg-accent-emerald/15 border border-accent-emerald/30 px-2.5 py-0.5 rounded-full uppercase">
                                Completado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center bg-[#07070a]/40 border border-dashed border-border-dark text-text-dim">
                          No se encontraron estudiantes correspondientes a los filtros actuales.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------
            SUBTAB D: CENTRO DE CERTIFICACIONES (UPLOAD SUPPORT DRAG-DRAG)
           ------------------------------------------------------------------- */}
        {activeTab === "certificaciones" && (
          <div id="u_tab_certificaciones" className="space-y-6 animate-fade-in font-sans">
            
            <div className="bg-[#121216] border border-border-dark p-6 rounded-2xl space-y-2">
              <h3 className="text-base font-bold text-white font-display">Aprobación de Contenidos & Sello Digital</h3>
              <p className="text-xs text-text-dim leading-relaxed max-w-3xl">
                Valida los entregables y la asistencia teórica de tus matriculados. Carga el soporte PDF oficial para que el Pasaporte Vinkupass del estudiante se estampe de forma inmediata con el Certificado, Firma y Sellos Institucionales.
              </p>
            </div>

            {/* FILTERED LIST (Only 'Por Certificar' state) */}
            <div className="space-y-4">
              {enrolledStudents.filter(s => s.status === "Por Certificar").length > 0 ? (
                enrolledStudents.filter(s => s.status === "Por Certificar").map((student) => {
                  const currentUpload = uploadProgress[student.id];
                  const hasFinishedUpload = currentUpload && currentUpload.percent >= 100;

                  return (
                    <div 
                      key={student.id}
                      className="bg-card-bg border border-border-dark rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-gray-700 transition-all"
                    >
                      {/* Left Block: Course & Student detail */}
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-accent-yellow bg-accent-yellow/10 border border-accent-yellow/20 rounded px-2 py-0.5 font-bold uppercase">
                            Pendiente Sello Académico
                          </span>
                        </div>
                        <h4 className="font-extrabold text-white text-base font-display">{student.courseTitle}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-dim">
                          <div>Estudiante: <strong className="text-white">{student.name}</strong></div>
                          <div>Email: <span className="font-mono">{student.email}</span></div>
                          <div>Matrícula: <strong className="text-white">{student.enrollDate}</strong></div>
                        </div>
                      </div>

                      {/* Center Block: Drag and drop supporting block */}
                      <div className="w-full lg:w-72 shrink-0">
                        {hasFinishedUpload ? (
                          <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/30 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 text-accent-emerald shrink-0" />
                              <div className="min-w-0">
                                <div className="font-bold text-white text-[10px] truncate">{currentUpload.fileName}</div>
                                <span className="text-[8px] font-mono text-accent-emerald uppercase block font-bold">100% Cargado exitoso</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setUploadProgress(prev => {
                                  const c = { ...prev };
                                  delete c[student.id];
                                  return c;
                                });
                                // Reset pdf local status
                                setEnrolledStudents(prev => 
                                  prev.map(st => st.id === student.id ? { ...st, attachedPdfName: undefined } : st)
                                );
                              }}
                              className="text-text-dim hover:text-white font-mono text-[9px] hover:underline"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          // DRAG ZONE COMPONENT
                          <div className="border border-dashed border-border-dark bg-black/35 hover:bg-black/55 hover:border-gray-500 rounded-xl p-3 text-center transition-all cursor-pointer relative">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFakePdfDrop(student.id, file.name);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {currentUpload && currentUpload.percent < 100 ? (
                              <div className="space-y-1 py-1 font-mono">
                                <div className="text-[9px] text-white flex justify-between">
                                  <span>Inyectando archivo...</span>
                                  <span>{currentUpload.percent}%</span>
                                </div>
                                <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                  <div style={{ width: `${currentUpload.percent}%` }} className="h-full bg-accent-yellow transition-all duration-300" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-left">
                                <Upload className="w-5 h-5 text-accent-yellow animate-bounce shrink-0" />
                                <div>
                                  <div className="font-bold text-white text-[10px]">Cargar Certificado PDF</div>
                                  <p className="text-[8px] text-text-dim uppercase leading-none mt-0.5">PDF Oficial de la Universidad</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Block: Emit stamp button */}
                      <div className="shrink-0">
                        <button
                          id={`emit_sello_btn_${student.id}`}
                          onClick={() => handleSellarPasaporte(student)}
                          disabled={certifyingId === student.id || !student.attachedPdfName}
                          className={`w-full lg:w-36 py-3 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider text-center cursor-pointer transition-all ${
                            student.attachedPdfName 
                              ? "bg-accent-emerald hover:bg-emerald-450 text-black shadow-lg shadow-emerald-500/10"
                              : "bg-neutral-900 border border-border-dark text-text-dim cursor-not-allowed"
                          }`}
                        >
                          {certifyingId === student.id ? (
                            <span className="flex items-center justify-center gap-1.5 font-mono">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                              <span>Estampando...</span>
                            </span>
                          ) : (
                            <span>Sellar Pasaporte</span>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-black/25 border border-dashed border-border-dark rounded-3xl space-y-3 opacity-80">
                  <CheckCircle className="w-10 h-10 text-accent-emerald mx-auto animate-pulse" />
                  <h4 className="text-sm font-bold text-white">¡Catálogo Universitario al Día!</h4>
                  <p className="text-xs text-text-dim max-w-sm mx-auto leading-relaxed">
                    No existen alumnos pendientes de sellado criptográfico en este momento. Las insignias se encuentran firmadas e indexadas.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
