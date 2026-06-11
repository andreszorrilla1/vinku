import React, { useState, useEffect } from "react";
import {
  Award, Compass, BookOpen, Briefcase,
  Wallet, Calendar, CheckCircle, Target, Plus, Search,
  ChevronDown, ChevronUp, ArrowRight, RefreshCw,
} from "lucide-react";
import { Student, Course, UniversityStats } from "../types";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchWalletTransactions,
  fetchMentorSessions,
  updateAchievement,
} from "../lib/api";

interface StudentPortalViewProps {
  student: Student | null;
  courses: Course[];
  universities: UniversityStats[];
  studentTab: "pass" | "diag" | "market" | "wallet" | "fellowship" | "portfolio";
  setStudentTab: (tab: "pass" | "diag" | "market" | "wallet" | "fellowship" | "portfolio") => void;
  onDiagnoseSubmit: (e: React.FormEvent) => Promise<void>;
  onEnrollCourse: (courseId: string) => void;
  onWalletRecharge: (e: React.FormEvent) => Promise<void>;
  onAddGoal: (e: React.FormEvent) => Promise<void>;
  onBookFellowship: (e: React.FormEvent) => Promise<void>;
  rechargeAmt: string;
  setRechargeAmt: (v: string) => void;
  rechargeSource: string;
  setRechargeSource: (v: string) => void;
  fellowshipForm: { mentorName: string; topic: string; dateTime: string };
  setFellowshipForm: (v: { mentorName: string; topic: string; dateTime: string } | ((prev: { mentorName: string; topic: string; dateTime: string }) => { mentorName: string; topic: string; dateTime: string })) => void;
  newGoalText: string;
  setNewGoalText: (v: string) => void;
  newGoalProducts: string;
  setNewGoalProducts: (v: string) => void;
  diagAnswers: { primaryGoal: string; secondaryGoal: string; technicalExperience: string; budgetRange: string; lengthPreference: string };
  setDiagAnswers: (v: { primaryGoal: string; secondaryGoal: string; technicalExperience: string; budgetRange: string; lengthPreference: string } | ((prev: { primaryGoal: string; secondaryGoal: string; technicalExperience: string; budgetRange: string; lengthPreference: string }) => { primaryGoal: string; secondaryGoal: string; technicalExperience: string; budgetRange: string; lengthPreference: string })) => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => void;
}

function formatCOP(n: number) {
  return `${n.toLocaleString("es-CO")} COP`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const MENTORS = [
  { name: "Ing. Alejandro Cruz", expertise: "Cloud & DevOps", initials: "AC" },
  { name: "Dra. Valentina Ríos", expertise: "Datos & Machine Learning", initials: "VR" },
  { name: "MBA. Carlos Moreno", expertise: "Gestión & Liderazgo", initials: "CM" },
];

const DIAG_STEPS = [
  {
    question: "¿En qué área quieres crecer profesionalmente?",
    key: "primaryGoal",
    options: [
      { value: "Tech",       emoji: "💻", title: "Tecnología & Software",         desc: "Desarrollo, Cloud, DevOps, arquitectura de sistemas" },
      { value: "Data",       emoji: "🤖", title: "Datos e Inteligencia Artificial", desc: "ML, ciencia de datos, analytics, IA generativa" },
      { value: "Marketing",  emoji: "📈", title: "Marketing & Crecimiento",        desc: "Growth, SEO, branding, analítica de negocios" },
      { value: "Design",     emoji: "🎨", title: "Diseño & Creatividad",           desc: "UX/UI, product design, identidad visual" },
    ],
  },
  {
    question: "¿Y en cuál de estas áreas también tienes interés?",
    key: "secondaryGoal",
    options: [
      { value: "Finance",    emoji: "💰", title: "Finanzas & Inversión",           desc: "Modelos financieros, análisis de riesgo, inversión" },
      { value: "Management", emoji: "🏛️", title: "Gestión & Liderazgo",            desc: "Gestión de proyectos, liderazgo, estrategia" },
      { value: "Legal",      emoji: "⚖️", title: "Derecho & Ciberseguridad",       desc: "Derecho digital, protección de datos, compliance" },
      { value: "Health",     emoji: "🏥", title: "Salud & Sostenibilidad",         desc: "Gestión en salud, ESG, impacto social" },
    ],
  },
  {
    question: "¿Cuál es tu nivel de experiencia actual?",
    key: "technicalExperience",
    options: [
      { value: "beginner",     emoji: "🌱", title: "Estoy comenzando",    desc: "Junior / Reskilling — busco mi primera oportunidad" },
      { value: "intermediate", emoji: "🔥", title: "Ya tengo experiencia", desc: "Mid-level — quiero profundizar y especializarme" },
      { value: "advanced",     emoji: "🚀", title: "Soy senior",           desc: "Busco roles de arquitectura, liderazgo o C-level" },
    ],
  },
  {
    question: "¿Cuánto tiempo semanal puedes dedicar?",
    key: "budgetRange",
    options: [
      { value: "low",    emoji: "⚡", title: "2 a 5 horas",      desc: "Aprendizaje ligero, compatible con trabajo full-time" },
      { value: "medium", emoji: "📚", title: "6 a 10 horas",     desc: "Ritmo constante, ideal para la mayoría" },
      { value: "high",   emoji: "🎯", title: "Más de 10 horas",  desc: "Inmersión total, resultados más rápidos" },
    ],
  },
  {
    question: "¿Qué extensión de ruta prefieres?",
    key: "lengthPreference",
    options: [
      { value: "3", emoji: "⚡", title: "Ruta Ágil — 3 cursos",     desc: "Resultados rápidos, foco en habilidades clave" },
      { value: "5", emoji: "🗺️", title: "Ruta Completa — 5 cursos", desc: "Formación sólida y perfil competitivo" },
      { value: "7", emoji: "🏆", title: "Ruta Experto — 7 cursos",  desc: "Dominio profundo, máxima empleabilidad" },
    ],
  },
];

function PassportTab({ student }: { student: Student }) {
  const initials = student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const stampColors = ["#FFD000", "#6C47FF", "#10B981", "#F97316", "#EC4899"];
  const inProgress = student.passport.sellos.filter(s => s.status === "Cursando");
  const certified = student.passport.sellos.filter(s => s.status === "Certificado");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#1A1A1A] rounded-2xl border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#6C47FF] overflow-hidden">
        <div className="bg-[#1A1A1A] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#FFD000] font-mono text-xs font-bold tracking-widest uppercase">Campus Pass</span>
            <span className="text-zinc-500 font-mono text-xs">by VinkU</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded">#{student.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="px-6 py-5 flex items-center gap-4 border-b border-zinc-800">
          <div className="w-14 h-14 rounded-full bg-[#6C47FF] border-4 border-[#FFD000] flex items-center justify-center font-display font-extrabold text-white text-xl shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="font-display font-extrabold text-white text-xl leading-tight">{student.name}</h2>
            <p className="text-zinc-400 text-xs mt-0.5">{student.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-[9px] font-mono font-bold bg-[#FFD000] text-[#1A1A1A] px-2 py-0.5 rounded-full">ACTIVO</span>
              <span className="text-[9px] font-mono font-bold bg-[#6C47FF]/20 text-[#6C47FF] border border-[#6C47FF]/40 px-2 py-0.5 rounded-full">
                {student.passport.sellos.length} SELLOS
              </span>
              {student.diagnosed && (
                <span className="text-[9px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 px-2 py-0.5 rounded-full">
                  DIAGNOSTICADO
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4">
            Universidades visitadas
          </p>
          {student.passport.destinations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-zinc-700 flex items-center justify-center mx-auto mb-3">
                <Plus className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-display font-bold text-sm">Tu pasaporte está en blanco</p>
              <p className="text-zinc-600 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
                Inscríbete en tu primer curso para sellar tu pasaporte educativo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {student.passport.destinations.map((dest, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-full border-4 flex items-center justify-center font-display font-extrabold text-[#1A1A1A] text-lg shadow-[3px_3px_0px_0px_#1A1A1A]"
                    style={{ backgroundColor: stampColors[i % stampColors.length], borderColor: "#1A1A1A" }}
                  >
                    {dest.university.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <p className="text-white text-[9px] font-bold leading-tight line-clamp-2">{dest.university}</p>
                    <p className="text-zinc-500 text-[8px] font-mono mt-0.5">{dest.enrollCount} curso{dest.enrollCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2 opacity-40">
                <div className="w-14 h-14 rounded-full border-4 border-dashed border-zinc-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-zinc-500" />
                </div>
                <p className="text-zinc-600 text-[9px] font-mono text-center">Próxima</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] rounded-xl p-4 text-center">
          <p className="text-3xl font-display font-extrabold text-[#1A1A1A]">{certified.length}</p>
          <p className="text-xs font-bold text-zinc-500 mt-1">Cursos certificados</p>
        </div>
        <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-4 text-center">
          <p className="text-3xl font-display font-extrabold text-[#1A1A1A]">{student.passport.insignias.length}</p>
          <p className="text-xs font-bold text-zinc-500 mt-1">Habilidades ganadas</p>
        </div>
      </div>

      {inProgress.length > 0 && (
        <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] rounded-xl p-5">
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">Cursos en progreso</p>
          <div className="space-y-3">
            {inProgress.map((s, i) => (
              <div key={i} className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1A1A1A] leading-tight">{s.courseTitle}</p>
                    <p className="text-xs text-zinc-500">{s.university}</p>
                  </div>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">Cursando</span>
                </div>
                {/* Datos de entrega */}
                <div className="flex flex-wrap gap-2 pl-5">
                  {s.modality && (
                    <span className="text-[10px] font-bold bg-white border border-amber-300 text-amber-700 px-2 py-0.5 rounded-full">
                      📍 {s.modality}
                    </span>
                  )}
                  {s.startDate && (
                    <span className="text-[10px] font-bold bg-white border border-amber-300 text-amber-700 px-2 py-0.5 rounded-full">
                      📅 Inicio: {new Date(s.startDate).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  )}
                  {s.classroom && (
                    <span className="text-[10px] font-bold bg-white border border-amber-300 text-amber-700 px-2 py-0.5 rounded-full">
                      🏫 {s.classroom}
                    </span>
                  )}
                  {s.accessLink && (
                    <a
                      href={s.accessLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold bg-[#6C47FF] text-white border border-[#6C47FF] px-3 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                    >
                      🔗 Acceder al curso →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {student.passport.sellos.length > 0 && (
        <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl p-5">
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">Todos los sellos</p>
          <div className="flex flex-wrap gap-2">
            {student.passport.sellos.map((sello, i) => (
              <span
                key={i}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] ${
                  sello.status === "Certificado"
                    ? "bg-[#10B981] text-[#1A1A1A]"
                    : "bg-amber-400 text-[#1A1A1A]"
                }`}
              >
                {sello.status === "Certificado" ? "✓" : "●"} {sello.courseTitle}
              </span>
            ))}
          </div>
        </div>
      )}

      {student.passport.insignias.length > 0 ? (
        <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-5">
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">Habilidades ganadas</p>
          <div className="flex flex-wrap gap-2">
            {student.passport.insignias.map((ins, i) => (
              <span key={i} className="text-xs font-bold px-3 py-1 rounded-full bg-[#6C47FF]/20 text-[#6C47FF] border border-[#6C47FF]/40">
                ⭐ {ins.skillName}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-zinc-200 rounded-xl p-5">
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">Habilidades ganadas</p>
          <p className="text-zinc-400 text-xs">Completa cursos para ganar insignias de habilidades.</p>
        </div>
      )}
    </div>
  );
}

function DiagnosticTab({
  diagAnswers,
  setDiagAnswers,
  onDiagnoseSubmit,
  courses,
  student,
  onEnrollCourse,
  setEnrollConfirmCourse,
}: {
  diagAnswers: StudentPortalViewProps["diagAnswers"];
  setDiagAnswers: StudentPortalViewProps["setDiagAnswers"];
  onDiagnoseSubmit: StudentPortalViewProps["onDiagnoseSubmit"];
  courses: Course[];
  student: Student;
  onEnrollCourse: (courseId: string) => void;
  setEnrollConfirmCourse: (c: Course | null) => void;
}) {
  const [step, setStep] = useState(student.diagnosed ? DIAG_STEPS.length : 0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});

  const currentStep = DIAG_STEPS[step];
  const allAnswers = { ...diagAnswers, ...localAnswers };
  const isLastStep = step === DIAG_STEPS.length - 1;

  function selectOption(key: string, value: string) {
    setLocalAnswers(prev => ({ ...prev, [key]: value }));
    setDiagAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    if (isLastStep) {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      onDiagnoseSubmit(fakeEvent).then(() => setStep(DIAG_STEPS.length)).catch(() => setStep(DIAG_STEPS.length));
    } else {
      setStep(s => s + 1);
    }
  }

  const selectedValue = currentStep ? allAnswers[currentStep.key] : null;

  if (step === DIAG_STEPS.length) {
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
    const secondaryCats = categoryMap[diagAnswers.secondaryGoal] ?? [];
    const targetCats = [...new Set([...primaryCats, ...secondaryCats])];

    const suggested = student.suggestedRoute.length > 0
      ? courses.filter(c => student.suggestedRoute.includes(c.id)).slice(0, parseInt(diagAnswers.lengthPreference) || 3)
      : courses.filter(c => targetCats.includes(c.category)).slice(0, parseInt(diagAnswers.lengthPreference) || 3);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] rounded-2xl p-6">
          <p className="text-xs font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1">Tu diagnóstico está listo</p>
          <h2 className="font-display font-extrabold text-[#1A1A1A] text-2xl">¡Ruta personalizada generada!</h2>
          <p className="text-sm text-[#1A1A1A]/70 mt-1">Basada en tus respuestas, esta es la secuencia de aprendizaje óptima para ti.</p>
        </div>

        <div className="space-y-3">
          {suggested.length === 0 ? (
            <div className="bg-white border-2 border-[#1A1A1A] rounded-xl p-6 text-center text-zinc-500 text-sm">
              No hay cursos disponibles para tu perfil aún. ¡Pronto habrá más opciones!
            </div>
          ) : (
            suggested.map((c, i) => {
              const enrolled = student.passport.sellos.some(s => s.courseId === c.id);
              const canAfford = student.walletBalance >= c.cost;
              return (
                <div key={c.id} className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#FFD000] border-2 border-[#1A1A1A] flex items-center justify-center font-display font-extrabold text-[#1A1A1A] shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-[#1A1A1A] leading-tight">{c.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{c.university} · {c.duration}</p>
                    <p className="text-xs font-bold text-[#6C47FF] mt-0.5">{formatCOP(c.cost)}</p>
                  </div>
                  {enrolled ? (
                    <span className="text-xs font-bold text-[#10B981] flex items-center gap-1 shrink-0"><CheckCircle className="w-3.5 h-3.5" /> Inscrito</span>
                  ) : (
                    <button
                      onClick={() => setEnrollConfirmCourse(c)}
                      disabled={!canAfford}
                      title={!canAfford ? "Saldo insuficiente" : undefined}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all shrink-0 ${
                        canAfford
                          ? "bg-[#1A1A1A] text-[#FFD000] border-[#1A1A1A] hover:shadow-[2px_2px_0px_0px_#FFD000]"
                          : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? "Inscribir" : "Sin saldo"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => { setStep(0); setLocalAnswers({}); }}
          className="w-full py-3 border-2 border-[#1A1A1A] rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          Volver a hacer el diagnóstico
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono font-bold text-zinc-500">Paso {step + 1} de {DIAG_STEPS.length}</span>
          <span className="text-xs font-mono text-zinc-400">{Math.round(((step + 1) / DIAG_STEPS.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden border border-[#1A1A1A]">
          <div
            className="h-full bg-[#FFD000] transition-all duration-500"
            style={{ width: `${((step + 1) / DIAG_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="font-display font-extrabold text-[#1A1A1A] text-2xl leading-tight">
        {currentStep.question}
      </h2>

      <div className="space-y-3">
        {currentStep.options.map(opt => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => selectOption(currentStep.key, opt.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                isSelected
                  ? "bg-[#FFD000] border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] -translate-x-0.5 -translate-y-0.5"
                  : "bg-white border-zinc-200 hover:border-[#1A1A1A] hover:shadow-[2px_2px_0px_0px_#1A1A1A]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-[#1A1A1A]">{opt.title}</p>
                  <p className={`text-xs mt-0.5 ${isSelected ? "text-[#1A1A1A]/70" : "text-zinc-500"}`}>{opt.desc}</p>
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-[#1A1A1A] shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {selectedValue && (
        <button
          onClick={handleNext}
          className="w-full py-3.5 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] hover:shadow-[6px_6px_0px_0px_#6C47FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 animate-fade-in"
        >
          {isLastStep ? "Ver mi ruta →" : "Siguiente →"}
        </button>
      )}
    </div>
  );
}

interface WalletTx {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

function WalletTab({
  student,
  rechargeAmt,
  setRechargeAmt,
  rechargeSource,
  setRechargeSource,
  onWalletRecharge,
  userId,
  triggerToast,
  fetchState,
}: {
  student: Student;
  rechargeAmt: string;
  setRechargeAmt: (v: string) => void;
  rechargeSource: string;
  setRechargeSource: (v: string) => void;
  onWalletRecharge: (e: React.FormEvent) => Promise<void>;
  userId: string;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => void;
}) {
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  async function loadTransactions() {
    setLoadingTx(true);
    try {
      const data = await fetchWalletTransactions(userId);
      setTransactions((data as WalletTx[]).slice(0, 10));
    } catch {
      triggerToast("No se pudieron cargar las transacciones", "error");
    } finally {
      setLoadingTx(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleRecharge(e: React.FormEvent) {
    await onWalletRecharge(e);
    await loadTransactions();
    fetchState();
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-md">
      <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] rounded-2xl p-6">
        <p className="text-xs font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1">Saldo disponible</p>
        <p className="font-display font-extrabold text-[#1A1A1A] text-3xl">{formatCOP(student.walletBalance)}</p>
        <p className="text-xs text-[#1A1A1A]/60 mt-1">Crédito aprobado: {formatCOP(student.creditApproved)}</p>
      </div>

      {student.walletBalance === 0 && (
        <div className="bg-[#FFD000]/10 border-2 border-[#1A1A1A] rounded-xl p-4">
          <p className="text-sm font-bold text-[#1A1A1A]">Tu billetera está vacía. Recarga para poder matricularte en cursos.</p>
        </div>
      )}

      <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-5">
        <h3 className="font-display font-bold text-sm text-[#1A1A1A] mb-4">Recargar billetera</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {[100000, 300000, 500000, 1000000].map(amt => (
            <button
              key={amt}
              onClick={() => setRechargeAmt(String(amt))}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${
                rechargeAmt === String(amt)
                  ? "bg-[#1A1A1A] text-[#FFD000] border-[#1A1A1A] shadow-[2px_2px_0px_0px_#6C47FF]"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-[#1A1A1A]"
              }`}
            >
              {amt >= 1000000 ? "1M" : `${(amt / 1000).toFixed(0)}k`} COP
            </button>
          ))}
        </div>
        <form onSubmit={handleRecharge} className="space-y-3">
          <input
            type="number"
            value={rechargeAmt}
            onChange={e => setRechargeAmt(e.target.value)}
            placeholder="Monto en COP"
            min={1000}
            className="w-full border-2 border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:shadow-[2px_2px_0px_0px_#FFD000]"
          />
          <select
            value={rechargeSource}
            onChange={e => setRechargeSource(e.target.value)}
            className="w-full border-2 border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
          >
            <option value="">Selecciona medio de pago</option>
            <option value="PSE">PSE</option>
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
            <option value="Tarjeta">Tarjeta de crédito/débito</option>
          </select>
          <button type="submit" className="w-full py-3 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] hover:shadow-[6px_6px_0px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm">
            Recargar billetera
          </button>
        </form>
      </div>

      <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm text-[#1A1A1A]">Últimas transacciones</h3>
          <button onClick={loadTransactions} className="text-zinc-400 hover:text-[#6C47FF] transition-colors">
            <RefreshCw className={`w-4 h-4 ${loadingTx ? "animate-spin" : ""}`} />
          </button>
        </div>
        {loadingTx ? (
          <div className="py-6 text-center">
            <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-zinc-400 text-xs text-center py-4">Sin transacciones registradas aún.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A1A1A] truncate">{tx.description ?? tx.type}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">{formatDate(tx.created_at)}</p>
                </div>
                <span className={`text-xs font-extrabold font-mono shrink-0 ml-3 ${tx.amount >= 0 ? "text-[#10B981]" : "text-red-500"}`}>
                  {tx.amount >= 0 ? "+" : ""}{formatCOP(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SessionRow {
  id: string;
  mentor_name: string;
  topic: string;
  scheduled_at: string;
  zoom_link: string | null;
  status?: string;
}

function FellowshipTab({
  fellowshipForm,
  setFellowshipForm,
  onBookFellowship,
  userId,
  triggerToast,
  fetchState,
}: {
  fellowshipForm: { mentorName: string; topic: string; dateTime: string };
  setFellowshipForm: StudentPortalViewProps["setFellowshipForm"];
  onBookFellowship: (e: React.FormEvent) => Promise<void>;
  userId: string;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => void;
}) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  async function loadSessions() {
    setLoadingSessions(true);
    try {
      const data = await fetchMentorSessions(userId);
      setSessions(data as SessionRow[]);
    } catch {
      triggerToast("No se pudieron cargar las mentorías", "error");
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleBook(e: React.FormEvent) {
    await onBookFellowship(e);
    await loadSessions();
    fetchState();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#6C47FF]/10 border-2 border-[#6C47FF]/40 rounded-xl p-4 flex items-start gap-3">
        <span className="text-lg">🎓</span>
        <p className="text-xs text-[#1A1A1A] font-bold leading-relaxed">
          Sesiones gratuitas en tu plan Campus Pass. Conéctate con expertos y acelera tu aprendizaje.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MENTORS.map(mentor => (
          <div
            key={mentor.name}
            onClick={() => setFellowshipForm((prev) => ({ ...prev, mentorName: mentor.name }))}
            className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${
              fellowshipForm.mentorName === mentor.name
                ? "border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] -translate-x-0.5 -translate-y-0.5"
                : "border-zinc-200 hover:border-[#1A1A1A]"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#6C47FF] flex items-center justify-center font-display font-bold text-white text-sm mb-3">
              {mentor.initials}
            </div>
            <p className="font-display font-bold text-sm text-[#1A1A1A]">{mentor.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{mentor.expertise}</p>
            {fellowshipForm.mentorName === mentor.name && (
              <span className="text-[10px] font-bold text-[#10B981] mt-2 block">✓ Seleccionado</span>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleBook} className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-5 space-y-4 max-w-md">
        <h3 className="font-display font-bold text-sm text-[#1A1A1A]">
          Agendar sesión{fellowshipForm.mentorName ? ` con ${fellowshipForm.mentorName}` : ""}
        </h3>
        <input
          value={fellowshipForm.topic}
          onChange={e => setFellowshipForm(p => ({ ...p, topic: e.target.value }))}
          placeholder="¿Sobre qué tema quieres la mentoría?"
          className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        />
        <input
          type="datetime-local"
          value={fellowshipForm.dateTime}
          onChange={e => setFellowshipForm(p => ({ ...p, dateTime: e.target.value }))}
          className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={!fellowshipForm.mentorName || !fellowshipForm.topic || !fellowshipForm.dateTime}
          className="w-full py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Confirmar sesión
        </button>
      </form>

      {sessions.length > 0 && (
        <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl p-5 max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm text-[#1A1A1A]">Mentorías agendadas</h3>
            <button onClick={loadSessions} className="text-zinc-400 hover:text-[#6C47FF] transition-colors">
              <RefreshCw className={`w-4 h-4 ${loadingSessions ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="space-y-3">
            {sessions.map(sess => (
              <div key={sess.id} className="p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-[#1A1A1A]">{sess.mentor_name}</p>
                  {sess.status && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-[#6C47FF]/10 text-[#6C47FF] border-[#6C47FF]/30 shrink-0">{sess.status}</span>
                  )}
                </div>
                <p className="text-xs text-zinc-600">{sess.topic}</p>
                <p className="text-[10px] font-mono text-zinc-400">{formatDate(sess.scheduled_at)}</p>
                {sess.zoom_link && (
                  <a href={sess.zoom_link} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#6C47FF] hover:underline flex items-center gap-1">
                    Ir a Zoom <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioTab({
  student,
  onAddGoal,
  newGoalText,
  setNewGoalText,
  newGoalProducts,
  setNewGoalProducts,
  triggerToast,
  fetchState,
}: {
  student: Student;
  onAddGoal: (e: React.FormEvent) => Promise<void>;
  newGoalText: string;
  setNewGoalText: (v: string) => void;
  newGoalProducts: string;
  setNewGoalProducts: (v: string) => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");

  async function handleStatusChange(id: string, status: "Definido" | "En Progreso" | "Cumplido") {
    setUpdatingId(id);
    try {
      await updateAchievement(id, { status });
      triggerToast("Estado actualizado", "success");
      fetchState();
    } catch {
      triggerToast("Error actualizando estado", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAddGoal(e: React.FormEvent) {
    await onAddGoal(e);
    setEvidenceUrl("");
    fetchState();
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-3">
        {student.passport.logros.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center">
            <Target className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
            <p className="font-display font-bold text-sm text-zinc-500">Aún no tienes logros registrados</p>
            <p className="text-xs text-zinc-400 mt-1">Agrega tus metas y proyectos destacados para construir tu portafolio</p>
          </div>
        ) : (
          student.passport.logros.map((logro) => (
            <div key={logro.id} className="bg-white border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm text-[#1A1A1A]">{logro.goal}</p>
                  {logro.associatedProducts.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-1">{logro.associatedProducts.join(" · ")}</p>
                  )}
                </div>
                <select
                  value={logro.status}
                  disabled={updatingId === logro.id}
                  onChange={e => handleStatusChange(logro.id, e.target.value as "Definido" | "En Progreso" | "Cumplido")}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border-2 shrink-0 focus:outline-none cursor-pointer ${
                    logro.status === "Cumplido" ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40"
                      : logro.status === "En Progreso" ? "bg-amber-400/10 text-amber-600 border-amber-400/40"
                      : "bg-zinc-100 text-zinc-500 border-zinc-200"
                  }`}
                >
                  <option value="Definido">Definido</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Cumplido">Cumplido</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddGoal} className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] rounded-xl p-5 space-y-3 max-w-md">
        <h3 className="font-display font-bold text-sm text-[#1A1A1A]">Agregar nuevo logro</h3>
        <input
          value={newGoalText}
          onChange={e => setNewGoalText(e.target.value)}
          placeholder="Describe tu meta u hito (ej: Diseñar una API REST)"
          className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        />
        <input
          value={newGoalProducts}
          onChange={e => setNewGoalProducts(e.target.value)}
          placeholder="Productos o entregables (ej: Código en GitHub, diagrama)"
          className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        />
        <input
          type="url"
          value={evidenceUrl}
          onChange={e => setEvidenceUrl(e.target.value)}
          placeholder="URL de evidencia (opcional)"
          className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        />
        <button type="submit" disabled={!newGoalText} className="w-full py-2.5 bg-[#FFD000] text-[#1A1A1A] font-display font-bold rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
          Agregar al portafolio
        </button>
      </form>
    </div>
  );
}

export default function StudentPortalView({
  student,
  courses,
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
  fetchState,
}: StudentPortalViewProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [levelFilter, setLevelFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState<"default" | "precio_asc" | "precio_desc" | "reciente">("default");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [docConfirmCourse, setDocConfirmCourse] = useState<Course | null>(null);
  const [enrollConfirmCourse, setEnrollConfirmCourse] = useState<Course | null>(null);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <RefreshCw className="w-8 h-8 text-[#6C47FF] animate-spin" />
        <p className="text-sm font-bold text-zinc-500 font-mono">Cargando tu perfil...</p>
      </div>
    );
  }

  const categories = ["Todos", ...Array.from(new Set(courses.map(c => c.category)))];
  const levels = ["Todos", "Pregrado", "Posgrado", "Educación Continua"];

  const filteredCourses = courses
    .filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.university.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "Todos" || c.category === categoryFilter;
      const matchLevel = levelFilter === "Todos" || c.level === levelFilter;
      return matchSearch && matchCat && matchLevel;
    })
    .sort((a, b) => {
      if (sortBy === "precio_asc") return a.cost - b.cost;
      if (sortBy === "precio_desc") return b.cost - a.cost;
      return 0;
    });

  // Títulos de cursos certificados por el estudiante (para validar prerrequisitos)
  const certifiedTitles = student.passport.sellos
    .filter(s => s.status === "Certificado")
    .map(s => s.courseTitle);

  // Resuelve los títulos de los cursos prerrequisito a partir de sus IDs
  const resolvePrereqTitles = (ids: string[]) =>
    ids.map(id => courses.find(c => c.id === id)?.title).filter(Boolean) as string[];

  const tabs = [
    { id: "pass", label: "Mi Pasaporte", icon: Award },
    { id: "diag", label: "Diagnóstico", icon: Compass },
    { id: "market", label: "Cursos", icon: BookOpen },
    { id: "wallet", label: "Billetera", icon: Wallet },
    { id: "fellowship", label: "Mentorías", icon: Calendar },
    { id: "portfolio", label: "Portafolio", icon: Briefcase },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 border-b-2 border-[#1A1A1A]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = studentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStudentTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border-2 transition-all shrink-0 ${
                isActive
                  ? "bg-[#FFD000] text-[#1A1A1A] border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {studentTab === "pass" && <PassportTab student={student} />}

      {studentTab === "diag" && (
        <DiagnosticTab
          diagAnswers={diagAnswers}
          setDiagAnswers={setDiagAnswers}
          onDiagnoseSubmit={onDiagnoseSubmit}
          courses={courses}
          student={student}
          onEnrollCourse={onEnrollCourse}
          setEnrollConfirmCourse={setEnrollConfirmCourse}
        />
      )}

      {studentTab === "market" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cursos o universidades..."
                className="w-full pl-9 pr-4 py-2.5 border-2 border-[#1A1A1A] rounded-xl text-sm focus:outline-none focus:shadow-[2px_2px_0px_0px_#FFD000] bg-white"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="border-2 border-[#1A1A1A] rounded-xl px-4 py-2.5 text-xs font-bold bg-white focus:outline-none"
            >
              <option value="default">Orden por defecto</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-zinc-400 self-center mr-1 uppercase">Categoría:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all ${
                  categoryFilter === cat
                    ? "bg-[#1A1A1A] text-[#FFD000] border-[#1A1A1A]"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-[#1A1A1A]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-zinc-400 self-center mr-1 uppercase">Nivel:</span>
            {levels.map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all ${
                  levelFilter === lvl
                    ? "bg-[#6C47FF] text-white border-[#6C47FF]"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-[#6C47FF]"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {courses.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-zinc-100 border-2 border-zinc-200 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-10 bg-zinc-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-200 rounded w-1/2" />
                    <div className="h-8 bg-zinc-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => {
                const canAfford = student.walletBalance >= course.cost;
                const enrolled = student.passport.sellos.some(s => s.courseId === course.id);
                const isExpanded = expandedCourse === course.id;
                const prereqIds = course.prerequisites ?? [];
                const prereqTitles = resolvePrereqTitles(prereqIds);
                const missingPrereqs = prereqTitles.filter(t => !certifiedTitles.includes(t));
                const blockedByPrereq = missingPrereqs.length > 0;
                const reqDocs = course.requiredDocs ?? [];
                return (
                  <div key={course.id} className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl overflow-hidden flex flex-col">
                    <div className="bg-[#FFD000] px-4 py-2 border-b-2 border-[#1A1A1A]">
                      <p className="text-[10px] font-mono font-bold text-[#1A1A1A]/70 uppercase truncate">{course.university}</p>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-3">
                      <h3 className="font-display font-bold text-sm text-[#1A1A1A] leading-tight">{course.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded-full">{course.level}</span>
                        <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded-full">{course.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {course.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="text-[9px] font-bold bg-[#6C47FF]/10 text-[#6C47FF] px-2 py-0.5 rounded-full border border-[#6C47FF]/20">{skill}</span>
                        ))}
                      </div>
                      {prereqTitles.length > 0 && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border w-fit ${blockedByPrereq ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          Requiere: {prereqTitles.join(", ")}
                        </span>
                      )}
                      {course.maxSeats != null && (
                        <span className="text-[9px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded-full w-fit">
                          Cupos: {course.maxSeats}
                        </span>
                      )}
                      {isExpanded && reqDocs.length > 0 && (
                        <div className="flex flex-wrap gap-1 border-t border-zinc-100 pt-2">
                          <span className="text-[9px] font-bold text-zinc-400 self-center uppercase w-full">Deberás presentar:</span>
                          {reqDocs.map(doc => (
                            <span key={doc} className="text-[9px] font-bold bg-[#FFD000]/20 text-[#1A1A1A] border border-[#FFD000] px-2 py-0.5 rounded-full">{doc}</span>
                          ))}
                        </div>
                      )}
                      {course.description && (
                        <div>
                          <button
                            onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                            className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-[#6C47FF] transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isExpanded ? "Ocultar descripción" : "Ver descripción"}
                          </button>
                          {isExpanded && (
                            <p className="text-xs text-zinc-600 mt-2 leading-relaxed border-t border-zinc-100 pt-2">{course.description}</p>
                          )}
                        </div>
                      )}
                      <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
                        <span className="font-display font-extrabold text-[#1A1A1A] text-sm">{formatCOP(course.cost)}</span>
                        {enrolled ? (
                          <span className="text-xs font-bold text-[#10B981] flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Inscrito</span>
                        ) : (
                          <button
                            onClick={() => {
                              if (reqDocs.length > 0) setDocConfirmCourse(course);
                              else setEnrollConfirmCourse(course);
                            }}
                            disabled={!canAfford || blockedByPrereq}
                            title={blockedByPrereq ? `Completa primero: ${missingPrereqs.join(", ")}` : !canAfford ? "Saldo insuficiente para este curso" : undefined}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${
                              canAfford && !blockedByPrereq
                                ? "bg-[#1A1A1A] text-[#FFD000] border-[#1A1A1A] hover:shadow-[2px_2px_0px_0px_#FFD000]"
                                : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                            }`}
                          >
                            {blockedByPrereq ? `Completa primero: ${missingPrereqs[0]}` : canAfford ? "Inscribir" : "Saldo insuficiente"}
                          </button>
                        )}
                      </div>
                      {!canAfford && !enrolled && (
                        <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5 flex-wrap">
                          <span>Necesitas {formatCOP(course.cost - student.walletBalance)} más.</span>
                          <button
                            onClick={() => setStudentTab("wallet")}
                            className="underline text-[#6C47FF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                          >
                            Ir a Billetera
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredCourses.length === 0 && (
                <div className="col-span-full text-center py-12 text-zinc-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm">No hay cursos para esta búsqueda</p>
                </div>
              )}
            </div>
          )}

          {enrollConfirmCourse && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] rounded-2xl max-w-md w-full space-y-0 animate-fade-in overflow-hidden">
                <div className="bg-[#FFD000] px-6 py-4 border-b-4 border-[#1A1A1A]">
                  <p className="text-[10px] font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-widest">Confirmar inscripción</p>
                  <h3 className="text-base font-extrabold text-[#1A1A1A] leading-tight mt-0.5">{enrollConfirmCourse.title}</h3>
                  <p className="text-xs font-bold text-[#1A1A1A]/70 mt-0.5">{enrollConfirmCourse.university}</p>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {/* Datos de entrega del curso */}
                  <div className="grid grid-cols-2 gap-3">
                    {enrollConfirmCourse.modality && (
                      <div className="bg-zinc-50 border-2 border-zinc-200 rounded-xl p-3">
                        <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase mb-1">Modalidad</p>
                        <p className="text-xs font-extrabold text-[#1A1A1A]">📍 {enrollConfirmCourse.modality}</p>
                      </div>
                    )}
                    {enrollConfirmCourse.startDate && (
                      <div className="bg-zinc-50 border-2 border-zinc-200 rounded-xl p-3">
                        <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase mb-1">Fecha de inicio</p>
                        <p className="text-xs font-extrabold text-[#1A1A1A]">📅 {formatDate(enrollConfirmCourse.startDate)}</p>
                      </div>
                    )}
                    <div className="bg-zinc-50 border-2 border-zinc-200 rounded-xl p-3">
                      <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase mb-1">Duración</p>
                      <p className="text-xs font-extrabold text-[#1A1A1A]">⏱ {enrollConfirmCourse.duration}</p>
                    </div>
                    <div className="bg-zinc-50 border-2 border-zinc-200 rounded-xl p-3">
                      <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase mb-1">Nivel</p>
                      <p className="text-xs font-extrabold text-[#1A1A1A]">🎓 {enrollConfirmCourse.level}</p>
                    </div>
                  </div>

                  {enrollConfirmCourse.classroom && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                      <p className="text-[9px] font-mono font-bold text-blue-400 uppercase mb-1">Salón / Sede</p>
                      <p className="text-xs font-extrabold text-[#1A1A1A]">🏫 {enrollConfirmCourse.classroom}</p>
                    </div>
                  )}

                  {enrollConfirmCourse.accessLink && (
                    <div className="bg-[#6C47FF]/10 border-2 border-[#6C47FF]/30 rounded-xl p-3">
                      <p className="text-[9px] font-mono font-bold text-[#6C47FF]/70 uppercase mb-1">Acceso al curso</p>
                      <a
                        href={enrollConfirmCourse.accessLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-extrabold text-[#6C47FF] hover:underline flex items-center gap-1"
                      >
                        🔗 Ver plataforma →
                      </a>
                    </div>
                  )}

                  {(enrollConfirmCourse.requiredDocs ?? []).length > 0 && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                      <p className="text-[9px] font-mono font-bold text-amber-500 uppercase mb-2">Documentos requeridos</p>
                      <ul className="space-y-1">
                        {(enrollConfirmCourse.requiredDocs ?? []).map(doc => (
                          <li key={doc} className="text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-amber-500 shrink-0" /> {doc}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[9px] text-amber-600 mt-2">La universidad te contactará para validar estos documentos.</p>
                    </div>
                  )}

                  {enrollConfirmCourse.skills.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase mb-2">Habilidades que ganarás</p>
                      <div className="flex flex-wrap gap-1">
                        {enrollConfirmCourse.skills.map(skill => (
                          <span key={skill} className="text-[9px] font-bold bg-[#6C47FF]/10 text-[#6C47FF] px-2 py-0.5 rounded-full border border-[#6C47FF]/20">⭐ {skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-[#FFD000]/20 border-2 border-[#1A1A1A] rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Costo total</p>
                      <p className="text-xl font-extrabold text-[#1A1A1A]">{formatCOP(enrollConfirmCourse.cost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Tu saldo</p>
                      <p className="text-sm font-bold text-[#10B981]">{formatCOP(student.walletBalance)}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => setEnrollConfirmCourse(null)}
                    className="flex-1 border-2 border-zinc-200 text-zinc-500 font-bold py-3 rounded-xl hover:border-zinc-300 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => { const id = enrollConfirmCourse.id; setEnrollConfirmCourse(null); onEnrollCourse(id); }}
                    className="flex-1 bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] text-[#1A1A1A] font-extrabold py-3 rounded-xl hover:shadow-[6px_6px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm"
                  >
                    Confirmar inscripción →
                  </button>
                </div>
              </div>
            </div>
          )}

          {docConfirmCourse && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-in">
                <h3 className="text-base font-extrabold text-[#1A1A1A]">Documentos requeridos</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Para <span className="font-bold">{docConfirmCourse.title}</span> deberás presentar los siguientes documentos. La universidad te contactará a tu correo para validarlos antes de iniciar.
                </p>
                <ul className="space-y-1.5">
                  {(docConfirmCourse.requiredDocs ?? []).map(doc => (
                    <li key={doc} className="text-xs font-bold text-[#1A1A1A] flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#6C47FF]" /> {doc}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3 pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => setDocConfirmCourse(null)}
                    className="flex-1 border-2 border-zinc-200 text-zinc-500 font-bold py-3 rounded-xl hover:border-zinc-300 cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => { const course = docConfirmCourse; setDocConfirmCourse(null); setEnrollConfirmCourse(course); }}
                    className="flex-1 bg-[#FFD000] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] text-[#1A1A1A] font-extrabold py-3 rounded-xl cursor-pointer hover:bg-yellow-400 transition-all"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {studentTab === "wallet" && user && (
        <WalletTab
          student={student}
          rechargeAmt={rechargeAmt}
          setRechargeAmt={setRechargeAmt}
          rechargeSource={rechargeSource}
          setRechargeSource={setRechargeSource}
          onWalletRecharge={onWalletRecharge}
          userId={user.id}
          triggerToast={triggerToast}
          fetchState={fetchState}
        />
      )}

      {studentTab === "fellowship" && user && (
        <FellowshipTab
          fellowshipForm={fellowshipForm}
          setFellowshipForm={setFellowshipForm}
          onBookFellowship={onBookFellowship}
          userId={user.id}
          triggerToast={triggerToast}
          fetchState={fetchState}
        />
      )}

      {studentTab === "portfolio" && (
        <PortfolioTab
          student={student}
          onAddGoal={onAddGoal}
          newGoalText={newGoalText}
          setNewGoalText={setNewGoalText}
          newGoalProducts={newGoalProducts}
          setNewGoalProducts={setNewGoalProducts}
          triggerToast={triggerToast}
          fetchState={fetchState}
        />
      )}
    </div>
  );
}
