import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Users,
  Award,
  DollarSign,
  Plus,
  Sliders,
  CheckCircle,
  Loader2,
  X,
  AlertCircle,
  Settings,
  PlayCircle,
} from "lucide-react";
import { Course, UniversityStats } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import * as api from "../lib/api";

// ============================================================
// Types
// ============================================================

interface UniversityPortalViewProps {
  courses: Course[];
  universities: UniversityStats[];
  uniTab: "dashboard" | "catalogo" | "matriculados" | "certificaciones";
  setUniTab: (tab: "dashboard" | "catalogo" | "matriculados" | "certificaciones") => void;
  onCourseAdded: () => void;
  onCertifyApprove: (studentId: string, courseId: string, universityId: string) => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => void;
}

interface EnrollmentRow {
  id: string;
  status: string;
  enrolled_at: string;
  started_at?: string | null;
  completed_at: string | null;
  courses: {
    id: string;
    title: string;
    cost_credits: number;
    university_id?: string;
    universities: {
      id: string;
      name: string;
    } | null;
  } | null;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

interface UniData {
  name: string;
  logo_url: string | null;
  contact_email: string;
  liquid_balance: number;
  total_earnings: number;
}

// ============================================================
// Component
// ============================================================

export default function UniversityPortalView({
  courses,
  uniTab,
  setUniTab,
  onCourseAdded,
  triggerToast,
  fetchState,
}: UniversityPortalViewProps) {
  const { user, role } = useAuth();

  // ---- university profile / id ----
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [universityName, setUniversityName] = useState<string>("Mi Universidad");
  const [uniData, setUniData] = useState<UniData | null>(null);

  // ---- edit profile modal ----
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLogo, setProfileLogo] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // ---- enrollments (real data) ----
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // ---- catalog form ----
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [courseFormTitle, setCourseFormTitle] = useState("");
  const [courseFormDesc, setCourseFormDesc] = useState("");
  const [courseFormLevel, setCourseFormLevel] = useState<
    "Pregrado" | "Posgrado" | "Educación Continua"
  >("Educación Continua");
  const [courseFormDuration, setCourseFormDuration] = useState("");
  const [courseFormCost, setCourseFormCost] = useState("");
  const [courseFormSkills, setCourseFormSkills] = useState("");
  const [courseFormCategory, setCourseFormCategory] = useState("Tecnología");
  const [courseFormPrereqs, setCourseFormPrereqs] = useState<string[]>([]);
  const [courseFormDocs, setCourseFormDocs] = useState<string[]>([]);
  const [courseFormSeats, setCourseFormSeats] = useState("");
  const [courseFormOtherDoc, setCourseFormOtherDoc] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  const FIXED_DOCS = [
    "Documento de identidad",
    "Diploma de bachiller",
    "Certificado laboral",
    "Hoja de vida",
  ];

  // ---- certifying ----
  const [certifyingId, setCertifyingId] = useState<string | null>(null);

  // ---- load full university record ----
  const loadUniData = useCallback(async (uniId: string) => {
    const { data } = await supabase
      .from("universities")
      .select("*")
      .eq("id", uniId)
      .single();
    if (data) {
      setUniversityName(data.name);
      setUniData({
        name: data.name,
        logo_url: data.logo_url ?? null,
        contact_email: data.contact_email ?? "",
        liquid_balance: data.liquid_balance ?? 0,
        total_earnings: data.total_earnings ?? 0,
      });
    }
  }, []);

  // ---- load profile to get university_id ----
  useEffect(() => {
    if (!user) return;
    api.fetchProfile(user.id).then((profile) => {
      if (profile?.university_id) {
        setUniversityId(profile.university_id);
        loadUniData(profile.university_id);
      }
    });
  }, [user, loadUniData]);

  // ---- fetch enrollments ----
  const fetchEnrollments = useCallback(async () => {
    if (!universityId) return;
    setLoadingEnrollments(true);
    try {
      const courseSel =
        "courses(id, title, cost_credits, university_id, universities(id, name)), profiles(id, full_name, email)";
      // Intenta incluir started_at; si la migración 007 aún no corrió, reintenta sin él
      let { data, error } = await supabase
        .from("enrollments")
        .select(`id, status, enrolled_at, started_at, completed_at, ${courseSel}`);
      if (error) {
        const msg = String(error.message ?? "").toLowerCase();
        if (msg.includes("started_at") || msg.includes("column") || msg.includes("does not exist")) {
          ({ data, error } = await supabase
            .from("enrollments")
            .select(`id, status, enrolled_at, completed_at, ${courseSel}`));
        }
      }
      if (error) throw error;
      const filtered = ((data ?? []) as EnrollmentRow[]).filter(
        (e) =>
          e.courses?.universities?.id === universityId ||
          e.courses?.university_id === universityId
      );
      setEnrollments(filtered);
    } catch (err) {
      console.error("Error cargando matriculados:", err);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [universityId]);

  useEffect(() => {
    if (universityId) fetchEnrollments();
  }, [universityId, fetchEnrollments]);

  // ---- guard: not logged in ----
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[#6C47FF] mx-auto" />
          <h3 className="text-lg font-extrabold text-[#1A1A1A]">Acceso Restringido</h3>
          <p className="text-sm text-gray-600">
            Inicia sesión como universidad para acceder a este portal.
          </p>
        </div>
      </div>
    );
  }

  // ---- guard: wrong role ----
  if (role !== "university_admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[#FFD000] mx-auto" />
          <h3 className="text-lg font-extrabold text-[#1A1A1A]">Acceso Exclusivo</h3>
          <p className="text-sm text-gray-600">
            Este portal es exclusivo para universidades aliadas.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Derived KPIs
  // ============================================================
  const uniCourses = courses.filter((c) =>
    universityId ? c.universityId === universityId : c.university === universityName
  );
  const enrolledCount = enrollments.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = enrollments
    .filter((e) => {
      const d = new Date(e.enrolled_at);
      return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear &&
        e.status !== "Abandonado"
      );
    })
    .reduce((sum, e) => sum + (e.courses?.cost_credits ?? 0), 0);

  // "Por Certificar" = status Cursando + completed_at set (finished but not certified)
  const toCertify = enrollments.filter(
    (e) => e.status === "Cursando" && e.completed_at !== null
  );

  // ============================================================
  // Handlers
  // ============================================================
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universityId) {
      triggerToast("No se encontró el ID de universidad en tu perfil.", "error");
      return;
    }
    if (!courseFormTitle || !courseFormCost || !courseFormDuration) {
      triggerToast("Completa todos los campos obligatorios.", "error");
      return;
    }
    setSavingCourse(true);
    try {
      const base = {
        university_id: universityId,
        title: courseFormTitle,
        description: courseFormDesc || null,
        level: courseFormLevel,
        duration: courseFormDuration,
        cost_credits: parseFloat(courseFormCost),
        skills: courseFormSkills
          ? courseFormSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        category: courseFormCategory,
        is_active: true,
      };
      const extras: Record<string, unknown> = {};
      if (courseFormPrereqs.length) extras.prerequisites = courseFormPrereqs;
      if (courseFormDocs.length) extras.required_docs = courseFormDocs;
      extras.max_seats = courseFormSeats ? parseInt(courseFormSeats) : null;
      await api.addCourseResilient(base, extras);
      triggerToast(`Curso "${courseFormTitle}" publicado en el catálogo.`, "success");
      setShowCatalogModal(false);
      setCourseFormTitle("");
      setCourseFormDesc("");
      setCourseFormDuration("");
      setCourseFormCost("");
      setCourseFormSkills("");
      setCourseFormPrereqs([]);
      setCourseFormDocs([]);
      setCourseFormSeats("");
      setCourseFormOtherDoc("");
      onCourseAdded();
      fetchState();
    } catch (err) {
      console.error(err);
      triggerToast("Error al guardar el curso.", "error");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleCertify = async (enrollmentId: string, studentName: string) => {
    // Pre-validate: ensure enrollment has completed_at set
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment?.completed_at) {
      triggerToast("Este estudiante aún no ha completado el curso.", "error");
      return;
    }
    setCertifyingId(enrollmentId);
    try {
      await api.certifyEnrollment(enrollmentId);
      const gross = enrollment.courses?.cost_credits ?? 0;
      const net = Math.round(gross * 0.8);
      if (universityId && gross > 0) {
        await api.addUniversityEarnings(universityId, gross);
        await loadUniData(universityId);
      }
      triggerToast(
        `Certificado emitido para ${studentName}. Recibiste $${net.toLocaleString(
          "es-CO"
        )} COP (80%).`,
        "success"
      );
      await fetchEnrollments();
      fetchState();
    } catch (err) {
      console.error(err);
      triggerToast("Error al emitir el certificado.", "error");
    } finally {
      setCertifyingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universityId) return;
    setSavingProfile(true);
    try {
      await api.updateUniversity(universityId, {
        name: profileName,
        logo_url: profileLogo || null,
        contact_email: profileEmail,
      });
      await loadUniData(universityId);
      triggerToast("Perfil de universidad actualizado.", "success");
      setShowProfileModal(false);
      fetchState();
    } catch (err) {
      console.error(err);
      triggerToast("Error al actualizar el perfil.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkStarted = async (enrollmentId: string) => {
    try {
      await api.markEnrollmentStarted(enrollmentId);
      await fetchEnrollments();
    } catch (err) {
      console.error(err);
      triggerToast("Error al marcar como iniciado.", "error");
    }
  };

  const handleMarkCompleted = async (enrollmentId: string) => {
    try {
      await api.markEnrollmentCompleted(enrollmentId);
      await fetchEnrollments();
    } catch (err) {
      console.error(err);
      triggerToast("Error al marcar como completado.", "error");
    }
  };

  const openProfileModal = () => {
    setProfileName(uniData?.name ?? universityName);
    setProfileLogo(uniData?.logo_url ?? "");
    setProfileEmail(uniData?.contact_email ?? "");
    setShowProfileModal(true);
  };

  // derived enrollment state for timeline badge
  const enrollmentStage = (e: EnrollmentRow) => {
    if (e.status === "Certificado") return { label: "Certificado", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (e.completed_at) return { label: "Completado", cls: "bg-[#6C47FF]/10 text-[#6C47FF] border-[#6C47FF]/30" };
    if (e.started_at) return { label: "En curso", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    return { label: "Matriculado", cls: "bg-gray-100 text-gray-500 border-gray-200" };
  };

  // ============================================================
  // Tab config
  // ============================================================
  const tabs: {
    id: "dashboard" | "catalogo" | "matriculados" | "certificaciones";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: Sliders },
    { id: "catalogo", label: "Catálogo", icon: BookOpen },
    { id: "matriculados", label: "Matriculados", icon: Users },
    { id: "certificaciones", label: "Certificaciones", icon: Award },
  ];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-[600px] bg-[#FAFAFA] space-y-6 font-sans">

      {/* ---- Header ---- */}
      <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {uniData?.logo_url ? (
            <img
              src={uniData.logo_url}
              alt={universityName}
              className="w-14 h-14 object-cover border-2 border-[#1A1A1A] rounded-xl shrink-0"
            />
          ) : (
            <div className="w-14 h-14 bg-[#FFD000] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-center font-extrabold text-[#1A1A1A] text-2xl shrink-0">
              {universityName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">{universityName}</h2>
            {uniData?.contact_email && (
              <p className="text-xs text-gray-500 font-medium mt-0.5">{uniData.contact_email}</p>
            )}
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Portal Académico · Campus Pass</p>
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <div className="text-right">
            <p className="text-lg font-extrabold text-[#6C47FF] font-mono leading-none">
              ${(uniData?.liquid_balance ?? 0).toLocaleString("es-CO")} COP
            </p>
            <p className="text-[10px] text-gray-400 font-medium">disponibles</p>
          </div>
          <button
            onClick={openProfileModal}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] px-3 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            Editar perfil
          </button>
        </div>
      </div>

      {/* ---- Edit profile modal ---- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">Editar Perfil de Universidad</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">Nombre</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">URL del logo</label>
                <input
                  type="url"
                  value={profileLogo}
                  onChange={(e) => setProfileLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                />
                {profileLogo && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-gray-400">Vista previa:</span>
                    <img
                      src={profileLogo}
                      alt="preview"
                      className="w-12 h-12 object-cover border-2 border-[#1A1A1A] rounded-xl"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">Correo de contacto</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                />
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:border-gray-300 cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] text-[#1A1A1A] font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-400 transition-all disabled:opacity-60"
                >
                  {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingProfile ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Tab Navigation ---- */}
      <div className="flex gap-2 flex-wrap pb-2 border-b-2 border-[#1A1A1A]">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = uniTab === id;
          return (
            <button
              key={id}
              onClick={() => setUniTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                active
                  ? "bg-[#FFD000] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]"
                  : "bg-white text-gray-500 border-2 border-gray-200 hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* ================================================================
          DASHBOARD TAB
         ================================================================ */}
      {uniTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6C47FF]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">
                  Cursos Activos
                </span>
              </div>
              <p className="text-2xl font-extrabold text-[#1A1A1A]">{uniCourses.length}</p>
              <p className="text-[10px] text-gray-400">Publicados en el marketplace</p>
            </div>

            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6C47FF]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">
                  Estudiantes Matriculados
                </span>
              </div>
              <p className="text-2xl font-extrabold text-[#1A1A1A]">{enrolledCount}</p>
              <p className="text-[10px] text-gray-400">Total de matrículas activas</p>
            </div>

            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#6C47FF]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">
                  Ingresos del Mes
                </span>
              </div>
              <p className="text-2xl font-extrabold text-[#1A1A1A]">
                ${monthlyRevenue.toLocaleString("es-CO")} COP
              </p>
              <p className="text-[10px] text-gray-400">Matrículas completadas este mes</p>
            </div>

            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FFD000]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">
                  Cert. Pendientes
                </span>
              </div>
              <p className="text-2xl font-extrabold text-[#1A1A1A]">{toCertify.length}</p>
              <p className="text-[10px] text-gray-400">Estudiantes listos para certificar</p>
            </div>
          </div>

          {/* Course list summary */}
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-[#1A1A1A]">Cursos de tu Universidad</h3>
            {uniCourses.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                No tienes cursos publicados aún. Ve al Catálogo para agregar uno.
              </p>
            ) : (
              <div className="space-y-2">
                {uniCourses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-3 bg-[#FAFAFA]"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A]">{c.title}</p>
                      <p className="text-[10px] text-gray-400">
                        {c.category} · {c.level}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#6C47FF]">
                      ${c.cost.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {import.meta.env.DEV && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 space-y-1">
              <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider mb-2">⚗️ Modo desarrollo — Datos de prueba</p>
              <p className="text-xs font-mono text-gray-500">Para probar el flujo completo registra un estudiante con:</p>
              <p className="text-xs font-mono text-gray-600">correo: <span className="text-[#6C47FF]">student@demo.vinkupass.com</span> | contraseña: <span className="text-[#6C47FF]">Demo1234!</span></p>
              <p className="text-xs font-mono text-gray-500 mt-1">Y una cuenta universitaria con:</p>
              <p className="text-xs font-mono text-gray-600">correo: <span className="text-[#6C47FF]">universidad@demo.vinkupass.com</span> | contraseña: <span className="text-[#6C47FF]">Demo1234!</span></p>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          CATÁLOGO TAB
         ================================================================ */}
      {uniTab === "catalogo" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1A1A1A]">Catálogo de Cursos</h3>
              <p className="text-xs text-gray-500">Gestiona la oferta académica de tu universidad.</p>
            </div>
            <button
              onClick={() => {
                setCourseFormTitle("");
                setCourseFormDesc("");
                setCourseFormDuration("");
                setCourseFormCost("");
                setCourseFormSkills("");
                setCourseFormPrereqs([]);
                setCourseFormDocs([]);
                setCourseFormSeats("");
                setCourseFormOtherDoc("");
                setShowCatalogModal(true);
              }}
              className="flex items-center gap-2 bg-[#FFD000] hover:bg-yellow-400 text-[#1A1A1A] font-extrabold text-xs px-5 py-3 rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Agregar Curso
            </button>
          </div>

          {uniCourses.length === 0 ? (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-10 text-center">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">Aún no tienes cursos publicados.</p>
              <p className="text-xs text-gray-300 mt-1">
                Haz clic en "Agregar Curso" para comenzar.
              </p>
            </div>
          ) : (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-wider">
                      <th className="p-4 text-left font-bold">Título</th>
                      <th className="p-4 text-left font-bold">Nivel</th>
                      <th className="p-4 text-left font-bold">Categoría</th>
                      <th className="p-4 text-left font-bold">Duración</th>
                      <th className="p-4 text-left font-bold">Costo (COP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {uniCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-[#1A1A1A]">{c.title}</p>
                          <p className="text-[10px] text-gray-400 italic mt-0.5">Así lo ven los estudiantes</p>
                        </td>
                        <td className="p-4 text-gray-500">{c.level}</td>
                        <td className="p-4">
                          <span className="bg-[#6C47FF]/10 text-[#6C47FF] border border-[#6C47FF]/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {c.category}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{c.duration}</td>
                        <td className="p-4 font-extrabold text-[#6C47FF] font-mono">
                          ${c.cost.toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal form */}
          {showCatalogModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-6 max-w-lg w-full space-y-4 animate-fade-in relative">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">Agregar Nuevo Curso</h3>
                  <button
                    onClick={() => setShowCatalogModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseFormTitle}
                      onChange={(e) => setCourseFormTitle(e.target.value)}
                      placeholder="ej. Fundamentos de Inteligencia Artificial"
                      className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={courseFormDesc}
                      onChange={(e) => setCourseFormDesc(e.target.value)}
                      placeholder="Describe el contenido y objetivos del curso..."
                      className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        Nivel *
                      </label>
                      <select
                        value={courseFormLevel}
                        onChange={(e) =>
                          setCourseFormLevel(
                            e.target.value as "Pregrado" | "Posgrado" | "Educación Continua"
                          )
                        }
                        className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                      >
                        <option value="Pregrado">Pregrado</option>
                        <option value="Posgrado">Posgrado</option>
                        <option value="Educación Continua">Educación Continua</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        Categoría *
                      </label>
                      <select
                        value={courseFormCategory}
                        onChange={(e) => setCourseFormCategory(e.target.value)}
                        className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                      >
                        <option value="Tecnología">Tecnología</option>
                        <option value="Datos & IA">Datos &amp; IA</option>
                        <option value="Marketing & Ventas">Marketing &amp; Ventas</option>
                        <option value="Diseño & Creatividad">Diseño &amp; Creatividad</option>
                        <option value="Finanzas & Inversión">Finanzas &amp; Inversión</option>
                        <option value="Gestión & Liderazgo">Gestión &amp; Liderazgo</option>
                        <option value="Emprendimiento">Emprendimiento</option>
                        <option value="Derecho & Cumplimiento">Derecho &amp; Cumplimiento</option>
                        <option value="Ciberseguridad">Ciberseguridad</option>
                        <option value="Salud & Bienestar">Salud &amp; Bienestar</option>
                        <option value="Sostenibilidad">Sostenibilidad</option>
                        <option value="Habilidades Blandas">Habilidades Blandas</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        Duración *
                      </label>
                      <input
                        type="text"
                        required
                        value={courseFormDuration}
                        onChange={(e) => setCourseFormDuration(e.target.value)}
                        placeholder="ej. 64 Horas"
                        className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        Costo en COP *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={courseFormCost}
                        onChange={(e) => setCourseFormCost(e.target.value)}
                        placeholder="ej. 450000"
                        className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                      />
                      {courseFormCost && (
                        <p className="text-[10px] text-[#6C47FF] font-bold">
                          Los estudiantes pagarán ${parseInt(courseFormCost || "0").toLocaleString("es-CO")} COP
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                      Habilidades (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={courseFormSkills}
                      onChange={(e) => setCourseFormSkills(e.target.value)}
                      placeholder="ej. React, Node.js, PostgreSQL"
                      className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                    />
                  </div>

                  {/* Prerrequisitos */}
                  {uniCourses.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                        Prerrequisitos (otros cursos)
                      </label>
                      <div className="space-y-1 max-h-28 overflow-y-auto border-2 border-gray-100 rounded-xl p-2">
                        {uniCourses.map((c) => (
                          <label key={c.id} className="flex items-center gap-2 text-[11px] text-[#1A1A1A] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={courseFormPrereqs.includes(c.id)}
                              onChange={(e) =>
                                setCourseFormPrereqs((prev) =>
                                  e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                                )
                              }
                              className="accent-[#6C47FF]"
                            />
                            {c.title}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documentos requeridos */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                      Documentos requeridos
                    </label>
                    <div className="space-y-1">
                      {FIXED_DOCS.map((doc) => (
                        <label key={doc} className="flex items-center gap-2 text-[11px] text-[#1A1A1A] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={courseFormDocs.includes(doc)}
                            onChange={(e) =>
                              setCourseFormDocs((prev) =>
                                e.target.checked ? [...prev, doc] : prev.filter((d) => d !== doc)
                              )
                            }
                            className="accent-[#6C47FF]"
                          />
                          {doc}
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={courseFormOtherDoc}
                        onChange={(e) => setCourseFormOtherDoc(e.target.value)}
                        placeholder="Otro documento"
                        className="flex-1 border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-2 outline-none text-[#1A1A1A]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const d = courseFormOtherDoc.trim();
                          if (d && !courseFormDocs.includes(d)) {
                            setCourseFormDocs((prev) => [...prev, d]);
                            setCourseFormOtherDoc("");
                          }
                        }}
                        className="px-3 bg-[#1A1A1A] text-white rounded-xl text-[11px] font-bold cursor-pointer hover:bg-gray-800"
                      >
                        Agregar
                      </button>
                    </div>
                    {courseFormDocs.filter((d) => !FIXED_DOCS.includes(d)).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {courseFormDocs
                          .filter((d) => !FIXED_DOCS.includes(d))
                          .map((d) => (
                            <span
                              key={d}
                              className="text-[10px] font-bold bg-[#FFD000]/20 border border-[#FFD000] text-[#1A1A1A] px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              {d}
                              <button
                                type="button"
                                onClick={() => setCourseFormDocs((prev) => prev.filter((x) => x !== d))}
                                className="cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Cupos */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                      Cupos disponibles (vacío = ilimitado)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={courseFormSeats}
                      onChange={(e) => setCourseFormSeats(e.target.value)}
                      placeholder="ej. 30"
                      className="w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl p-3 outline-none text-[#1A1A1A]"
                    />
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowCatalogModal(false)}
                      className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:border-gray-300 cursor-pointer transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingCourse}
                      className="flex-1 bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] text-[#1A1A1A] font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-yellow-400 transition-all disabled:opacity-60"
                    >
                      {savingCourse ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {savingCourse ? "Guardando..." : "Publicar Curso"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          MATRICULADOS TAB
         ================================================================ */}
      {uniTab === "matriculados" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Directorio de Matriculados
              </h3>
              <p className="text-xs text-gray-500">
                Estudiantes inscritos en cursos de tu universidad.
              </p>
            </div>
            <button
              onClick={fetchEnrollments}
              disabled={loadingEnrollments}
              className="text-[10px] font-mono font-bold text-[#6C47FF] hover:underline cursor-pointer disabled:opacity-50"
            >
              {loadingEnrollments ? "Cargando..." : "Actualizar"}
            </button>
          </div>

          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#6C47FF]" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">
                Aún no hay matriculados en tus cursos.
              </p>
            </div>
          ) : (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-wider">
                      <th className="p-4 text-left font-bold">Estudiante</th>
                      <th className="p-4 text-left font-bold">Curso</th>
                      <th className="p-4 text-left font-bold">Estado</th>
                      <th className="p-4 text-center font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrollments.map((e) => {
                      const stage = enrollmentStage(e);
                      return (
                      <tr key={e.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-[#1A1A1A]">
                            {e.profiles?.full_name ?? "—"}
                          </p>
                          <p className="text-[10px] text-gray-400">{e.profiles?.email ?? "—"}</p>
                          <p className="text-[9px] text-gray-400 font-mono mt-1">
                            Matrícula: {new Date(e.enrolled_at).toLocaleDateString("es-CO")}
                            {e.started_at && ` · Inicio: ${new Date(e.started_at).toLocaleDateString("es-CO")}`}
                            {e.completed_at && ` · Fin: ${new Date(e.completed_at).toLocaleDateString("es-CO")}`}
                          </p>
                        </td>
                        <td className="p-4 font-medium text-[#1A1A1A] max-w-xs">
                          {e.courses?.title ?? "—"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${stage.cls}`}>
                            {stage.label}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {!e.started_at && e.status !== "Certificado" && (
                            <button
                              onClick={() => handleMarkStarted(e.id)}
                              className="bg-yellow-50 border-2 border-yellow-300 text-yellow-700 font-bold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 mx-auto hover:bg-yellow-100 cursor-pointer transition-all"
                            >
                              <PlayCircle className="w-3 h-3" /> Marcar Iniciado
                            </button>
                          )}
                          {e.started_at && !e.completed_at && (
                            <button
                              onClick={() => handleMarkCompleted(e.id)}
                              className="bg-[#6C47FF]/10 border-2 border-[#6C47FF]/30 text-[#6C47FF] font-bold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 mx-auto hover:bg-[#6C47FF]/20 cursor-pointer transition-all"
                            >
                              <CheckCircle className="w-3 h-3" /> Marcar Completado
                            </button>
                          )}
                          {e.completed_at && e.status !== "Certificado" && (
                            <button
                              onClick={() => setUniTab("certificaciones")}
                              className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                            >
                              Listo para certificar →
                            </button>
                          )}
                          {e.status === "Certificado" && (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          CERTIFICACIONES TAB
         ================================================================ */}
      {uniTab === "certificaciones" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5">
            <h3 className="text-base font-extrabold text-[#1A1A1A]">Centro de Certificaciones</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Emite certificados a estudiantes que han completado sus cursos.
            </p>
          </div>

          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#6C47FF]" />
            </div>
          ) : toCertify.length === 0 ? (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No hay certificaciones pendientes.</p>
              <p className="text-xs text-gray-300 mt-1">
                Cuando un estudiante complete un curso aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-wider">
                      <th className="p-4 text-left font-bold">Estudiante</th>
                      <th className="p-4 text-left font-bold">Curso</th>
                      <th className="p-4 text-left font-bold">Completado</th>
                      <th className="p-4 text-left font-bold">Valor COP</th>
                      <th className="p-4 text-center font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {toCertify.map((e) => (
                      <tr key={e.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-[#1A1A1A]">
                            {e.profiles?.full_name ?? "—"}
                          </p>
                          <p className="text-[10px] text-gray-400">{e.profiles?.email ?? "—"}</p>
                        </td>
                        <td className="p-4 font-medium text-[#1A1A1A] max-w-xs">
                          {e.courses?.title ?? "—"}
                        </td>
                        <td className="p-4 text-gray-500 font-mono text-[10px]">
                          {e.completed_at
                            ? new Date(e.completed_at).toLocaleDateString("es-CO")
                            : "—"}
                        </td>
                        <td className="p-4 font-mono">
                          <p className="font-extrabold text-[#6C47FF]">
                            ${(e.courses?.cost_credits ?? 0).toLocaleString("es-CO")}
                          </p>
                          <p className="text-[9px] text-gray-400">
                            Comisión 20% (-${Math.round((e.courses?.cost_credits ?? 0) * 0.2).toLocaleString("es-CO")}) · Recibes ${Math.round((e.courses?.cost_credits ?? 0) * 0.8).toLocaleString("es-CO")}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() =>
                              handleCertify(e.id, e.profiles?.full_name ?? "Estudiante")
                            }
                            disabled={certifyingId === e.id}
                            className="bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-[#1A1A1A] font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 mx-auto hover:bg-yellow-400 cursor-pointer transition-all disabled:opacity-60"
                          >
                            {certifyingId === e.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Award className="w-3 h-3" />
                            )}
                            {certifyingId === e.id ? "Procesando..." : "Emitir Certificado"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Already certified */}
          {enrollments.filter((e) => e.status === "Certificado").length > 0 && (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Certificados Emitidos
              </h4>
              <div className="space-y-2">
                {enrollments
                  .filter((e) => e.status === "Certificado")
                  .map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#1A1A1A]">
                          {e.profiles?.full_name ?? "—"}
                        </p>
                        <p className="text-[10px] text-gray-400">{e.courses?.title ?? "—"}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Certificado
                      </span>
                    </div>
                  ))}
              </div>
              {(() => {
                const certified = enrollments.filter((e) => e.status === "Certificado");
                const gross = certified.reduce((s, e) => s + (e.courses?.cost_credits ?? 0), 0);
                const commission = Math.round(gross * 0.2);
                const net = gross - commission;
                return (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-emerald-100 text-center">
                    <div>
                      <p className="text-[9px] font-mono uppercase text-gray-400 font-bold">Bruto</p>
                      <p className="text-sm font-extrabold text-[#1A1A1A] font-mono">${gross.toLocaleString("es-CO")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase text-gray-400 font-bold">Comisión 20%</p>
                      <p className="text-sm font-extrabold text-red-500 font-mono">-${commission.toLocaleString("es-CO")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase text-gray-400 font-bold">Neto 80%</p>
                      <p className="text-sm font-extrabold text-emerald-600 font-mono">${net.toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
