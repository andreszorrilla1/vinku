import React, { useState, useEffect } from "react";
import {
  Users, Wallet, Compass, TrendingUp, Building,
  Mail, CheckCircle, AlertCircle, X, BarChart3,
  Map, Search, Plus, RefreshCw
} from "lucide-react";
import { Employee, Course } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import * as api from "../lib/api";
import type { Database } from "../lib/database.types";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type WalletTransaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
};

interface CorporatePortalViewProps {
  corporate: { budgetLeft: number; employees: Employee[] };
  courses: Course[];
  corpTab: "dashboard" | "talent" | "wallet" | "diagnosis";
  setCorpTab: (tab: "dashboard" | "talent" | "wallet" | "diagnosis") => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => void;
}

function formatCOP(n: number) {
  return `$${n.toLocaleString("es-CO")} COP`;
}

function getStatusColor(status: Employee["diagStatus"]) {
  if (status === "Matriculado") return { bg: "bg-[#10B981]", text: "text-[#10B981]", light: "bg-[#10B981]/10 border-[#10B981]/30" };
  if (status === "Ruta Generada") return { bg: "bg-amber-400", text: "text-amber-500", light: "bg-amber-400/10 border-amber-400/30" };
  return { bg: "bg-zinc-400", text: "text-zinc-500", light: "bg-zinc-100 border-zinc-200" };
}

const AVATAR_COLORS = ["#FFD000", "#6C47FF", "#10B981", "#F97316", "#EC4899", "#06B6D4"];

const SECTOR_OPTIONS = [
  "Financiero", "Tecnología", "Salud", "Educación", "Manufactura",
  "Retail", "Construcción", "Energía", "Logística", "Servicios",
];

export default function CorporatePortalView(props: CorporatePortalViewProps) {
  const { user, role } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#FFD000] rounded-2xl p-10 max-w-sm w-full text-center">
          <Building className="w-10 h-10 mx-auto mb-4 text-[#1A1A1A]" />
          <h2 className="font-display font-extrabold text-[#1A1A1A] text-xl mb-2">Portal empresarial</h2>
          <p className="text-sm text-zinc-600 mb-6">Inicia sesión para acceder al portal empresarial de Campus Pass.</p>
          <button
            onClick={() => props.triggerToast("Redirigiendo al inicio de sesión...", "info")}
            className="w-full py-3 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (role !== "corporate_admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#6C47FF] rounded-2xl p-10 max-w-sm w-full text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-[#6C47FF]" />
          <h2 className="font-display font-extrabold text-[#1A1A1A] text-xl mb-2">Acceso restringido</h2>
          <p className="text-sm text-zinc-600">Este portal es exclusivo para empresas aliadas de Campus Pass.</p>
        </div>
      </div>
    );
  }

  return <CorporatePortalInner {...props} userId={user.id} userEmail={user.email ?? ""} />;
}

// ─── Inner component (only renders when role === corporate_admin) ─────────────

function CorporatePortalInner({
  corporate,
  courses,
  corpTab,
  setCorpTab,
  triggerToast,
  fetchState,
  userId,
  userEmail,
}: CorporatePortalViewProps & { userId: string; userEmail: string }) {
  // ── company state ──────────────────────────────────────────────────────────
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyRow | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [regLoading, setRegLoading] = useState(true);

  // registration form
  const [regForm, setRegForm] = useState({
    contactName: "", company: "", nit: "", city: "", sector: "", employees: "",
  });

  // wallet
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [rechargeAmt, setRechargeAmt] = useState("1000000");
  const [payMethod, setPayMethod] = useState<"PSE" | "Tarjeta" | "Transferencia">("PSE");

  // talent
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [talentView, setTalentView] = useState<"map" | "table">("map");
  const [search, setSearch] = useState("");

  // budget assignment in drawer
  const [budgetAssignAmt, setBudgetAssignAmt] = useState("");

  // employee enrollment history in drawer
  const [empEnrollments, setEmpEnrollments] = useState<Awaited<ReturnType<typeof api.fetchEnrollments>>>([]);
  const [loadingEmpEnrollments, setLoadingEmpEnrollments] = useState(false);

  // add employee modal
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [empDept, setEmpDept] = useState("");
  const [empBudget, setEmpBudget] = useState("0");

  // csv upload
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Array<{name:string;email:string;role:string;department:string;budget:string}>>([]);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // diagnosis
  const [diagObjective, setDiagObjective] = useState("Identificar brechas de habilidades técnicas");
  const [diagDeadline, setDiagDeadline] = useState("");
  const [showDiagConfirm, setShowDiagConfirm] = useState(false);
  const [diagSentAt, setDiagSentAt] = useState<string | null>(null);

  // ── on mount: resolve company ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setRegLoading(true);
      try {
        const profile = await api.fetchProfile(userId);
        if (!profile || cancelled) return;
        if (profile.company_id) {
          setCompanyId(profile.company_id);
          const company = await api.fetchCompany(profile.company_id);
          if (company && !cancelled) {
            setCompanyInfo(company);
            setIsRegistered(true);
          }
        }
      } finally {
        if (!cancelled) setRegLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [userId]);

  // ── fetch transactions when companyId is known ────────────────────────────
  useEffect(() => {
    if (!companyId) return;
    loadTransactions(companyId);
  }, [companyId]);

  async function loadTransactions(cid: string) {
    try {
      const rows = await api.fetchCorporateTransactions(cid);
      setTransactions(rows.map(r => ({
        id: r.id,
        amount: r.amount,
        type: r.type,
        description: r.description ?? null,
        created_at: r.created_at,
      })));
    } catch {
      // silently ignore
    }
  }

  // ── registration ───────────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regForm.contactName || !regForm.company) {
      triggerToast("Completa los campos obligatorios", "error");
      return;
    }
    try {
      const { data: company, error } = await supabase
        .from("companies")
        .insert({
          name: regForm.company,
          nit: regForm.nit || null,
          industry: regForm.sector || null,
          size_employees: parseInt(regForm.employees) || null,
          contact_name: regForm.contactName,
          contact_email: userEmail,
          wallet_balance: 0,
        })
        .select("id, name, nit, industry, size_employees, contact_name, contact_email, wallet_balance, created_at, updated_at")
        .single();

      if (error || !company) {
        triggerToast("Error al registrar empresa", "error");
        return;
      }

      await supabase.from("profiles").update({ company_id: company.id }).eq("id", userId);
      setCompanyId(company.id);
      setCompanyInfo(company);
      setIsRegistered(true);
      triggerToast("¡Empresa registrada exitosamente!", "success");
    } catch {
      triggerToast("Error al registrar empresa", "error");
    }
  }

  // ── recharge ───────────────────────────────────────────────────────────────
  async function handleRecharge(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    const amount = Number(rechargeAmt);
    if (!amount || amount <= 0) {
      triggerToast("Ingresa un monto válido", "error");
      return;
    }
    try {
      const newBalance = await api.rechargeCorporateWallet(companyId, amount);
      setCompanyInfo(prev => prev ? { ...prev, wallet_balance: newBalance } : prev);
      setRechargeAmt("1000000");
      triggerToast(`Recarga de ${formatCOP(amount)} procesada`, "success");
      await loadTransactions(companyId);
    } catch {
      triggerToast("Error al procesar recarga", "error");
    }
  }

  // ── open employee drawer with enrollment history ──────────────────────────
  async function openEmployeeDrawer(emp: Employee) {
    setSelectedEmployee(emp);
    setEmpEnrollments([]);
    setLoadingEmpEnrollments(true);
    try {
      const data = await api.fetchEnrollments(emp.id);
      setEmpEnrollments(data);
    } catch {
      // silently ignore — enrollment history is supplementary
    } finally {
      setLoadingEmpEnrollments(false);
    }
  }

  // ── assign budget ──────────────────────────────────────────────────────────
  async function handleAssignBudget() {
    if (!selectedEmployee) return;
    const amount = parseInt(budgetAssignAmt);
    if (!amount || amount <= 0) {
      triggerToast("Ingresa un monto válido", "error");
      return;
    }
    try {
      await api.assignEmployeeBudget(selectedEmployee.id, amount);
      triggerToast(`Presupuesto asignado a ${selectedEmployee.name}`, "success");
      fetchState();
      setSelectedEmployee(null);
      setBudgetAssignAmt("");
    } catch {
      triggerToast("Error al asignar presupuesto", "error");
    }
  }

  // ── add employee ───────────────────────────────────────────────────────────
  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    if (!empName || !empEmail) {
      triggerToast("Nombre y correo son obligatorios", "error");
      return;
    }
    try {
      await api.addEmployee({
        company_id: companyId,
        name: empName,
        email: empEmail,
        role_title: empRole || null,
        department: empDept || null,
        diag_status: "Pendiente",
        active_path: null,
        progress_pct: 0,
        assigned_budget: parseInt(empBudget) || 0,
        suggested_route_cost: null,
      });
      triggerToast(`${empName} agregado al equipo`, "success");
      fetchState();
      setShowAddEmployeeModal(false);
      setEmpName(""); setEmpEmail(""); setEmpRole(""); setEmpDept(""); setEmpBudget("0");
    } catch {
      triggerToast("Error al agregar empleado", "error");
    }
  }

  function parseCSV(text: string): Array<{name:string;email:string;role:string;department:string;budget:string}> {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    return lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return {
        name: cols[0] ?? '',
        email: cols[1] ?? '',
        role: cols[2] ?? '',
        department: cols[3] ?? '',
        budget: cols[4] ?? '0',
      };
    }).filter(r => r.name && r.email);
  }

  function downloadTemplate() {
    const csv = 'Nombre,Correo,Cargo,Departamento,Presupuesto COP\nJuan García,juan@empresa.com,Desarrollador,Tecnología,500000\nMaría López,maria@empresa.com,Diseñadora,Producto,400000';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'plantilla_empleados_vinku.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleCsvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvPreview(parseCSV(text));
    };
    reader.readAsText(file, 'UTF-8');
  }

  async function handleImportCsv() {
    if (!companyId || csvPreview.length === 0) return;
    setUploadingCsv(true);
    try {
      for (const row of csvPreview) {
        await api.addEmployee({
          company_id: companyId,
          name: row.name,
          email: row.email,
          role_title: row.role || null,
          department: row.department || null,
          diag_status: "Pendiente",
          active_path: null,
          progress_pct: 0,
          assigned_budget: parseInt(row.budget) || 0,
          suggested_route_cost: null,
        });
      }
      triggerToast(`${csvPreview.length} empleados importados exitosamente`, "success");
      fetchState();
      setShowCsvModal(false);
      setCsvPreview([]);
      setCsvFile(null);
    } catch {
      triggerToast("Error al importar empleados", "error");
    } finally {
      setUploadingCsv(false);
    }
  }

  function handleBulkDiagnosis(e: React.FormEvent) {
    e.preventDefault();
    if (employees.length === 0) {
      triggerToast("Primero agrega empleados para enviar el diagnóstico.", "error");
      return;
    }
    setShowDiagConfirm(true);
  }

  async function handleConfirmBulkDiagnosis() {
    setShowDiagConfirm(false);
    if (!companyId) return;
    try {
      await api.sendBulkDiagnosis(companyId, diagObjective, diagDeadline || null);
      const now = new Date().toLocaleString("es-CO");
      setDiagSentAt(now);
      triggerToast(`Diagnóstico masivo enviado a ${employees.filter(e => e.diagStatus === "Pendiente").length} empleados pendientes.`, "success");
      fetchState();
    } catch {
      triggerToast("Error al enviar el diagnóstico. Intenta de nuevo.", "error");
    }
  }

  // ── derived ────────────────────────────────────────────────────────────────
  const { employees, budgetLeft } = corporate;
  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.department || "").toLowerCase().includes(search.toLowerCase())
  );
  const departments = Array.from(new Set(employees.map(e => e.department || "Sin área")));
  const pending = employees.filter(e => e.diagStatus === "Pendiente").length;
  const withRoute = employees.filter(e => e.diagStatus === "Ruta Generada").length;
  const enrolled = employees.filter(e => e.diagStatus === "Matriculado").length;
  const completados = employees.filter(e => e.diagStatus !== "Pendiente").length;
  const totalEnrollments = employees.reduce((sum, e) => sum + (e.activePath?.length ?? 0), 0);
  const walletBalance = companyInfo?.wallet_balance ?? budgetLeft;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "talent", label: "Talento", icon: Users },
    { id: "wallet", label: "Billetera", icon: Wallet },
    { id: "diagnosis", label: "Diagnóstico", icon: Compass },
  ] as const;

  // ── loading splash ─────────────────────────────────────────────────────────
  if (regLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-zinc-500 animate-pulse">Cargando portal empresarial…</p>
      </div>
    );
  }

  // ── registration form ──────────────────────────────────────────────────────
  if (!isRegistered) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] rounded-2xl p-6 mb-6">
          <Building className="w-8 h-8 text-[#1A1A1A] mb-2" />
          <h2 className="font-display font-extrabold text-[#1A1A1A] text-xl">Registra tu empresa</h2>
          <p className="text-sm text-[#1A1A1A]/70 mt-1">
            Accede al portal corporativo de Campus Pass y empieza a desarrollar el talento de tu equipo.
          </p>
        </div>
        <form onSubmit={handleRegister} className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-xl p-6 space-y-4">
          {/* Nombre del contacto */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Nombre del contacto *</label>
            <input
              value={regForm.contactName}
              onChange={ev => setRegForm(p => ({ ...p, contactName: ev.target.value }))}
              placeholder="Tu nombre completo"
              className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
            />
          </div>
          {/* Nombre de la empresa */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Nombre de la empresa *</label>
            <input
              value={regForm.company}
              onChange={ev => setRegForm(p => ({ ...p, company: ev.target.value }))}
              placeholder="Ej: Bancolombia S.A."
              className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
            />
          </div>
          {/* NIT */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">NIT</label>
            <input
              value={regForm.nit}
              onChange={ev => setRegForm(p => ({ ...p, nit: ev.target.value }))}
              placeholder="Ej: 890.903.938-8"
              className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
            />
          </div>
          {/* Ciudad */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Ciudad</label>
            <input
              value={regForm.city}
              onChange={ev => setRegForm(p => ({ ...p, city: ev.target.value }))}
              placeholder="Ej: Bogotá, Medellín..."
              className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
            />
          </div>
          {/* Sector */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Sector</label>
            <select
              value={regForm.sector}
              onChange={ev => setRegForm(p => ({ ...p, sector: ev.target.value }))}
              className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white transition-colors"
            >
              <option value="">Selecciona un sector...</option>
              {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Número de empleados */}
          <div>
            <label className="text-xs font-bold text-zinc-600 block mb-1">Número de empleados</label>
            <input
              type="number"
              value={regForm.employees}
              onChange={ev => setRegForm(p => ({ ...p, employees: ev.target.value }))}
              placeholder="Ej: 500"
              className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
            />
          </div>
          <button type="submit" className="w-full py-3.5 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:shadow-[6px_6px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm">
            Registrar empresa →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#FAFAFA]">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 border-b-2 border-[#1A1A1A]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = corpTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCorpTab(tab.id)}
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

      {/* Company info header */}
      {companyInfo && (
        <div className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
          <span><span className="font-bold text-[#1A1A1A]">Empresa:</span> {companyInfo.name}</span>
          {companyInfo.nit && <span><span className="font-bold text-[#1A1A1A]">NIT:</span> {companyInfo.nit}</span>}
          {companyInfo.industry && <span><span className="font-bold text-[#1A1A1A]">Sector:</span> {companyInfo.industry}</span>}
          {companyInfo.size_employees != null && <span><span className="font-bold text-[#1A1A1A]">Empleados:</span> {companyInfo.size_employees}</span>}
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {corpTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Presupuesto disponible", value: formatCOP(walletBalance), icon: Wallet, shadow: "#FFD000" },
              { label: "Empleados activos", value: String(employees.length), icon: Users, shadow: "#6C47FF" },
              { label: "Diagnósticos completados", value: String(completados), icon: CheckCircle, shadow: "#10B981" },
              { label: "Cursos activos", value: String(totalEnrollments), icon: TrendingUp, shadow: "#F97316" },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white border-4 border-[#1A1A1A] rounded-xl p-4" style={{ boxShadow: `4px 4px 0px 0px ${kpi.shadow}` }}>
                  <Icon className="w-5 h-5 text-zinc-400 mb-2" />
                  <p className="font-display font-extrabold text-xl text-[#1A1A1A]">{kpi.value}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Acciones rápidas</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => setCorpTab("talent")} className="bg-white text-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-4 text-left hover:shadow-[6px_6px_0px_0px_#6C47FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <Map className="w-6 h-6 mb-2 text-[#6C47FF]" />
                <p className="font-display font-bold text-sm">Ver talento</p>
                <p className="text-xs text-zinc-500 mt-0.5">Mapa del equipo</p>
              </button>
              <button onClick={() => setCorpTab("wallet")} className="bg-white text-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] rounded-xl p-4 text-left hover:shadow-[6px_6px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <Wallet className="w-6 h-6 mb-2 text-amber-500" />
                <p className="font-display font-bold text-sm">Billetera</p>
                <p className="text-xs text-zinc-500 mt-0.5">Recargar presupuesto</p>
              </button>
              <button onClick={() => setCorpTab("diagnosis")} className="bg-[#1A1A1A] text-[#FFD000] border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] rounded-xl p-4 text-left hover:shadow-[6px_6px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <Compass className="w-6 h-6 mb-2" />
                <p className="font-display font-bold text-sm">Diagnóstico</p>
                <p className="text-xs text-[#FFD000]/60 mt-0.5">Consola masiva</p>
              </button>
            </div>
          </div>

          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b-2 border-[#1A1A1A] bg-zinc-50">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Distribución del equipo</p>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {[
                { label: "Pendiente", count: pending, color: "bg-zinc-200 text-zinc-600" },
                { label: "Ruta generada", count: withRoute, color: "bg-amber-100 text-amber-700" },
                { label: "Matriculados", count: enrolled, color: "bg-[#10B981]/10 text-[#10B981]" },
              ].map(s => (
                <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${s.color}`}>
                  <span className="font-display font-extrabold text-lg">{s.count}</span>
                  <span className="text-xs font-bold">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TALENTO ── */}
      {corpTab === "talent" && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar colaborador..."
                className="w-full pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTalentView("map")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-2 transition-all ${talentView === "map" ? "bg-[#1A1A1A] text-[#FFD000] border-[#1A1A1A]" : "bg-white text-zinc-500 border-zinc-200 hover:border-[#1A1A1A]"}`}
              >
                <Map className="w-3.5 h-3.5" /> Mapa
              </button>
              <button
                onClick={() => setTalentView("table")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-2 transition-all ${talentView === "table" ? "bg-[#1A1A1A] text-[#FFD000] border-[#1A1A1A]" : "bg-white text-zinc-500 border-zinc-200 hover:border-[#1A1A1A]"}`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Tabla
              </button>
              <button
                onClick={() => setShowAddEmployeeModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-2 bg-[#FFD000] text-[#1A1A1A] border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] hover:shadow-[3px_3px_0px_0px_#1A1A1A] transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar empleado
              </button>
              <button
                onClick={() => setShowCsvModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-2 bg-white text-[#1A1A1A] border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] hover:shadow-[3px_3px_0px_0px_#1A1A1A] transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Cargar CSV
              </button>
              <button
                onClick={() => {
                  if (employees.length === 0) { triggerToast("Primero agrega empleados.", "error"); return; }
                  setShowDiagConfirm(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-2 bg-[#6C47FF] text-white border-[#6C47FF] hover:opacity-90 transition-all"
              >
                <Mail className="w-3.5 h-3.5" /> Enviar Diagnóstico Masivo
              </button>
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-zinc-300 rounded-xl p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="font-display font-bold text-zinc-500">Aún no hay empleados registrados.</p>
              <p className="text-xs text-zinc-400 mt-1">Agrega tu primer colaborador para comenzar.</p>
            </div>
          ) : talentView === "map" ? (
            <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
              {departments.map(dept => {
                const deptEmployees = filteredEmployees.filter(e => (e.department || "Sin área") === dept);
                return (
                  <div key={dept} className="shrink-0 w-56 bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl overflow-hidden">
                    <div className="bg-[#1A1A1A] px-3 py-2.5 flex items-center justify-between">
                      <p className="text-[11px] font-bold text-[#FFD000] truncate">{dept}</p>
                      <span className="text-[10px] font-mono text-zinc-400 ml-2 shrink-0">{deptEmployees.length}</span>
                    </div>
                    <div className="p-2 space-y-2 max-h-96 overflow-y-auto no-scrollbar">
                      {deptEmployees.map((emp, i) => {
                        const colors = getStatusColor(emp.diagStatus);
                        const initials = emp.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                        return (
                          <button
                            key={emp.id}
                            onClick={() => openEmployeeDrawer(emp)}
                            className="w-full text-left bg-zinc-50 hover:bg-[#FFD000]/10 border border-zinc-200 hover:border-[#1A1A1A] rounded-lg p-2.5 transition-all"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold text-[#1A1A1A] shrink-0"
                                style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                              >
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-[#1A1A1A] truncate">{emp.name}</p>
                                <p className="text-[9px] text-zinc-400 truncate">{emp.role || "—"}</p>
                              </div>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${colors.bg}`} />
                            </div>
                            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6C47FF] rounded-full" style={{ width: `${emp.progress}%` }} />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${colors.light} ${colors.text}`}>{emp.diagStatus}</span>
                              <span className="text-[9px] text-zinc-400">{emp.progress}%</span>
                            </div>
                          </button>
                        );
                      })}
                      {deptEmployees.length === 0 && (
                        <p className="text-[10px] text-zinc-400 text-center py-4">Sin resultados</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#1A1A1A] bg-zinc-50">
                      {["Empleado", "Cargo", "Dpto", "Diagnóstico", "Progreso", "Presupuesto COP", ""].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-bold text-zinc-600 uppercase tracking-wider text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(emp => {
                      const colors = getStatusColor(emp.diagStatus);
                      return (
                        <tr key={emp.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-bold text-[#1A1A1A]">{emp.name}</p>
                            <p className="text-zinc-400 text-[10px]">{emp.email}</p>
                          </td>
                          <td className="px-4 py-3 text-zinc-600">{emp.role || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-bold">{emp.department || "—"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full font-bold border text-[10px] ${colors.light} ${colors.text}`}>{emp.diagStatus}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#6C47FF] rounded-full" style={{ width: `${emp.progress}%` }} />
                              </div>
                              <span className="font-bold text-[#1A1A1A]">{emp.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-[#10B981]">{formatCOP(emp.assignedBudget)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openEmployeeDrawer(emp)}
                              className="px-2 py-1 bg-[#FFD000] text-[#1A1A1A] font-bold rounded border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] hover:shadow-[3px_3px_0px_0px_#1A1A1A] transition-all text-[10px]"
                            >
                              Ver →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 text-xs">Sin resultados para &quot;{search}&quot;</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BILLETERA ── */}
      {corpTab === "wallet" && (
        <div className="space-y-5 animate-fade-in max-w-md">
          <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] rounded-2xl p-6">
            <p className="text-xs font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1">Presupuesto disponible</p>
            <p className="font-display font-extrabold text-[#1A1A1A] text-3xl">{formatCOP(walletBalance)}</p>
          </div>

          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-xl p-5">
            <h3 className="font-display font-bold text-sm text-[#1A1A1A] mb-4">Recargar presupuesto corporativo</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {[1000000, 3000000, 5000000, 10000000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setRechargeAmt(String(amt))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${
                    rechargeAmt === String(amt) ? "bg-[#1A1A1A] text-[#FFD000] border-[#1A1A1A]" : "bg-white text-zinc-600 border-zinc-200 hover:border-[#1A1A1A]"
                  }`}
                >
                  ${(amt / 1000000).toFixed(0)}M
                </button>
              ))}
            </div>
            <form onSubmit={handleRecharge} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">Monto (COP)</label>
                <input
                  type="number"
                  value={rechargeAmt}
                  onChange={e => setRechargeAmt(e.target.value)}
                  placeholder="Monto en COP"
                  className="w-full border-2 border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">Método de pago</label>
                <div className="flex gap-2">
                  {(["PSE", "Tarjeta", "Transferencia"] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${payMethod === m ? "bg-[#FFD000] text-[#1A1A1A] border-[#1A1A1A]" : "bg-white text-zinc-500 border-zinc-200 hover:border-[#1A1A1A]"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm">
                Recargar presupuesto
              </button>
            </form>
          </div>

          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b-2 border-[#1A1A1A] bg-zinc-50 flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Últimas transacciones</p>
              <button
                onClick={() => companyId && loadTransactions(companyId)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-zinc-500 hover:text-[#1A1A1A] border border-zinc-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Actualizar
              </button>
            </div>
            <div className="divide-y divide-zinc-100">
              {transactions.length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-zinc-400">Sin transacciones aún</p>
              )}
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A]">{tx.description ?? tx.type}</p>
                    <p className="text-[10px] text-zinc-400">{new Date(tx.created_at).toLocaleDateString("es-CO")}</p>
                  </div>
                  <span className={`text-xs font-extrabold ${tx.amount >= 0 ? "text-[#10B981]" : "text-red-500"}`}>
                    {tx.amount >= 0 ? "+" : ""}{formatCOP(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DIAGNÓSTICO ── */}
      {corpTab === "diagnosis" && (
        <div className="space-y-5 animate-fade-in max-w-2xl">
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#FFD000] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-[#6C47FF]" />
              <h3 className="font-display font-bold text-sm text-[#1A1A1A]">Enviar diagnóstico a todo el equipo</h3>
            </div>
            <form onSubmit={handleBulkDiagnosis} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">Objetivo del diagnóstico</label>
                <select
                  value={diagObjective}
                  onChange={e => setDiagObjective(e.target.value)}
                  className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
                >
                  <option>Identificar brechas de habilidades técnicas</option>
                  <option>Evaluar competencias de liderazgo</option>
                  <option>Detectar necesidades de upskilling digital</option>
                  <option>Alinear equipos con objetivos estratégicos</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">Fecha límite</label>
                <input
                  type="date"
                  value={diagDeadline}
                  onChange={e => setDiagDeadline(e.target.value)}
                  className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm">
                Lanzar Diagnóstico Masivo →
              </button>
            </form>
            {diagSentAt && (
              <p className="text-[10px] text-zinc-400 font-mono mt-2">Último envío: {diagSentAt}</p>
            )}
          </div>

          {showDiagConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDiagConfirm(false)}>
              <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm" />
              <div
                className="relative w-full max-w-sm bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#FFD000] rounded-2xl p-6 animate-fade-in text-center space-y-4"
                onClick={e => e.stopPropagation()}
              >
                <Compass className="w-8 h-8 text-[#6C47FF] mx-auto" />
                <h3 className="font-display font-extrabold text-[#1A1A1A] text-lg">Confirmar envío masivo</h3>
                <p className="text-sm text-zinc-600">
                  Se enviará el cuestionario de diagnóstico a <strong>{employees.length} empleado{employees.length !== 1 ? "s" : ""}</strong>. ¿Confirmas?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDiagConfirm(false)}
                    className="flex-1 py-2.5 border-2 border-zinc-200 rounded-xl text-sm font-bold text-zinc-500 hover:border-[#1A1A1A] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmBulkDiagnosis}
                    className="flex-1 py-2.5 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm"
                  >
                    Confirmar →
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pendientes", count: pending, color: "border-zinc-300" },
              { label: "Ruta lista", count: withRoute, color: "border-amber-400" },
              { label: "Matriculados", count: enrolled, color: "border-[#10B981]" },
            ].map(s => (
              <div key={s.label} className={`bg-white border-4 ${s.color} rounded-xl p-3 text-center`}>
                <p className="font-display font-extrabold text-xl text-[#1A1A1A]">{s.count}</p>
                <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {employees.length > 0 && (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#6C47FF] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b-2 border-[#1A1A1A] bg-zinc-50">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Estado por colaborador</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      {["Empleado", "Departamento", "Estado diagnóstico", ""].map(h => (
                        <th key={h} className="text-left px-4 py-2 font-bold text-zinc-500 text-[10px] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...employees]
                      .sort((a, b) => {
                        const order: Record<Employee["diagStatus"], number> = { "Pendiente": 0, "Ruta Generada": 1, "Matriculado": 2 };
                        return order[a.diagStatus] - order[b.diagStatus];
                      })
                      .map(emp => {
                        const colors = getStatusColor(emp.diagStatus);
                        return (
                          <tr key={emp.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                            <td className="px-4 py-3 font-bold text-[#1A1A1A]">
                              <p>{emp.name}</p>
                              <p className="text-[10px] font-normal text-zinc-400">{emp.email}</p>
                            </td>
                            <td className="px-4 py-3 text-zinc-600">{emp.department || "—"}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full font-bold border text-[10px] ${colors.light} ${colors.text}`}>{emp.diagStatus}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openEmployeeDrawer(emp)}
                                className="px-2 py-1 bg-[#6C47FF] text-white font-bold rounded border-2 border-[#6C47FF] hover:opacity-80 transition-all text-[10px]"
                              >
                                Ver perfil
                              </button>
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

      {/* ── EMPLOYEE DRAWER ── */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end" onClick={() => setSelectedEmployee(null)}>
          <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm" />
          <div
            className="relative w-full sm:w-96 bg-white border-l-4 border-t-4 sm:border-4 border-[#1A1A1A] shadow-[-8px_0px_0px_0px_#6C47FF] sm:shadow-[-8px_8px_0px_0px_#6C47FF] h-full sm:h-auto sm:rounded-2xl p-6 overflow-y-auto no-scrollbar animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedEmployee(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#6C47FF] flex items-center justify-center font-display font-extrabold text-white text-lg">
                {selectedEmployee.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-display font-extrabold text-[#1A1A1A]">{selectedEmployee.name}</p>
                <p className="text-xs text-zinc-500">{selectedEmployee.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">Cargo</p>
                <p className="text-sm font-bold text-[#1A1A1A]">{selectedEmployee.role || "Sin especificar"} · {selectedEmployee.department || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">Estado diagnóstico</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(selectedEmployee.diagStatus).light} ${getStatusColor(selectedEmployee.diagStatus).text}`}>
                  {selectedEmployee.diagStatus}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">Progreso académico</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
                    <div className="h-full bg-[#6C47FF] rounded-full" style={{ width: `${selectedEmployee.progress}%` }} />
                  </div>
                  <span className="font-display font-extrabold text-[#1A1A1A] text-sm">{selectedEmployee.progress}%</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">Presupuesto asignado</p>
                <p className="font-display font-extrabold text-[#10B981] text-lg">{formatCOP(selectedEmployee.assignedBudget)}</p>
              </div>
              {(selectedEmployee.activePath?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">Ruta activa</p>
                  <div className="space-y-1">
                    {selectedEmployee.activePath.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                        <span className="w-4 h-4 rounded-full bg-[#FFD000] border border-[#1A1A1A] flex items-center justify-center text-[9px] font-bold text-[#1A1A1A]">{i + 1}</span>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enrollment history */}
              <div className="border-t-2 border-zinc-100 pt-4">
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">Cursos matriculados</p>
                {loadingEmpEnrollments ? (
                  <p className="text-xs text-zinc-400 italic">Cargando historial...</p>
                ) : empEnrollments.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Sin matrículas registradas.</p>
                ) : (
                  <div className="space-y-2">
                    {empEnrollments.map((e: any) => (
                      <div key={e.id} className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs">
                        <p className="font-bold text-[#1A1A1A] leading-tight">{e.courses?.title ?? "Curso"}</p>
                        <p className="text-zinc-500">{e.courses?.universities?.name ?? ""}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] border ${e.status === "Certificado" ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]" : "bg-[#6C47FF]/10 border-[#6C47FF]/30 text-[#6C47FF]"}`}>
                            {e.status}
                          </span>
                          {e.courses?.modality && <span className="text-zinc-400">{e.courses.modality}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget assignment — always enabled */}
              <div className="border-t-2 border-zinc-100 pt-4">
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">Asignar presupuesto adicional</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={budgetAssignAmt}
                    onChange={e => setBudgetAssignAmt(e.target.value)}
                    placeholder="Monto COP"
                    className="flex-1 border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                  <button
                    onClick={handleAssignBudget}
                    className="px-4 py-2 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm"
                  >
                    Asignar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD EMPLOYEE MODAL ── */}
      {/* ── CSV UPLOAD MODAL ── */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCsvModal(false)}>
          <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#6C47FF] rounded-2xl p-6 animate-fade-in overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowCsvModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-extrabold text-[#1A1A1A] text-lg mb-2">Importar empleados desde CSV</h3>
            <p className="text-xs text-zinc-500 mb-4">El archivo CSV debe tener las columnas: Nombre, Correo, Cargo, Departamento, Presupuesto COP</p>
            <div className="space-y-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold border-2 border-[#1A1A1A] rounded-xl bg-white hover:bg-zinc-50 transition-all shadow-[2px_2px_0px_0px_#1A1A1A]"
              >
                Descargar plantilla CSV
              </button>
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">Seleccionar archivo CSV</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              {csvPreview.length > 0 && (
                <div className="overflow-x-auto">
                  <p className="text-xs font-bold text-zinc-600 mb-2">{csvPreview.length} empleado(s) detectados:</p>
                  <table className="w-full text-xs border-2 border-[#1A1A1A] rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-zinc-100 border-b-2 border-[#1A1A1A]">
                        {["Nombre", "Correo", "Cargo", "Departamento", "Presupuesto COP"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-bold text-zinc-600 text-[10px] uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className="border-b border-zinc-100 last:border-0">
                          <td className="px-3 py-2 font-bold text-[#1A1A1A]">{row.name}</td>
                          <td className="px-3 py-2 text-zinc-500">{row.email}</td>
                          <td className="px-3 py-2 text-zinc-500">{row.role || "—"}</td>
                          <td className="px-3 py-2 text-zinc-500">{row.department || "—"}</td>
                          <td className="px-3 py-2 text-zinc-500">{Number(row.budget).toLocaleString("es-CO")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {csvPreview.length > 0 && (
                <button
                  onClick={handleImportCsv}
                  disabled={uploadingCsv}
                  className="w-full py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {uploadingCsv ? "Importando..." : `Importar ${csvPreview.length} empleados →`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddEmployeeModal(false)}>
          <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#FFD000] rounded-2xl p-6 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowAddEmployeeModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-extrabold text-[#1A1A1A] text-lg mb-5">Agregar colaborador</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Nombre completo *</label>
                  <input value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Ana Gómez" className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Correo electrónico *</label>
                  <input type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} placeholder="ana@empresa.com" className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Cargo</label>
                  <input value={empRole} onChange={e => setEmpRole(e.target.value)} placeholder="Analista de datos" className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Departamento</label>
                  <input value={empDept} onChange={e => setEmpDept(e.target.value)} placeholder="Tecnología" className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-600 block mb-1">Presupuesto asignado (COP)</label>
                  <input type="number" value={empBudget} onChange={e => setEmpBudget(e.target.value)} placeholder="0" className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm">
                Agregar colaborador →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
