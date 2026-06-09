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
  const { user, role } = useAuth();

  // Navigation states
  const [activeRole, setActiveRole] = useState<"marketing" | "student" | "corporate" | "university" | "architecture">("marketing");
  const [marketingTab, setMarketingTab] = useState<"home" | "b2c" | "b2b" | "universidad" | "auth">("b2c");
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
    primaryGoal: "Engineering",
    technicalExperience: "beginner",
    budgetRange: "medium",
    lengthPreference: "3"
  });
  const [diagResult, setDiagResult] = useState<any>(null);

  // Recharge wallets
  const [rechargeAmt, setRechargeAmt] = useState("300");
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
        Engineering: ['Tecnología', 'Ingeniería & Tech'],
        Marketing: ['Marketing'],
        AI: ['Datos', 'Tecnología'],
        Design: ['Diseño', 'Tecnología'],
        Sustainability: ['Gestión'],
        Cybersecurity: ['Tecnología'],
      };
      const targetCats = categoryMap[diagAnswers.primaryGoal] ?? [];
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
            { id: "b2c", label: "Para Personas" },
            { id: "b2b", label: "Para Empresas" },
            { id: "universidad", label: "Universidades" },
            { id: "auth", label: "Acceso" },
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

        {/* Right side: demo role picker (hidden when authenticated) + auth button */}
        <div className="flex items-center gap-2 shrink-0">
          {!user && (
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
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#6C47FF] border-2 border-white/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {(user.email ?? "U")[0].toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white/80 hidden lg:block max-w-[120px] truncate">{user.email}</span>
            </div>
          ) : (
            <button
              onClick={() => { setActiveRole("marketing"); setMarketingTab("auth"); }}
              className="px-4 py-2 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold text-xs rounded-lg border-2 border-[#FFD000] shadow-[3px_3px_0px_rgba(255,208,0,0.4)] hover:shadow-[5px_5px_0px_rgba(255,208,0,0.4)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all whitespace-nowrap cursor-pointer"
            >
              Iniciar sesión →
            </button>
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
              {activeRole === "student" && !student && (
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

              {false && activeRole === "student" && (
                <>
                  {/* TAB 1A: PASAPORTE VINKUPASS */}
                  {studentTab === "pass" && student && (
                    <div id="tab_student_passport" className="space-y-8">
                      
                      {/* PASSPORT PHYSICAL CARD REPRESENTATION */}
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        
                        <div className="xl:col-span-2 passport-glow rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-violet/5 rounded-full blur-3xl pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-emerald/5 rounded-full blur-3xl pointer-events-none" />
                          
                          {/* Passport Top Banner */}
                          <div className="flex items-start justify-between border-b border-white/10 pb-6 mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-full border-2 border-accent-violet p-1 flex items-center justify-center bg-[#151522]">
                                <Users className="w-7 h-7 text-accent-violet" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider">{student.name}</h3>
                                <div className="text-[10px] font-mono font-medium text-accent-violet">PASAPORTE EDUCATIVO VINKUPASS</div>
                                <div className="text-xs text-text-dim">{student.email}</div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-[10px] font-mono text-text-dim">ID PASAPORTE</div>
                              <div className="font-mono text-sm font-bold text-white">{student.id}</div>
                              <div className="text-[10px] font-mono text-accent-emerald mt-1">EMITIDO POR NEOCLUSTER</div>
                            </div>
                          </div>

                          {/* 1. DESTINOS: Universidades donde cursa cursa */}
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="w-4 h-4 text-accent-violet" />
                              <span className="text-[11px] font-mono font-semibold text-text-dim uppercase tracking-wider">Destinos Universitarios Sincronizados (Sellados)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {student.passport.destinations.map((dest, i) => (
                                <div key={i} className="passport-stamp-glow bg-black/40 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                  <div className="w-8 h-8 rounded-full bg-[#1b342b] flex items-center justify-center font-bold text-xs text-accent-emerald mb-1">
                                    ✓
                                  </div>
                                  <div className="text-[11px] font-bold text-white leading-tight font-display">{dest.university}</div>
                                  <div className="text-[9px] font-mono text-text-dim mt-1 uppercase tracking-wide">{dest.enrollCount} Cursos</div>
                                </div>
                              ))}
                              {/* Empty slot stamp guide */}
                              <div className="border border-dashed border-border-dark bg-[#0a0a0d] rounded-xl p-3 flex flex-col items-center justify-center text-center opacity-40">
                                <span className="text-xl font-light text-text-dim">+</span>
                                <div className="text-[9px] font-mono text-text-dim uppercase">Próximo Sello</div>
                              </div>
                            </div>
                          </div>

                          {/* 2. LOS SELLOS: Cursos Cursando / Aprobados */}
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2.5">
                              <Award className="w-4 h-4 text-accent-violet" />
                              <span className="text-[11px] font-mono font-semibold text-text-dim uppercase tracking-wider">Tus Sellos de Formación</span>
                            </div>
                            <div className="space-y-2">
                              {student.passport.sellos.map((sello, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-white/5 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${sello.status === "Certificado" ? "bg-accent-emerald" : "bg-amber-400"}`} />
                                    <div>
                                      <span className="font-bold text-white">{sello.courseTitle}</span>
                                      <span className="mx-2 text-[10px] text-text-dim">|</span>
                                      <span className="text-text-dim text-[11px]">{sello.university}</span>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                                    sello.status === "Certificado" 
                                      ? "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20" 
                                      : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                                  }`}>
                                    {sello.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3. INSIGNIAS Y HABILIDADES */}
                          <div>
                            <div className="flex items-center gap-2 mb-2.5">
                              <Sparkles className="w-4 h-4 text-accent-violet" />
                              <span className="text-[11px] font-mono font-semibold text-text-dim uppercase tracking-wider">Habilidades Desarrolladas (Insignias)</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {student.passport.insignias.map((ins, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-accent-violet/10 to-indigo-950/20 border border-accent-violet/30 rounded-full text-[10px] text-indigo-200">
                                  <Award className="w-3 h-3 text-accent-violet" />
                                  <span className="font-bold">{ins.skillName}</span>
                                </div>
                              ))}
                              {student.passport.insignias.length === 0 && (
                                <div className="text-[11px] text-text-dim font-medium italic">
                                  Completa y aprueba un curso para desbloquear insignias de habilidades.
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* PANEL DE PERFILES CON SALIDA LABORAL + META PROFESIONAL */}
                        <div className="space-y-6">
                          
                          {/* 4. PERFILES LABORALES HABILITADOS */}
                          <div className="bg-card-bg border border-border-dark rounded-xl p-5">
                            <h4 className="text-sm font-bold text-white font-display tracking-tight flex items-center gap-2 mb-3">
                              <Briefcase className="w-4 h-4 text-accent-violet" />
                              <span>4. Perfiles Con Salida Laboral</span>
                            </h4>
                            <p className="text-xs text-text-dim leading-relaxed mb-4">
                              Habilidades habilitadas por tu ruta para optar a vacantes activas del mercado:
                            </p>

                            <div className="space-y-4">
                              {student.passport.perfiles.map((p, i) => (
                                <div key={i} className="text-xs border-b border-border-dark/60 pb-3 last:border-0 last:pb-0">
                                  <div className="flex justify-between font-bold mb-1">
                                    <span className="text-white text-[13px]">{p.title}</span>
                                    <span className="text-accent-violet font-mono">{p.enabledPercent}% Habilitado</span>
                                  </div>
                                  <div className="w-full h-1 bg-brand-bg rounded-full overflow-hidden mb-2.5">
                                    <div className="h-full bg-accent-violet font-semibold rounded-full" style={{ width: `${p.enabledPercent}%` }} />
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-text-dim tracking-wide font-mono">
                                    <span>Demanda: <strong className="text-white">{p.laborDemand}</strong></span>
                                    <span>Salario Medio: <strong className="text-accent-emerald">{p.salaryMedian}</strong></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 5. PORTAFOLIO DE LOGROS Y PRODUCTOS ASOCIADOS */}
                          <div className="bg-card-bg border border-border-dark rounded-xl p-5">
                            <h4 className="text-sm font-bold text-white font-display tracking-tight flex items-center gap-2 mb-3">
                              <Target className="w-4 h-4 text-accent-violet" />
                              <span>5. Portafolio de Logros e Hitos</span>
                            </h4>
                            
                            <div className="space-y-3 mb-4 max-h-[170px] overflow-y-auto no-scrollbar pr-1">
                              {student.passport.logros.map((g, i) => (
                                <div key={i} className="p-3 bg-black/40 rounded-xl border border-border-dark/60 text-xs">
                                  <div className="flex justify-between items-start mb-1 text-xs">
                                    <span className="font-semibold text-white leading-tight">{g.goal}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                                      g.status === "Cumplido" 
                                        ? "bg-accent-emerald/15 text-accent-emerald" 
                                        : "bg-amber-400/10 text-amber-400"
                                    }`}>
                                      {g.status}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-text-dim leading-relaxed">
                                    <strong className="text-text-dim text-[9px] uppercase font-mono tracking-wide">Productos del curso:</strong> {g.associatedProducts.join(", ")}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Form to add achievements */}
                            <form onSubmit={handleAddGoal} className="space-y-2 border-t border-border-dark/60 pt-3">
                              <input
                                type="text"
                                value={newGoalText}
                                onChange={(e) => setNewGoalText(e.target.value)}
                                placeholder="Añadir hito (ej. Crear pasarela de pagos)"
                                className="w-full bg-brand-bg border border-border-dark rounded-lg text-xs text-white p-2 outline-none focus:border-accent-violet text-ellipsis"
                              />
                              <input
                                type="text"
                                value={newGoalProducts}
                                onChange={(e) => setNewGoalProducts(e.target.value)}
                                placeholder="Productos creados (ej. Código Express, DB schema)"
                                className="w-full bg-brand-bg border border-border-dark rounded-lg text-xs text-white p-2 outline-none focus:border-accent-violet text-ellipsis"
                              />
                              <button
                                type="submit"
                                className="w-full bg-black hover:bg-border-dark border border-border-dark hover:border-gray-600 text-white font-bold text-[11px] py-1.5 rounded-lg transition-all cursor-pointer"
                              >
                                Registrar Logro a Pasaporte
                              </button>
                            </form>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 1B: DIAGNOSTICO DE RUTA INDIVIDUAL */}
                  {studentTab === "diag" && (
                    <div id="tab_student_diagnostic" className="bg-card-bg border border-border-dark rounded-2xl p-8 max-w-3xl mx-auto space-y-6">
                      <div className="text-center">
                        <Compass className="w-12 h-12 text-accent-violet mx-auto mb-2" />
                        <h3 className="text-xl font-bold text-white font-display">Diagnóstico Individual de Upskilling</h3>
                        <p className="text-xs text-text-dim max-w-lg mx-auto leading-relaxed mt-1">
                          Define tu meta profesional y la plataforma recomendará tu ruta educativa óptima sínfona (de 3, 5 o 7 cursos) integrada por múltiples universidades del marketplace.
                        </p>
                      </div>

                      <div className="border-t border-border-dark/60 pt-6">
                        
                        {diagStep === 1 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div>
                                <label className="text-xs font-mono font-medium text-text-dim block mb-2 uppercase tracking-wide">Área Objetivo Profesional</label>
                                <select 
                                  value={diagAnswers.primaryGoal} 
                                  onChange={(e) => setDiagAnswers(prev => ({ ...prev, primaryGoal: e.target.value }))}
                                  className="w-full bg-brand-bg border border-border-dark text-xs text-white rounded-lg p-3 outline-none focus:border-accent-violet"
                                >
                                  <option value="Engineering">Desarrollo e Integración de Software (Ingeniería)</option>
                                  <option value="Marketing">Growth Marketing y Métricas de Negocios</option>
                                  <option value="AI">Inteligencia Artificial y Machine Learning</option>
                                  <option value="Design">Diseño de Productos SaaS y Experiencia UX</option>
                                  <option value="Sustainability">Sostenibilidad Corporativa y Estrategia ASG (ESG)</option>
                                  <option value="Cybersecurity">Ciberseguridad Empresarial y DevSecOps</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-xs font-mono font-medium text-text-dim block mb-2 uppercase tracking-wide">Tu Experiencia Técnica Actual</label>
                                <select 
                                  value={diagAnswers.technicalExperience} 
                                  onChange={(e) => setDiagAnswers(prev => ({ ...prev, technicalExperience: e.target.value }))}
                                  className="w-full bg-brand-bg border border-border-dark text-xs text-white rounded-lg p-3 outline-none focus:border-accent-violet"
                                >
                                  <option value="beginner">Principiante / Buscando reconversión (Reskilling)</option>
                                  <option value="intermediate">Intermedio / Buscando especialización</option>
                                  <option value="advanced">Avanzado / Buscando roles de arquitectura (Upskilling)</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-xs font-mono font-medium text-text-dim block mb-2 uppercase tracking-wide">Extensión de Ruta Requerida</label>
                                <select 
                                  value={diagAnswers.lengthPreference} 
                                  onChange={(e) => setDiagAnswers(prev => ({ ...prev, lengthPreference: e.target.value }))}
                                  className="w-full bg-brand-bg border border-border-dark text-xs text-white rounded-lg p-3 outline-none focus:border-accent-violet"
                                >
                                  <option value="3">Inmersión Ágil (3 Cursos sugeridos)</option>
                                  <option value="5">Ruta de Especialización (5 Cursos sugeridos)</option>
                                  <option value="7">Ruta Completa Full-Stack (7 Cursos sugeridos)</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-xs font-mono font-medium text-text-dim block mb-2 uppercase tracking-wide">Presupuesto Educativo</label>
                                <select 
                                  value={diagAnswers.budgetRange} 
                                  onChange={(e) => setDiagAnswers(prev => ({ ...prev, budgetRange: e.target.value }))}
                                  className="w-full bg-brand-bg border border-border-dark text-xs text-white rounded-lg p-3 outline-none focus:border-accent-violet"
                                >
                                  <option value="medium">Estándar / Co-financiado corporativo</option>
                                  <option value="high">Ilimitado / Cubierto por crédito digital fácil</option>
                                </select>
                              </div>
                            </div>

                            <button
                              id="diag_submit_btn"
                              onClick={handleDiagnoseSubmit}
                              className="w-full bg-accent-violet hover:bg-[#5f63eb] text-black font-bold text-xs p-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 fill-black" />
                              <span>Analizar Habilidades y Generar Ruta en Pasaporte</span>
                            </button>
                          </div>
                        )}

                        {diagStep === 3 && diagResult && (
                          <div className="space-y-6">
                            <div className="bg-[#102a1e]/40 border border-accent-emerald/40 p-4 rounded-xl flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent-emerald mt-0.5 shrink-0" />
                              <div>
                                <h4 className="text-sm font-bold text-white">¡Ruta Educativa Diagnosticada con Éxito!</h4>
                                <p className="text-xs text-text-dim mt-1">
                                  El sistema evaluó las variables e integró una recomendación personalizada con cursos de diferentes universidades.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h5 className="text-[11px] font-mono font-bold text-text-dim uppercase tracking-wider">Cursos de la Ruta Recomendada:</h5>
                              
                              <div className="space-y-2">
                                {courses.filter(c => diagResult.suggestedRoute.includes(c.id)).map((cur, i) => (
                                  <div key={i} className="p-3 bg-black/40 border border-border-dark rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                                    <div>
                                      <span className="text-[10px] font-mono text-accent-violet font-semibold">{cur.university} ({cur.level})</span>
                                      <div className="font-bold text-white mt-0.5">{cur.title}</div>
                                      <div className="text-[10px] text-text-dim mt-1">{cur.duration} • Enfoque en: {cur.skills.join(", ")}</div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="font-bold text-white font-mono">{cur.cost.toLocaleString("es-CO")} COP</span>
                                      <button
                                        onClick={() => handleEnrollCourse(cur.id, "student")}
                                        className="bg-[#1a1c29] border border-accent-violet/30 hover:bg-accent-violet hover:text-black py-1.5 px-3 rounded text-[11px] font-bold text-accent-violet transition-all cursor-pointer"
                                      >
                                        Inscribir en Campus Pass
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => setDiagStep(1)}
                                className="flex-1 bg-border-dark hover:bg-[#20202a] border border-[#2e2e38] text-white py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                              >
                                Repetir Mi Diagnóstico
                              </button>
                              <button
                                onClick={() => setStudentTab("pass")}
                                className="flex-1 bg-accent-violet hover:bg-[#5f63eb] text-black py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                              >
                                Ver Pasaporte Actualizado
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* TAB 1C: MARKETPLACE portfolio DE CURSOS */}
                  {studentTab === "market" && (
                    <div id="tab_student_market" className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white font-display">Portafolio Modular Universitario</h3>
                          <p className="text-xs text-text-dim">Explora las cátedras inbuilding desagregadas de posgrados, pregrados y educación continua de nuestros aliados.</p>
                        </div>
                        
                        <div id="search_marketplace_bar" className="flex items-center gap-2 bg-card-bg border border-border-dark rounded-xl px-4 py-2.5 max-w-sm w-full">
                          <Search className="w-4 h-4 text-text-dim" />
                          <input
                            type="text"
                            placeholder="Buscar habilidades o universidades..."
                            className="bg-transparent border-0 text-xs text-white outline-none w-full"
                          />
                        </div>
                      </div>

                      {/* Display Courses Grid */}
                      <div id="marketplace_grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map((cur) => {
                          const alreadyInrolled = student?.passport.sellos.some(s => s.courseId === cur.id);
                          return (
                            <div 
                              key={cur.id}
                              id={`market_course_${cur.id}`}
                              className="bg-card-bg border border-border-dark rounded-xl p-5 flex flex-col justify-between h-[280px] hover:border-[#383a48] transition-all duration-300"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-accent-violet font-bold uppercase tracking-wider mb-2">
                                  <span>{cur.university}</span>
                                  <span className="px-2 py-0.5 bg-[#171c2a] border border-accent-violet/20 rounded text-[9px] lowercase font-semibold">{cur.level}</span>
                                </div>
                                <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">{cur.title}</h4>
                                <p className="text-xs text-text-dim leading-relaxed mt-2 line-clamp-3">{cur.description}</p>
                              </div>

                              <div className="border-t border-border-dark/60 pt-4 mt-4">
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {cur.skills.map((s, i) => (
                                    <span key={i} className="text-[9px] bg-black/40 text-text-dim py-0.5 px-2 rounded font-mono border border-border-dark/60">{s}</span>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-[9px] text-text-dim uppercase font-mono tracking-wide leading-none">Matrícula Única</div>
                                    <span className="text-base font-bold text-white font-mono mt-1 block">{cur.cost.toLocaleString("es-CO")} COP</span>
                                  </div>

                                  {alreadyInrolled ? (
                                    <button 
                                      disabled
                                      className="bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 text-xs font-bold py-1.5 px-3.5 rounded-lg opacity-80"
                                    >
                                      Ya Adquirido
                                    </button>
                                  ) : (
                                    <button
                                      id={`buy_course_btn_${cur.id}`}
                                      onClick={() => handleEnrollCourse(cur.id, "student")}
                                      className="bg-accent-violet hover:bg-[#5f63eb] text-black text-xs font-bold py-1.5 px-3.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <span>Inscribir</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 1D: BILLETERA DIGITAL */}
                  {studentTab === "wallet" && student && (
                    <div id="tab_student_wallet" className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto align-stretch">
                      
                      <div className="bg-card-bg border border-border-dark rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-violet/5 rounded-full blur-2xl" />
                        
                        <div>
                          <span className="text-[10px] font-mono font-bold text-accent-violet uppercase tracking-wider block mb-1">Tu Pasaporte de Fondos</span>
                          <h3 className="text-lg font-bold text-white font-display">Billetera Campus Pass</h3>
                          <p className="text-xs text-text-dim leading-relaxed mt-1">
                            Tu pasaporte actúa a la vez como billetera digital para comprar créditos y adquirir cursos de universidades afiliadas de manera libre y ágil.
                          </p>
                        </div>

                        <div className="bg-black/40 p-5 rounded-xl border border-border-dark flex justify-between items-center my-4 select-none">
                          <div>
                            <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide">Saldo Disponible</span>
                            <div className="text-3xl font-bold text-white font-mono mt-1">${student.walletBalance.toLocaleString("es-CO")} COP</div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-text-dim uppercase tracking-wide">Línea de Crédito Aprobada</span>
                            <div className="text-lg font-bold text-accent-emerald font-mono mt-1">${student.creditApproved.toLocaleString("es-CO")} COP</div>
                          </div>
                        </div>

                        <div className="text-xs text-text-dim flex items-center gap-2 bg-border-dark/60 p-3 rounded-lg border border-border-dark leading-relaxed">
                          <CheckCircle className="w-4 h-4 text-accent-emerald shrink-0" />
                          <span>Tu crédito Campus Pass te permite adquirir cursos instantáneamente con amortización flexible.</span>
                        </div>
                      </div>

                      {/* Recharge Module */}
                      <div className="bg-card-bg border border-border-dark rounded-2xl p-6 space-y-4">
                        <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">Recargar Billetera Educativa</h4>
                        
                        <form onSubmit={handleWalletRechargeSubmit} className="space-y-4">
                          <div>
                            <label className="text-[10px] font-mono text-text-dim block mb-1.5 uppercase tracking-wide">Monto de Recarga (COP)</label>
                            <input
                              type="number"
                              value={rechargeAmt}
                              onChange={(e) => setRechargeAmt(e.target.value)}
                              placeholder="Monto"
                              className="w-full bg-brand-bg border border-border-dark rounded-lg font-mono text-sm text-white p-3 outline-none focus:border-accent-violet"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-text-dim block mb-1.5 uppercase tracking-wide">Método de Recarga Autorizado</label>
                            <div className="space-y-2">
                              {[
                                { id: "VinkuCrédito Fácil", label: "Crédito Digital Campus Pass (Fácil Acceso)" },
                                { id: "Tarjeta de Crédito", label: "Tarjeta de Crédito Corporativa/Personal" },
                                { id: "PSE / Transferencia", label: "Cuentas Bancarias / Transferencia Directa" }
                              ].map(source => (
                                <label key={source.id} className="flex items-center gap-3 bg-[#111115] border border-border-dark p-3 rounded-xl cursor-pointer hover:border-accent-violet/40 transition-all text-xs">
                                  <input
                                    type="radio"
                                    name="recharge_source"
                                    value={source.id}
                                    checked={rechargeSource === source.id}
                                    onChange={() => setRechargeSource(source.id)}
                                    className="accent-accent-violet w-4 h-4 shrink-0"
                                  />
                                  <span className="text-white leading-none">{source.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <button
                            id="submit_recharge_btn"
                            type="submit"
                            className="w-full bg-accent-violet hover:bg-[#5f63eb] text-black font-bold text-xs p-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>Acreditar Recarga Instantáneamente</span>
                          </button>
                        </form>
                      </div>

                    </div>
                  )}

                  {/* TAB 1E: FELLOWSHIP MENTORING */}
                  {studentTab === "fellowship" && (
                    <div id="tab_student_fellowship" className="grid grid-cols-1 lg:grid-cols-3 gap-8 align-stretch">
                      
                      {/* Booking Section */}
                      <div className="lg:col-span-2 bg-card-bg border border-border-dark rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-accent-violet animate-pulse" />
                            <span className="text-[10px] font-mono font-bold text-accent-violet uppercase tracking-wider">Servicio de Mentoría Complementario Sincrónico</span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-white font-display">Vinku Fellowship</h3>
                          <p className="text-xs text-text-dim leading-relaxed mt-1">
                            Un espacio de mentoría cara a cara y sincrónico con ingenieros e investigadores para optimizar el cumplimiento de tus productos y logros profesionales programados.
                          </p>
                        </div>

                        <form onSubmit={handleFellowshipSubmit} className="space-y-4 my-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-mono text-text-dim block mb-1.5 uppercase tracking-wide">Mentor Solicitado</label>
                              <select
                                value={fellowshipForm.mentorName}
                                onChange={(e) => setFellowshipForm(prev => ({ ...prev, mentorName: e.target.value }))}
                                className="w-full bg-brand-bg border border-border-dark text-xs text-white rounded-lg p-3 outline-none focus:border-accent-violet"
                              >
                                <option value="Ing. Alejandro Cruz">Ing. Alejandro Cruz (AWS Certified Architect)</option>
                                <option value="Dra. Eliana Torres (IE BS)">Dra. Eliana Torres (IE BS Product Lead)</option>
                                <option value="Mg. Pablo Neruda">Mg. Pablo Neruda (Machine Learning PUC)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-mono text-[10px] text-text-dim block mb-1.5 uppercase tracking-wide">Horario Sugerido</label>
                              <input
                                type="text"
                                value={fellowshipForm.dateTime}
                                onChange={(e) => setFellowshipForm(prev => ({ ...prev, dateTime: e.target.value }))}
                                className="w-full bg-brand-bg border border-border-dark text-xs text-white rounded-lg p-3 outline-none focus:border-accent-violet text-ellipsis"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-text-dim block mb-1.5 uppercase tracking-wide">Tema / Logro del Pasaporte a Abordar</label>
                            <textarea
                              rows={3}
                              value={fellowshipForm.topic}
                              onChange={(e) => setFellowshipForm(prev => ({ ...prev, topic: e.target.value }))}
                              placeholder="Descríbenos en qué producto y meta de tus sellos deseas recibir mentoría tecnológica (ej. Mock del sitemap o endpoints de Node.js)"
                              className="w-full bg-brand-bg border border-border-dark text-xs text-white rounded-lg p-3 outline-none focus:border-accent-violet"
                            />
                          </div>

                          <button
                            id="submit_fellow_btn"
                            type="submit"
                            className="bg-accent-violet hover:bg-[#5f63eb] text-black text-xs font-bold py-2.5 px-6 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shadow-md"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Reservar Mentoría Síncrona</span>
                          </button>
                        </form>

                        {fellowshipSuccess && (
                          <div className="bg-[#102a1e] border border-accent-emerald/40 text-accent-emerald text-xs p-3 rounded-xl flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>¡Sesión agendada! Se ha enviado el link de Zoom a tu correo.</span>
                          </div>
                        )}
                      </div>

                      {/* Scheduled Panel List */}
                      <div className="bg-card-bg border border-border-dark rounded-2xl p-6 space-y-4">
                        <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">Mentorías Activas Programadas</h4>
                        <p className="text-xs text-text-dim">Revisa los links de sala síncrona asignados:</p>
                        
                        <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                          {fellowships.map((sess, i) => (
                            <div key={i} className="p-4 bg-black/40 border border-border-dark rounded-xl space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-white text-[13px]">{sess.mentorName}</span>
                                <span className="text-[9px] px-2 py-0.5 bg-accent-violet/10 border border-accent-violet/20 text-accent-violet font-semibold rounded">
                                  Síncrónica
                                </span>
                              </div>
                              <p className="text-text-dim leading-snug">{sess.topic}</p>
                              
                              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-border-dark/60 mt-2">
                                <span className="text-amber-400">{sess.dateTime}</span>
                                <a 
                                  href={sess.zoomLink} 
                                  target="_blank" 
                                  rel="referrer" 
                                  className="text-accent-emerald hover:underline font-bold"
                                >
                                  Ir a Zoom →
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 1F: STUDENT PORTFOLIO */}
                  {studentTab === "portfolio" && student && (
                    <div id="tab_student_portfolio" className="space-y-8">
                      <div className="bg-card-bg border border-border-dark rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-accent-yellow" />
                          <span className="text-[10px] font-mono font-bold text-accent-yellow uppercase tracking-wider">Vitrina de Talento Verificable</span>
                        </div>
                        <h3 className="text-xl font-bold text-white font-display">Mi Portafolio de Logros Campus Pass</h3>
                        <p className="text-xs text-text-dim max-w-2xl mt-1 leading-relaxed">
                          La respuesta ágil al currículo tradicional: acumula hitos de formación desagregados ligados directamente a código y mockups de productos reales verificados por empresas aliadas.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                          <div className="bg-[#0b0b0f] border border-border-dark rounded-xl p-5">
                            <h4 className="text-sm font-bold text-white mb-3 font-display">Tus Cátedras & Productos Vinculados</h4>
                            <div className="space-y-4">
                              {student.passport.sellos.map((s, index) => (
                                <div key={index} className="p-4 bg-black/40 border border-border-dark rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs">
                                  <div>
                                    <span className="text-[9px] font-mono font-bold text-accent-yellow uppercase tracking-wider bg-accent-yellow/10 border border-accent-yellow/25 px-2 py-0.5 rounded-full">
                                      {s.university}
                                    </span>
                                    <h5 className="font-bold text-white text-sm mt-2">{s.courseTitle}</h5>
                                    <div className="text-text-dim mt-1.5 flex items-center gap-2 font-mono text-[10px]">
                                      <span>Status: <strong className="text-white">{s.status}</strong></span>
                                      <span>•</span>
                                      <span>Crédito: <strong className="text-accent-emerald">Sincrónico</strong></span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1 text-[11px] font-mono">
                                    <div className="text-text-dim text-[10px] uppercase font-semibold">Productos del Trabajo:</div>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      <span className="bg-[#151520] border border-border-dark px-2.5 py-1 rounded text-zinc-300">
                                        📄 API Schema Node.js
                                      </span>
                                      <span className="bg-[#151520] border border-border-dark px-2.5 py-1 rounded text-zinc-300">
                                        💻 Express Routes
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Achievements ledger log table */}
                          <div className="bg-card-bg border border-border-dark rounded-xl p-5">
                            <h4 className="text-sm font-bold text-white mb-3 font-display">Bitácora de Logros e Hitos Certificados</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-border-dark text-[10px] font-mono text-text-dim uppercase tracking-wider pb-2">
                                    <th className="py-2.5">Hito Registrado</th>
                                    <th className="py-2.5">Código / Mock Producto</th>
                                    <th className="py-2.5 text-right">Estatus Firma</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark/40">
                                  {student.passport.logros.map((g, i) => (
                                    <tr key={i} className="hover:bg-black/20">
                                      <td className="py-3 font-semibold text-white">{g.goal}</td>
                                      <td className="py-3 font-mono text-text-dim text-[11px]">{g.associatedProducts.join(", ")}</td>
                                      <td className="py-3 text-right">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          g.status === "Cumplido" 
                                            ? "bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/20" 
                                            : "bg-amber-400/15 text-amber-400 border border-amber-400/20"
                                        }`}>
                                          {g.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Project register wizard widget */}
                        <div className="bg-card-bg border border-border-dark rounded-xl p-5 h-fit space-y-4">
                          <h4 className="text-sm font-bold text-white font-display">Registrar Nuevo Avance de Portafolio</h4>
                          <p className="text-xs text-text-dim leading-relaxed">
                            Vincula un nuevo hito de programación o arquitectura al pasaporte para que el Neo-Cluster universitario proceda con la firma digital de su sello correspondiente.
                          </p>

                          <form onSubmit={handleAddGoal} className="space-y-3.5">
                            <div>
                              <label className="text-[10px] font-mono text-text-dim block mb-1 uppercase tracking-wide">Título del Logro / Hito</label>
                              <input
                                type="text"
                                value={newGoalText}
                                onChange={(e) => setNewGoalText(e.target.value)}
                                placeholder="e.g. Desarrollar pasarela Stripe"
                                className="w-full bg-brand-bg border border-border-dark rounded-lg text-xs text-white p-2.5 outline-none focus:border-accent-yellow"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-mono text-text-dim block mb-1 uppercase tracking-wide">Código o Productos Generados</label>
                              <input
                                type="text"
                                value={newGoalProducts}
                                onChange={(e) => setNewGoalProducts(e.target.value)}
                                placeholder="e.g. server.cjs, Stripe Webhook Route"
                                className="w-full bg-brand-bg border border-border-dark rounded-lg text-xs text-white p-2.5 outline-none focus:border-accent-yellow"
                                required
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-accent-yellow hover:bg-yellow-500 text-black font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Registrar y Solicitar Sello</span>
                            </button>
                          </form>
                        </div>

                      </div>
                    </div>
                  )}

                </>
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
