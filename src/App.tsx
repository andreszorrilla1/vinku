import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  GraduationCap,
  Award,
  Wallet,
  BookOpen,
  Briefcase,
  Layers,
  Users,
  Compass,
  Calendar,
  Lock,
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  HelpCircle,
  FileCode,
  Map,
  Shield,
  Send,
  Target,
  Sparkles,
  DollarSign,
  TrendingUp,
  Clock,
  Key,
  Database,
  Terminal,
  Activity,
  AlertCircle,
  Globe,
  Building
} from "lucide-react";
import { Course, Student, Employee, UniversityStats, MentorSession, AuthLog, Achievement } from "./types";
import MarketingView from "./components/MarketingView";
import SitemapView from "./components/SitemapView";
import UniversityPortalView from "./components/UniversityPortalView";
import StudentPortalView from "./components/StudentPortalView";
import CorporatePortalView from "./components/CorporatePortalView";
import { useAuth } from "./contexts/AuthContext";
import * as api from "./lib/api";

export default function App() {
  const { user, role, signOut } = useAuth();

  // Navigation states
  const [activeRole, setActiveRole] = useState<"marketing" | "student" | "corporate" | "university" | "architecture">("marketing");
  const [marketingTab, setMarketingTab] = useState<"home" | "b2c" | "b2b" | "universidad" | "auth">("home");
  const [studentTab, setStudentTab] = useState<"pass" | "diag" | "market" | "wallet" | "fellowship" | "portfolio">("pass");
  const [corpTab, setCorpTab] = useState<"dashboard" | "talent" | "wallet" | "diagnosis">("dashboard");
  const [uniTab, setUniTab] = useState<"dashboard" | "catalogo" | "matriculados" | "certificaciones">("dashboard");
  const [archTab, setArchTab] = useState<"sitemap" | "blueprint" | "crypto">("sitemap");

  // Live state from Supabase
  const [courses, setCourses] = useState<Course[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [corporate, setCorporate] = useState<{ budgetLeft: number; employees: Employee[] }>({ budgetLeft: 0, employees: [] });
  const [universities, setUniversities] = useState<UniversityStats[]>([]);
  const [fellowships, setFellowships] = useState<MentorSession[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sub-forms and interactive elements
  const [diagStep, setDiagStep] = useState(1);
  const [diagAnswers, setDiagAnswers] = useState({
    primaryGoal: "",
    secondaryGoal: "",
    technicalExperience: "beginner",
    budgetRange: "medium",
    lengthPreference: "3"
  });
  const [diagResult, setDiagResult] = useState<any>(null);

  // Recharge wallets
  const [rechargeAmt, setRechargeAmt] = useState("300000");
  const [rechargeSource, setRechargeSource] = useState("VinkuCrédito Fácil");

  // Schedule Fellowship
  const [fellowshipForm, setFellowshipForm] = useState({ mentorName: "Ing. Alejandro Cruz", topic: "", dateTime: "Lunes Próximo, 4:00 PM" });
  const [fellowshipSuccess, setFellowshipSuccess] = useState(false);

  // New Student Goal
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalProducts, setNewGoalProducts] = useState("");

  // New University Course Upload
  const [newCourse, setNewCourse] = useState({
    title: "",
    university: "Universidad de los Andes",
    level: "Educación Continua" as any,
    duration: "8 Semanas",
    cost: "400",
    skills: "",
    description: "",
    category: "Ingeniería & Tech"
  });
  const [courseSuccess, setCourseSuccess] = useState(false);

  // Crypto / Auth Console state
  const [authEmail, setAuthEmail] = useState("diana.prince@vinkupass.com");
  const [authPass, setAuthPass] = useState("vinkuSecurePassword123!");
  const [authProvider, setAuthProvider] = useState("google");
  const [authSimResults, setAuthSimResults] = useState<any>(null);
  const [authIsLoading, setAuthIsLoading] = useState(false);

  // General Notification toast representation
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Cargar datos iniciales desde Supabase
  useEffect(() => {
    fetchState();
  }, [user]);

  // Redirigir al portal correcto según el rol autenticado
  useEffect(() => {
    if (!user) {
      setActiveRole("marketing");
    } else if (role === 'student') {
      setActiveRole("student");
    } else if (role === 'corporate_admin') {
      setActiveRole("corporate");
    } else if (role === 'university_admin') {
      setActiveRole("university");
    }
  }, [user, role]);

  const triggerToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchState = async () => {
    setIsLoading(true);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 8000)
    );
    try {
      // Cursos públicos (sin auth requerida)
      const rawCourses = await Promise.race([api.fetchCourses(), timeout]);
      const mappedCourses: Course[] = (rawCourses as any[]).map((c: any) => ({
        id: c.id,
        title: c.title,
        university: c.universities?.name ?? '',
        level: c.level,
        duration: c.duration,
        cost: c.cost_credits,
        skills: c.skills ?? [],
        description: c.description ?? '',
        category: c.category,
      }));
      setCourses(mappedCourses);

      // Universidades aprobadas
      const rawUnis = await api.fetchUniversities();
      const mappedUnis: UniversityStats[] = rawUnis.map((u: any) => ({
        id: u.id,
        name: u.name,
        logo: u.logo_url ?? '',
        uploadedCoursesCount: 0,
        enrolledStudentsCount: 0,
        totalEarnings: u.total_earnings ?? 0,
        certificationsPending: [],
      }));
      setUniversities(mappedUnis);

      // Perfil del usuario autenticado
      if (user) {
        const profile = await api.fetchProfile(user.id);
        if (profile && profile.role === 'student') {
          const [enrollments, stamps, badges, achievements, sessions] = await Promise.all([
            api.fetchEnrollments(user.id),
            api.fetchPassportStamps(user.id),
            api.fetchSkillBadges(user.id),
            api.fetchAchievements(user.id),
            api.fetchMentorSessions(user.id),
          ]);

          const mappedStudent: Student = {
            id: profile.id,
            name: profile.full_name ?? user.email ?? '',
            email: profile.email,
            walletBalance: profile.wallet_balance ?? 0,
            creditApproved: profile.credit_approved ?? 0,
            diagnosed: profile.diagnosed ?? false,
            suggestedRoute: (profile.suggested_route as string[]) ?? [],
            passport: {
              destinations: stamps.map((s: any) => ({
                university: s.universities?.name ?? '',
                stampLogo: s.universities?.logo_url ?? '',
                enrollCount: s.enroll_count,
              })),
              sellos: enrollments.map((e: any) => ({
                courseId: e.course_id,
                courseTitle: e.courses?.title ?? '',
                university: e.courses?.universities?.name ?? '',
                dateApproved: e.completed_at ?? undefined,
                status: e.status as 'Cursando' | 'Certificado',
              })),
              insignias: badges.map((b: any) => ({
                skillName: b.skill_name,
                iconName: b.icon_name ?? '',
                dateEarned: b.earned_at,
              })),
              perfiles: [],
              logros: achievements.map((a: any) => ({
                id: a.id,
                goal: a.goal,
                associatedProducts: a.associated_products ?? [],
                status: a.status as 'Definido' | 'En Progreso' | 'Cumplido',
              })),
            },
          };
          setStudent(mappedStudent);

          const mappedSessions: MentorSession[] = sessions.map((s: any) => ({
            id: s.id,
            mentorName: s.mentor_name,
            topic: s.topic,
            dateTime: s.scheduled_at,
            zoomLink: s.zoom_link ?? '',
          }));
          setFellowships(mappedSessions);
        }

        if (profile && profile.role === 'corporate_admin' && profile.company_id) {
          const [company, employees] = await Promise.all([
            api.fetchCompany(profile.company_id),
            api.fetchEmployees(profile.company_id),
          ]);
          const mappedEmployees: Employee[] = employees.map((e: any) => ({
            id: e.id,
            name: e.name,
            email: e.email,
            role: e.role_title ?? '',
            department: e.department ?? '',
            diagStatus: e.diag_status as any,
            activePath: e.active_path ?? [],
            progress: e.progress_pct,
            assignedBudget: e.assigned_budget,
            suggestedRouteCost: e.suggested_route_cost ?? undefined,
          }));
          setCorporate({
            budgetLeft: company?.wallet_balance ?? 0,
            employees: mappedEmployees,
          });
        }
      }
    } catch (e) {
      console.error(e);
      triggerToast("Error cargando datos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetState = () => {
    setDiagStep(1);
    setDiagResult(null);
    triggerToast("Estado reiniciado", "info");
  };

  // Diagnóstico: algoritmo heurístico local (sin backend)
  const handleDiagnoseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryMap: Record<string, string[]> = {
        Tech:       ['Tecnología'],
        Data:       ['Datos & IA'],
        Marketing:  ['Marketing & Ventas'],
        Design:     ['Diseño & Creatividad'],
        Finance:    ['Finanzas & Inversión'],
        Management: ['Gestión & Liderazgo'],
        Legal:      ['Derecho & Cumplimiento', 'Ciberseguridad'],
        Health:     ['Salud & Bienestar', 'Sostenibilidad'],
        Emprendimiento: ['Emprendimiento'],
      };
      const primaryCats = categoryMap[diagAnswers.primaryGoal] ?? [];
      const secondaryCats = categoryMap[(diagAnswers as any).secondaryGoal] ?? [];
      const targetCats = [...new Set([...primaryCats, ...secondaryCats])];
      const maxCourses = parseInt(diagAnswers.lengthPreference) || 3;
      const filtered = courses
        .filter(c => targetCats.includes(c.category))
        .slice(0, maxCourses);
      const route = filtered.map(c => c.id);
      const label = `Ruta ${diagAnswers.primaryGoal} — ${filtered.length} cursos seleccionados`;

      if (user) {
        await api.saveDiagnosticResult(user.id, route, label);
      }
      setDiagResult({ route: filtered, label });
      setDiagStep(3);
      triggerToast("¡Ruta de aprendizaje recomendada!", "success");
      await fetchState();
    } catch (err) {
      console.error(err);
      triggerToast("Error generando diagnóstico", "error");
    }
  };

  // Matrícula de curso via Supabase
  const handleEnrollCourse = async (courseId: string, _actor: "student" | "corporate" = "student") => {
    if (!user) { triggerToast("Debes iniciar sesión para matricularte", "error"); return; }
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    try {
      await api.enrollCourse(user.id, courseId, course.cost);
      triggerToast("¡Inscripción exitosa! Sello agregado al Campus Pass", "success");
      await fetchState();
    } catch (err: any) {
      triggerToast(err.message ?? "Error en la matrícula", "error");
    }
  };

  // Publicar curso (portal universidad)
  const handleAddCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.cost) {
      triggerToast("Por favor ingresa título y costo", "error");
      return;
    }
    if (!user) { triggerToast("Debes iniciar sesión como universidad", "error"); return; }
    try {
      const profile = await api.fetchProfile(user.id);
      if (!profile?.university_id) { triggerToast("Tu cuenta no está vinculada a una universidad", "error"); return; }
      await api.addCourse({
        university_id: profile.university_id,
        title: newCourse.title,
        description: newCourse.description,
        level: newCourse.level,
        duration: newCourse.duration,
        cost_credits: parseFloat(newCourse.cost),
        skills: newCourse.skills.split(",").map(s => s.trim()).filter(Boolean),
        category: newCourse.category,
        is_active: true,
      });
      setCourseSuccess(true);
      triggerToast("¡Curso publicado exitosamente!", "success");
      setNewCourse({ title: "", university: "Universidad de los Andes", level: "Educación Continua", duration: "8 Semanas", cost: "400", skills: "", description: "", category: "Ingeniería & Tech" });
      setTimeout(() => setCourseSuccess(false), 3000);
      await fetchState();
    } catch (err: any) {
      triggerToast(err.message ?? "Error publicando curso", "error");
    }
  };

  // Certificar matrícula (portal universidad)
  const handleApproveSello = async (_studentId: string, courseId: string, _universityId: string) => {
    try {
      // Buscar el enrollment por course_id
      const { supabase } = await import(/* @vite-ignore */ './lib/supabase');
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('status', 'Cursando')
        .limit(1);
      if (enrollments && enrollments.length > 0) {
        await api.certifyEnrollment(enrollments[0].id);
        triggerToast("¡Sello certificado y sincronizado en el Campus Pass del alumno!", "success");
        await fetchState();
      }
    } catch (err: any) {
      triggerToast(err.message ?? "Error aprobando sello", "error");
    }
  };

  // Recargar billetera estudiante
  const handleWalletRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmt);
    if (!amount || isNaN(amount) || amount <= 0) {
      triggerToast("Ingresa un monto válido", "error");
      return;
    }
    if (!user) { triggerToast("Debes iniciar sesión", "error"); return; }
    try {
      await api.rechargeStudentWallet(user.id, amount);
      triggerToast(`Recarga por $${Number(rechargeAmt).toLocaleString('es-CO')} COP completada`, "success");
      await fetchState();
    } catch (err: any) {
      triggerToast(err.message ?? "Error en recarga", "error");
    }
  };

  // Agregar logro al portafolio
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText || !user) return;
    try {
      await api.addAchievement({
        student_id: user.id,
        goal: newGoalText,
        associated_products: newGoalProducts ? newGoalProducts.split(",").map(p => p.trim()).filter(Boolean) : [],
        status: 'Definido',
      });
      triggerToast("¡Meta agregada al portafolio!", "success");
      setNewGoalText("");
      setNewGoalProducts("");
      await fetchState();
    } catch (err: any) {
      triggerToast(err.message ?? "Error al registrar meta", "error");
    }
  };

  // Agendar sesión de mentoría
  const handleFellowshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fellowshipForm.topic) { triggerToast("Describe el tema a revisar", "error"); return; }
    if (!user) { triggerToast("Debes iniciar sesión", "error"); return; }
    try {
      await api.bookMentorSession({
        student_id: user.id,
        mentor_name: fellowshipForm.mentorName,
        topic: fellowshipForm.topic,
        scheduled_at: new Date(fellowshipForm.dateTime).toISOString(),
        zoom_link: null,
      });
      setFellowshipSuccess(true);
      setFellowshipForm(prev => ({ ...prev, topic: "" }));
      triggerToast("¡Sesión de Fellowship agendada!", "success");
      setTimeout(() => setFellowshipSuccess(false), 3000);
      await fetchState();
    } catch (err: any) {
      triggerToast(err.message ?? "Error al agendar mentoría", "error");
    }
  };

  // Simulación de auth (modo demo — muestra flujo Supabase Auth)
  const handleSimulateAuthentication = async (mode: "login" | "register" | "oauth") => {
    setAuthIsLoading(true);
    try {
      const { useAuth: _u, ...authInfo } = { useAuth: null, mode, provider: authProvider, email: authEmail };
      setAuthSimResults({
        mode,
        provider: mode === 'oauth' ? authProvider : 'email',
        email: authEmail,
        supabaseAuth: 'Supabase Auth — JWT RS256',
        rls: 'Row Level Security activo',
        timestamp: new Date().toISOString(),
      });
      triggerToast("Flujo de autenticación Supabase simulado", "success");
    } catch (err) {
      triggerToast("Error en simulación", "error");
    } finally {
      setAuthIsLoading(false);
    }
  };

  return (
    <div id="vinkupass_app" className="flex flex-col h-screen w-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans overflow-hidden">
      
      {/* GLOBAL TOAST NOTIFICATION CONTAINER */}
      {toastMsg && (
        <div 
          id="toast_notification"
          className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#1A1A1A] text-xs font-bold shadow-[6px_6px_0px_#1A1A1A] animate-fade-in bg-[#FFD000] text-[#1A1A1A]"
        >
          {toastMsg.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-[#6C47FF]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header id="app_topnav" className="shrink-0 bg-[#1A1A1A] border-b-4 border-[#1A1A1A] flex items-center justify-between px-5 py-3 gap-4 z-20">

        {/* VinkU Brand Logo */}
        <div className="flex items-center gap-3 select-none shrink-0">
          {/* Logo: "Vink" + stacked U square */}
          <div className="flex items-center gap-0 leading-none">
            <span className="font-display font-extrabold text-white text-2xl tracking-tight leading-none">Vink</span>
            <div className="relative ml-0.5" style={{ width: 30, height: 30 }}>
              {/* shadow square */}
              <div className="absolute bg-[#FFD000] border-2 border-[#1A1A1A]" style={{ width: 26, height: 26, top: 4, left: 4 }} />
              {/* front square */}
              <div className="absolute bg-[#FFD000] border-2 border-[#1A1A1A] flex items-center justify-center" style={{ width: 26, height: 26, top: 0, left: 0 }}>
                <span className="font-display font-extrabold text-[#1A1A1A] text-base leading-none">U</span>
              </div>
            </div>
          </div>
          <div className="border-l-2 border-white/20 pl-3 leading-tight">
            <div className="font-display font-extrabold text-white text-sm leading-none">Campus Pass</div>
            <div className="text-[10px] font-bold text-[#FFD000] leading-tight mt-0.5 uppercase tracking-wider">by VinkU</div>
          </div>
        </div>

        {/* Context navigation tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 justify-center">
          {activeRole === "marketing" && [
            { id: "home", label: "Inicio" },
            { id: "b2c", label: "Para Personas" },
            { id: "b2b", label: "Para Empresas" },
            { id: "universidad", label: "Universidades" },
          ].map(tab => (
            <button
              key={tab.id}
              id={`marketing_tab_${tab.id}`}
              onClick={() => setMarketingTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border-2 whitespace-nowrap transition-all cursor-pointer ${
                marketingTab === tab.id
                  ? "bg-[#FFD000] text-[#1A1A1A] border-[#FFD000] shadow-[3px_3px_0px_rgba(255,255,255,0.3)]"
                  : "text-white/70 border-transparent hover:text-white hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {activeRole === "student" && (
            [
              { id: "pass", label: "Pasaporte", Icon: Award },
              { id: "diag", label: "Diagnóstico", Icon: Compass },
              { id: "market", label: "Marketplace", Icon: BookOpen },
              { id: "wallet", label: "Billetera", Icon: Wallet },
              { id: "fellowship", label: "Fellowship", Icon: Calendar },
              { id: "portfolio", label: "Portafolio", Icon: Briefcase },
            ] as Array<{ id: string; label: string; Icon: React.ComponentType<{ className?: string }> }>
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`student_tab_${id}`}
              onClick={() => setStudentTab(id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 whitespace-nowrap transition-all cursor-pointer ${
                studentTab === id
                  ? "bg-[#FFD000] text-[#1A1A1A] border-[#FFD000] shadow-[3px_3px_0px_rgba(255,255,255,0.3)]"
                  : "text-white/70 border-transparent hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}

          {activeRole === "corporate" && (
            [
              { id: "dashboard", label: "Dashboard", Icon: TrendingUp },
              { id: "talent", label: "Talento", Icon: Users },
              { id: "wallet", label: "Billetera", Icon: Wallet },
              { id: "diagnosis", label: "Diagnóstico", Icon: Compass },
            ] as Array<{ id: string; label: string; Icon: React.ComponentType<{ className?: string }> }>
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`corp_tab_${id}`}
              onClick={() => setCorpTab(id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 whitespace-nowrap transition-all cursor-pointer ${
                corpTab === id
                  ? "bg-[#FFD000] text-[#1A1A1A] border-[#FFD000] shadow-[3px_3px_0px_rgba(255,255,255,0.3)]"
                  : "text-white/70 border-transparent hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          {activeRole === "university" && (
            [
              { id: "dashboard", label: "Dashboard", Icon: TrendingUp },
              { id: "catalogo", label: "Catálogo", Icon: BookOpen },
              { id: "matriculados", label: "Matriculados", Icon: Users },
              { id: "certificaciones", label: "Certificaciones", Icon: Award },
            ] as Array<{ id: string; label: string; Icon: React.ComponentType<{ className?: string }> }>
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`uni_tab_${id}`}
              onClick={() => setUniTab(id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 whitespace-nowrap transition-all cursor-pointer ${
                uniTab === id
                  ? "bg-[#FFD000] text-[#1A1A1A] border-[#FFD000] shadow-[3px_3px_0px_rgba(255,255,255,0.3)]"
                  : "text-white/70 border-transparent hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Right side: user info + cerrar sesión / botón login */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#6C47FF] border-2 border-white/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {(user.email ?? "U")[0].toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-xs font-bold text-white max-w-[130px] truncate">{user.email}</span>
                  <span className="text-[10px] text-[#FFD000] font-mono uppercase">
                    {role === 'student' ? 'Estudiante' : role === 'corporate_admin' ? 'Empresa' : role === 'university_admin' ? 'Universidad' : role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 text-[11px] font-bold text-white/60 hover:text-white border border-white/20 hover:border-white/50 rounded-lg transition-all cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Demo role switcher — solo en desarrollo */}
              {import.meta.env.DEV && (
              <div className="hidden md:flex items-center gap-1 border border-white/10 rounded-lg p-1">
                <button id="role_is_marketing" onClick={() => setActiveRole("marketing")}
                  className={`px-2 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${activeRole === "marketing" ? "bg-[#FFD000] text-[#1A1A1A]" : "text-white/50 hover:text-white"}`}>
                  Público
                </button>
                <button id="role_is_student" onClick={() => setActiveRole("student")}
                  className={`px-2 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${activeRole === "student" ? "bg-[#FFD000] text-[#1A1A1A]" : "text-white/50 hover:text-white"}`}>
                  Est.
                </button>
                <button id="role_is_corporate" onClick={() => setActiveRole("corporate")}
                  className={`px-2 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${activeRole === "corporate" ? "bg-[#FFD000] text-[#1A1A1A]" : "text-white/50 hover:text-white"}`}>
                  Corp.
                </button>
                <button id="role_is_university" onClick={() => setActiveRole("university")}
                  className={`px-2 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${activeRole === "university" ? "bg-[#FFD000] text-[#1A1A1A]" : "text-white/50 hover:text-white"}`}>
                  Uni.
                </button>
              </div>
              )}
              <button
                onClick={() => { setActiveRole("marketing"); setMarketingTab("auth"); }}
                className="px-4 py-2 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold text-xs rounded-lg border-2 border-[#FFD000] shadow-[3px_3px_0px_rgba(255,208,0,0.4)] hover:shadow-[5px_5px_0px_rgba(255,208,0,0.4)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all whitespace-nowrap cursor-pointer"
              >
                Iniciar sesión →
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT VIEWPORT */}
      <main id="app_viewport" className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">

        {/* CONTAINER FOR ACTIVE LAYOUT */}
        <section id="main_content_area" className="flex-1 overflow-y-auto p-8 no-scrollbar relative bg-[#FAFAFA]">
          
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#FAFAFA]">
              <RefreshCw className="w-8 h-8 text-[#6C47FF] animate-spin" />
              <p className="text-sm text-[#1A1A1A] font-mono font-bold">Iniciando Ecosistema Campus Pass...</p>
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              
              {/* ========================================================== */}
              {/*                    0. MARKETING & ONBOARDING VIEW          */}
              {/* ========================================================== */}
              {activeRole === "marketing" && (
                <MarketingView 
                  courses={courses}
                  setActiveRole={setActiveRole}
                  setStudentTab={setStudentTab}
                  setCorpTab={setCorpTab}
                  setMarketingTab={setMarketingTab}
                  marketingTab={marketingTab}
                  handleEnrollCourse={handleEnrollCourse}
                  triggerToast={triggerToast}
                />
              )}

              {/* ========================================================== */}
              {/*                    1. ESTUDIANTE VIEW                      */}
              {/* ========================================================== */}
              {activeRole === "student" && !user && (
                <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in">
                  <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] rounded-2xl p-8 max-w-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] border-4 border-[#FFD000] flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-7 h-7 text-[#FFD000]" />
                    </div>
                    <h2 className="font-display font-extrabold text-[#1A1A1A] text-xl mb-2">Portal Estudiantil</h2>
                    <p className="text-sm text-[#1A1A1A]/70 mb-5">Inicia sesión o regístrate para acceder al portal estudiantil.</p>
                    <button
                      onClick={() => { setActiveRole("marketing"); setMarketingTab("auth"); }}
                      className="w-full py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] hover:shadow-[6px_6px_0px_0px_#6C47FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm"
                    >
                      Acceder / Registrarse →
                    </button>
                  </div>
                </div>
              )}
              {activeRole === "student" && user && !student && (
                <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in">
                  <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] rounded-2xl p-8 max-w-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] border-4 border-[#FFD000] flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-7 h-7 text-[#FFD000]" />
                    </div>
                    <h2 className="font-display font-extrabold text-[#1A1A1A] text-xl mb-2">Inicia sesión para continuar</h2>
                    <p className="text-sm text-[#1A1A1A]/70 mb-5">Accede con tu cuenta de Campus Pass para ver tu pasaporte, cursos y diagnóstico personalizado.</p>
                    <button
                      onClick={() => { setActiveRole("marketing"); setMarketingTab("auth"); }}
                      className="w-full py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] hover:shadow-[6px_6px_0px_0px_#6C47FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm"
                    >
                      Iniciar sesión →
                    </button>
                  </div>
                </div>
              )}
              {activeRole === "student" && student && (
                <StudentPortalView
                  student={student}
                  courses={courses}
                  universities={universities}
                  studentTab={studentTab}
                  setStudentTab={setStudentTab}
                  onDiagnoseSubmit={handleDiagnoseSubmit}
                  onEnrollCourse={handleEnrollCourse}
                  onWalletRecharge={handleWalletRechargeSubmit}
                  onAddGoal={handleAddGoal}
                  onBookFellowship={handleFellowshipSubmit}
                  rechargeAmt={rechargeAmt}
                  setRechargeAmt={setRechargeAmt}
                  rechargeSource={rechargeSource}
                  setRechargeSource={setRechargeSource}
                  fellowshipForm={fellowshipForm}
                  setFellowshipForm={setFellowshipForm}
                  newGoalText={newGoalText}
                  setNewGoalText={setNewGoalText}
                  newGoalProducts={newGoalProducts}
                  setNewGoalProducts={setNewGoalProducts}
                  diagAnswers={diagAnswers}
                  setDiagAnswers={setDiagAnswers}
                  triggerToast={triggerToast}
                  fetchState={fetchState}
                />
              )}


              {/* ========================================================== */}
              {/*                    2. CORPORATIVO VIEW                     */}
              {/* ========================================================== */}
              {activeRole === "corporate" && (
                <div id="corporate_view_panel" className="space-y-8 animate-fade-in">
                  <CorporatePortalView
                    corporate={corporate}
                    courses={courses}
                    corpTab={corpTab}
                    setCorpTab={setCorpTab}
                    triggerToast={triggerToast}
                    fetchState={fetchState}
                  />
                </div>
              )}

              {/* ========================================================== */}
              {/*                    3. UNIVERSIDAD VIEW                     */}
              {/* ========================================================== */}
              {activeRole === "university" && (
                <div id="university_view_panel" className="space-y-8 animate-fade-in">
                  <UniversityPortalView
                    courses={courses}
                    universities={universities}
                    uniTab={uniTab}
                    setUniTab={setUniTab}
                    onCourseAdded={fetchState}
                    onCertifyApprove={handleApproveSello}
                    triggerToast={triggerToast}
                    fetchState={fetchState}
                  />
                </div>
              )}

              {/* ========================================================== */}
              {/*           4. ARCHITECTURE & SITEMAP SAAS VIEW             */}
              {/* ========================================================== */}
              {activeRole === "architecture" && (
                <div id="architecture_view_panel" className="space-y-8 animate-fade-in">
                  
                  {/* Category switcher inside tab */}
                  <div className="flex border-b border-border-dark/60 pb-1.5 text-xs font-semibold gap-4">
                    <button
                      id="arch_subtab_sitemap"
                      onClick={() => setArchTab("sitemap")}
                      className={`pb-2.5 transition-all relative cursor-pointer ${
                        archTab === "sitemap" ? "text-accent-violet font-bold font-display" : "text-text-dim hover:text-white"
                      }`}
                    >
                      <span>MAPA DEL SITIO SAAS (Sitemap MVP)</span>
                      {archTab === "sitemap" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-violet rounded-full" />}
                    </button>
                    <button
                      id="arch_subtab_blueprint"
                      onClick={() => setArchTab("blueprint")}
                      className={`pb-2.5 transition-all relative cursor-pointer ${
                        archTab === "blueprint" ? "text-accent-violet font-bold font-display" : "text-text-dim hover:text-white"
                      }`}
                    >
                      <span>ESQUEMA DE ARQUITECTURA NODE.JS</span>
                      {archTab === "blueprint" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-violet rounded-full" />}
                    </button>
                    <button
                      id="arch_subtab_crypto"
                      onClick={() => setArchTab("crypto")}
                      className={`pb-2.5 transition-all relative cursor-pointer ${
                        archTab === "crypto" ? "text-accent-violet font-bold font-display" : "text-text-dim hover:text-white"
                      }`}
                    >
                      <span>MÓDULO CRIPTOGRÁFICO & JWT CONSOLE (AUTH)</span>
                      {archTab === "crypto" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-violet rounded-full" />}
                    </button>
                  </div>

                  {/* SUBTAB 4A: MAPA DEL SITIO SAAS (SITEMAP) */}
                  {archTab === "sitemap" && (
                    <SitemapView 
                      onSelectRole={(role, tab) => {
                        setActiveRole(role as any);
                        if (role === "student" && tab) setStudentTab(tab as any);
                        if (role === "corporate" && tab) setCorpTab(tab as any);
                        if (role === "university" && tab) setUniTab(tab as any);
                        if (role === "marketing" && tab) setMarketingTab(tab as any);
                      }}
                    />
                  )}

                  {/* SUBTAB 4B: BLUEPRINT ARQUITECTURA DETALLADO */}
                  {archTab === "blueprint" && (
                    <div id="arch_tab_blueprint_content" className="space-y-8 animate-fade-in text-sans text-xs">
                      
                      {/* Structure introduction */}
                      <div className="bg-card-bg border border-border-dark rounded-xl p-5 space-y-3">
                        <h3 className="text-base font-bold text-white font-display">Arquitectura del Backend Modular SaaS (Node.js + Express.js)</h3>
                        <p className="text-xs text-text-dim leading-relaxed">
                          Diseño técnico enfocado en alta disponibilidad para conectar las tres fuerzas de Campus Pass. Presenta patrones desacoplados de ruteo, middleware, seguridad robusta y estrategia de base de datos relacional híbrida.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        
                        {/* Structure Folder mapping */}
                        <div className="bg-card-bg border border-border-dark rounded-xl p-5">
                          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 font-display uppercase tracking-wide">
                            <FileCode className="w-4 h-4 text-accent-violet" />
                            <span>Carpetería Sugerida en el Servidor</span>
                          </h4>
                          
                          <pre className="bg-[#0b0b0f] p-4 rounded-lg border border-border-dark leading-relaxed font-mono text-[11px] text-zinc-300 block max-h-[380px] overflow-auto select-text">
{`vinkupass-backend/
├── src/
│   ├── config/             # Configuración de base de datos y llaves
│   │   ├── db.ts           # Cliente PostgreSQL con Prisma/Drizzle
│   │   └── passport-jwt.ts # Estrategia Passport.js para control
│   ├── controllers/        # Controladores lógicos (Business logic)
│   │   ├── auth.controller.ts
│   │   ├── course.controller.ts
│   │   └── passport.controller.ts
│   ├── middleware/         # Validadores globales & CORS
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/             # Enrutamiento de endpoints versionado v1
│   │   ├── api.routes.ts
│   │   └── vinkupass.routes.ts
│   └── app.ts              # Inicializador de Express.js y bindings
├── package.json            # Scripts de tsx, esbuild bundling
├── tsconfig.json           # Transpila typescript estrictamente
└── .env                    # Secretos de producción (DATABASE_URL, JWT_SECRET)`}
                          </pre>
                        </div>

                        {/* Database and Integration Guide */}
                        <div className="bg-card-bg border border-border-dark rounded-xl p-5 space-y-4">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2 font-display uppercase tracking-wide">
                            <Database className="w-4 h-4 text-accent-violet" />
                            <span>Integración Base de Datos (PostgreSQL)</span>
                          </h4>
                          
                          <p className="text-xs text-text-dim leading-relaxed">
                            Proponemos **PostgreSQL** por su robustez relacional innata en el manejo de transacciones complejas de pasaportes, sellos acumulativos de múltiples universidades y billeteras de crédito corporativos con restricción de llave foránea.
                          </p>

                          <div className="#0b0b0f text-zinc-300 p-4 rounded-xl bg-[#0b0b0f] border border-border-dark font-mono text-[10px] leading-relaxed">
                            <strong className="text-accent-violet font-semibold leading-none mb-1 block">ESQUEMA DE TABLAS PRINCIPALES (POSTGRES):</strong>
                            <div className="space-y-1.5 mt-2">
                              <div>• <span className="text-white">user_accounts</span>: id, email, password_hash, role_claim (Student/Corp/Uni)</div>
                              <div>• <span className="text-white">students_passport</span>: id, user_id, status (Active), suggested_route[]</div>
                              <div>• <span className="text-white">courses_portfolio</span>: id, title, university_id, level, fee, skills_badge</div>
                              <div>• <span className="text-white">stamps_ledger</span>: id, student_id, course_id, approved_date, certified_status</div>
                              <div>• <span className="text-white">credit_wallet</span>: id, profile_owner_id, cached_balance, credit_credit_approved</div>
                            </div>
                          </div>

                          <div className="p-3.5 bg-accent-violet/10 border border-accent-violet/20 rounded-xl">
                            <h5 className="font-bold text-white text-[12px] mb-1 leading-snug">Rendimiento e Índices</h5>
                            <p className="text-text-dim text-[11px] leading-relaxed">
                              Configurar un índice B-Tree compuesto en <code className="text-accent-violet font-mono font-medium">stamps_ledger(student_id, course_id)</code> reduce el costo algorítmico de validar repeticiones a O(log n).
                            </p>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* SUBTAB 4C: CRIPTOGRAFIA Y CONSOLE DE AUTH (SIMULADOR) */}
                  {archTab === "crypto" && (
                    <div id="arch_tab_crypto_content" className="space-y-8 animate-fade-in text-sans text-xs">
                      
                      <div className="bg-card-bg border border-border-dark rounded-xl p-5">
                        <h3 className="text-base font-bold text-white font-display mb-1">Módulo de Autenticación Criptográfica & JWT Sandbox</h3>
                        <p className="text-xs text-text-dim leading-relaxed">
                          Prueba en tiempo real cómo el backend de Express.js genera contraseñas seguras aplicando el algoritmo Blowfish (BCrypt) con salting aleatorio, y firma JWTs (JSON Web Tokens) estructurados para control de sesiones.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Interactive Hashing form and tools */}
                        <div className="bg-card-bg border border-border-dark rounded-xl p-5 space-y-4">
                          <h4 className="text-sm font-bold text-white font-display uppercase tracking-wide flex items-center gap-1.5">
                            <Key className="w-4 h-4 text-accent-violet" />
                            <span>Sandbox de Credenciales</span>
                          </h4>

                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-mono text-text-dim block mb-1 uppercase tracking-wide">Correo de la Cuenta</label>
                              <input
                                type="email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                className="w-full bg-brand-bg border border-border-dark rounded-lg text-xs text-white p-3 outline-none focus:border-accent-violet text-ellipsis"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-mono text-text-dim block mb-1 uppercase tracking-wide font-sans">Contraseña en Texto Plano (Input)</label>
                              <input
                                type="text"
                                value={authPass}
                                onChange={(e) => setAuthPass(e.target.value)}
                                className="w-full bg-brand-bg border border-border-dark rounded-lg text-xs text-white font-mono p-3 outline-none focus:border-accent-violet text-ellipsis"
                              />
                            </div>

                            <div className="border-t border-border-dark/60 pt-4 mt-4 space-y-3">
                              <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide block">Simular Lógica en el Servidor:</span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                  id="btn_sim_bcrypt_register"
                                  onClick={() => handleSimulateAuthentication("register")}
                                  disabled={authIsLoading}
                                  className="bg-[#24243a] border border-[#3e4070] hover:border-accent-violet text-white font-bold p-2.5 rounded-lg text-xs transition-all cursor-pointer text-center"
                                >
                                  Crypto Registro (BCrypt Hash)
                                </button>
                                <button
                                  id="btn_sim_bcrypt_login"
                                  onClick={() => handleSimulateAuthentication("login")}
                                  disabled={authIsLoading}
                                  className="bg-accent-violet hover:bg-[#5f63eb] text-black font-bold p-2.5 rounded-lg text-xs transition-all cursor-pointer text-center"
                                >
                                  Crypto Login (JWT Verify)
                                </button>
                              </div>

                              <div className="border-t border-border-dark/60 pt-4">
                                <label className="text-[10px] font-mono text-text-dim block mb-2 uppercase tracking-wide">Simular Social OAuth 2.0 Integration</label>
                                <div className="flex gap-2">
                                  <select
                                    value={authProvider}
                                    onChange={(e) => setAuthProvider(e.target.value)}
                                    className="bg-brand-bg border border-border-dark text-xs text-white rounded-lg p-2 outline-none focus:border-accent-violet shrink-0"
                                  >
                                    <option value="google">Google Cloud Auth</option>
                                    <option value="github">GitHub OAuth v3</option>
                                  </select>
                                  <button
                                    id="btn_sim_auth_oauth"
                                    onClick={() => handleSimulateAuthentication("oauth")}
                                    disabled={authIsLoading}
                                    className="bg-[#1b2b24] border border-accent-emerald/30 hover:border-accent-emerald text-accent-emerald font-bold p-2.5 rounded-lg text-xs transition-all flex-1 cursor-pointer text-center"
                                  >
                                    Autenticar Con Red Social
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Cryptographic telemetry simulation console output */}
                        <div className="bg-[#0b0b0f] border border-border-dark rounded-xl p-5 flex flex-col justify-between font-mono text-[11px] leading-relaxed max-h-[480px] lg:max-h-none overflow-y-auto no-scrollbar">
                          <div>
                            <div className="flex items-center justify-between pb-3 border-b border-border-dark/40 mb-3 select-none">
                              <span className="text-text-dim font-bold text-[10px] uppercase">Telemetry Encrypted Monitor</span>
                              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse shrink-0" />
                            </div>

                            {authSimResults ? (
                              <div className="space-y-4 text-zinc-300">
                                <div>
                                  <span className="text-accent-emerald font-bold block text-[10px] uppercase">1. PASSWORD ROUNDS (BLOWFISH WORKFACTOR 12):</span>
                                  <div className="bg-brand-bg/60 p-2.5 rounded border border-border-dark/50 shadow overflow-x-auto whitespace-pre leading-relaxed mt-1">
                                    Salt:   {authSimResults.generatedSalt} <br />
                                    Digest: {authSimResults.resultingHash}
                                  </div>
                                </div>

                                <div>
                                  <span className="text-accent-violet font-bold block text-[10px] uppercase">2. SIGNED SESSION JWT (HMAC-SHA256):</span>
                                  <div className="bg-brand-bg/60 p-2.5 rounded border border-border-dark/50 shadow text-ellipsis overflow-hidden mt-1 text-white block">
                                    {authSimResults.jwt}
                                  </div>
                                </div>

                                <div>
                                  <span className="text-amber-400 font-bold block text-[10px] uppercase">3. DECODED CLAIMS PAYLOAD:</span>
                                  <pre className="bg-brand-bg/60 p-2.5 rounded border border-border-dark/50 shadow overflow-x-auto mt-1 leading-relaxed">
                                    {JSON.stringify(authSimResults.payloadDecoded, null, 2)}
                                  </pre>
                                </div>

                                <div className="text-text-dim border-t border-border-dark/60 pt-3 mt-2 font-sans text-xs leading-relaxed">
                                  <strong>Explicación:</strong> {authSimResults.explanation}
                                </div>
                              </div>
                            ) : (
                              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-border-dark/60 rounded-xl text-center text-text-dim italic">
                                <Terminal className="w-6 h-6 text-text-dim/60 mb-2 animate-pulse" />
                                Awaiting cryptographic trace triggers...
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t border-border-dark/60 pt-3 mt-4">
                            <span className="text-text-dim block text-[10px] uppercase font-mono tracking-wider mb-2">Bitácora de Eventos de Seguridad:</span>
                            <div className="space-y-1.5 max-h-[120px] overflow-y-auto no-scrollbar leading-snug">
                              {authLogs.slice(0, 4).map((log, i) => (
                                <div key={i} className="text-[10px] flex gap-1.5 border-b border-border-dark/30 pb-1.5 last:border-0">
                                  <span className="text-accent-violet shrink-0">[{log.timestamp}]</span>
                                  <span className="text-amber-400 font-bold shrink-0">{log.type}:</span>
                                  <span className="text-zinc-400 truncate text-ellipsis block">{log.payload}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}
