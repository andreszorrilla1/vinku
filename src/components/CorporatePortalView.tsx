import React, { useState, useEffect } from "react";
import {
  Users, Wallet, Compass, TrendingUp, Building, Upload,
  Mail, CheckCircle, AlertCircle, Clock, Plus, X, BarChart3,
  Map, Search
} from "lucide-react";
import { Employee, Course } from "../types";

interface CorporatePortalViewProps {
  corporate: { budgetLeft: number; employees: Employee[] };
  courses: Course[];
  corpTab: "dashboard" | "talent" | "wallet" | "diagnosis";
  setCorpTab: (tab: any) => void;
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

export default function CorporatePortalView({
  corporate,
  courses,
  corpTab,
  setCorpTab,
  triggerToast,
  fetchState,
}: CorporatePortalViewProps) {
  const [isRegistered, setIsRegistered] = useState(
    () =>
      localStorage.getItem("vinku_corp_registered") === "true" ||
      corporate.employees.length > 0 ||
      corporate.budgetLeft > 0
  );
  useEffect(() => {
    if (corporate.employees.length > 0 || corporate.budgetLeft > 0) {
      setIsRegistered(true);
    }
  }, [corporate.employees.length, corporate.budgetLeft]);

  const [regForm, setRegForm] = useState({ company: "", nit: "", industry: "", size: "", contact: "", email: "" });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [talentView, setTalentView] = useState<"map" | "table">("map");
  const [search, setSearch] = useState("");
  const [rechargeAmt, setRechargeAmt] = useState("1000000");
  const [bulkEmails, setBulkEmails] = useState("");

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

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regForm.company || !regForm.email) { triggerToast("Completa los campos obligatorios", "error"); return; }
    localStorage.setItem("vinku_corp_registered", "true");
    setIsRegistered(true);
    triggerToast("¡Empresa registrada exitosamente en Campus Pass!", "success");
  }

  function handleRecharge(e: React.FormEvent) {
    e.preventDefault();
    triggerToast(`Recarga de ${formatCOP(Number(rechargeAmt))} procesada`, "success");
  }

  function handleAssignCredits(emp: Employee) {
    triggerToast(`Créditos asignados a ${emp.name}`, "success");
    setSelectedEmployee(null);
  }

  function handleBulkDiagnosis(e: React.FormEvent) {
    e.preventDefault();
    const emails = bulkEmails.split("\n").filter(Boolean);
    triggerToast(`Invitaciones enviadas a ${emails.length} colaboradores`, "success");
    setBulkEmails("");
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "talent", label: "Talento", icon: Users },
    { id: "wallet", label: "Billetera", icon: Wallet },
    { id: "diagnosis", label: "Diagnóstico", icon: Compass },
  ] as const;

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
        <form onSubmit={handleRegister} className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-6 space-y-4">
          {[
            { key: "company", label: "Nombre de la empresa *", placeholder: "Ej: Bancolombia S.A." },
            { key: "nit", label: "NIT", placeholder: "Ej: 890.903.938-8" },
            { key: "industry", label: "Sector / Industria", placeholder: "Ej: Tecnología, Financiero..." },
            { key: "size", label: "Número de empleados", placeholder: "Ej: 150" },
            { key: "contact", label: "Nombre del contacto", placeholder: "Tu nombre completo" },
            { key: "email", label: "Correo corporativo *", placeholder: "contacto@empresa.com.co" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-bold text-zinc-600 block mb-1">{f.label}</label>
              <input
                value={regForm[f.key as keyof typeof regForm]}
                onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              />
            </div>
          ))}
          <button type="submit" className="w-full py-3.5 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:shadow-[6px_6px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm">
            Registrar empresa →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
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

      {corpTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Presupuesto disponible", value: formatCOP(budgetLeft), icon: Wallet, shadow: "#FFD000" },
              { label: "Total colaboradores", value: String(employees.length), icon: Users, shadow: "#6C47FF" },
              { label: "Pendiente diagnóstico", value: String(pending), icon: AlertCircle, shadow: "#F97316" },
              { label: "Completaron ruta", value: String(enrolled), icon: CheckCircle, shadow: "#10B981" },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white border-2 border-[#1A1A1A] rounded-xl p-4" style={{ boxShadow: `4px 4px 0px 0px ${kpi.shadow}` }}>
                  <Icon className="w-5 h-5 text-zinc-400 mb-2" />
                  <p className="font-display font-extrabold text-xl text-[#1A1A1A]">{kpi.value}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setCorpTab("diagnosis")}
              className="bg-[#1A1A1A] text-[#FFD000] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] rounded-xl p-4 text-left hover:shadow-[6px_6px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <Compass className="w-6 h-6 mb-2" />
              <p className="font-display font-bold text-sm">Lanzar diagnóstico masivo</p>
              <p className="text-xs text-[#FFD000]/60 mt-0.5">Invita a todo el equipo por correo</p>
            </button>
            <button
              onClick={() => setCorpTab("talent")}
              className="bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-4 text-left hover:shadow-[6px_6px_0px_0px_#6C47FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <Map className="w-6 h-6 mb-2 text-[#6C47FF]" />
              <p className="font-display font-bold text-sm">Ver mapa de talento</p>
              <p className="text-xs text-zinc-500 mt-0.5">Visualiza el avance del equipo</p>
            </button>
          </div>

          <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl overflow-hidden">
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
            <div className="flex gap-2">
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
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-zinc-300 rounded-xl p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="font-display font-bold text-zinc-500">No hay colaboradores aún</p>
              <p className="text-xs text-zinc-400 mt-1">Carga el primer equipo desde la consola de diagnóstico</p>
              <button onClick={() => setCorpTab("diagnosis")} className="mt-4 px-4 py-2 bg-[#FFD000] text-[#1A1A1A] font-bold text-xs rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]">
                Ir a diagnóstico →
              </button>
            </div>
          ) : talentView === "map" ? (
            <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
              {departments.map(dept => {
                const deptEmployees = filteredEmployees.filter(e => (e.department || "Sin área") === dept);
                return (
                  <div key={dept} className="shrink-0 w-56 bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl overflow-hidden">
                    <div className="bg-[#1A1A1A] px-3 py-2.5 flex items-center justify-between">
                      <p className="text-[11px] font-bold text-[#FFD000] truncate">{dept}</p>
                      <span className="text-[10px] font-mono text-zinc-500 ml-2 shrink-0">{deptEmployees.length}</span>
                    </div>
                    <div className="p-2 space-y-2 max-h-96 overflow-y-auto no-scrollbar">
                      {deptEmployees.map((emp, i) => {
                        const colors = getStatusColor(emp.diagStatus);
                        const initials = emp.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                        return (
                          <button
                            key={emp.id}
                            onClick={() => setSelectedEmployee(emp)}
                            className="w-full text-left bg-zinc-50 hover:bg-[#FFD000]/10 border border-zinc-200 hover:border-[#1A1A1A] rounded-lg p-2.5 transition-all"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold text-[#1A1A1A] shrink-0"
                                style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                              >
                                {initials}
                              </div>
                              <p className="text-[11px] font-bold text-[#1A1A1A] truncate flex-1">{emp.name}</p>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${colors.bg}`} />
                            </div>
                            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6C47FF] rounded-full" style={{ width: `${emp.progress}%` }} />
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
            <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#1A1A1A] bg-zinc-50">
                      {["Colaborador", "Departamento", "Estado", "Progreso", "Presupuesto", ""].map(h => (
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
                              onClick={() => setSelectedEmployee(emp)}
                              className="px-2 py-1 bg-[#FFD000] text-[#1A1A1A] font-bold rounded border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] hover:shadow-[3px_3px_0px_0px_#1A1A1A] transition-all text-[10px]"
                            >
                              Ver →
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

      {corpTab === "wallet" && (
        <div className="space-y-5 animate-fade-in max-w-md">
          <div className="bg-[#FFD000] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] rounded-2xl p-6">
            <p className="text-xs font-mono font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1">Presupuesto disponible</p>
            <p className="font-display font-extrabold text-[#1A1A1A] text-3xl">{formatCOP(budgetLeft)}</p>
          </div>
          <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-5">
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
              <input
                type="number"
                value={rechargeAmt}
                onChange={e => setRechargeAmt(e.target.value)}
                placeholder="Monto en COP"
                className="w-full border-2 border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              />
              <button type="submit" className="w-full py-3 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm">
                Recargar presupuesto
              </button>
            </form>
          </div>
        </div>
      )}

      {corpTab === "diagnosis" && (
        <div className="space-y-5 animate-fade-in max-w-lg">
          <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-5 h-5 text-[#6C47FF]" />
              <h3 className="font-display font-bold text-sm text-[#1A1A1A]">Cargar equipo por CSV</h3>
            </div>
            <div className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center hover:border-[#1A1A1A] transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
              <p className="text-sm font-bold text-zinc-500">Arrastra tu archivo CSV aquí</p>
              <p className="text-xs text-zinc-400 mt-1">Columnas: nombre, correo, departamento, cargo</p>
              <button className="mt-3 px-4 py-2 bg-zinc-100 text-zinc-600 font-bold text-xs rounded-lg border border-zinc-200 hover:bg-zinc-200 transition-colors">
                Seleccionar archivo
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#6C47FF] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-[#6C47FF]" />
              <h3 className="font-display font-bold text-sm text-[#1A1A1A]">Invitar por correo electrónico</h3>
            </div>
            <form onSubmit={handleBulkDiagnosis} className="space-y-3">
              <textarea
                value={bulkEmails}
                onChange={e => setBulkEmails(e.target.value)}
                placeholder={"juan@empresa.com\nmaria@empresa.com\ncamilo@empresa.com"}
                rows={5}
                className="w-full border-2 border-zinc-200 focus:border-[#1A1A1A] rounded-xl px-4 py-3 text-sm focus:outline-none font-mono resize-none"
              />
              <p className="text-[11px] text-zinc-400">Un correo por línea. Cada persona recibirá una invitación para completar su diagnóstico.</p>
              <button type="submit" disabled={!bulkEmails.trim()} className="w-full py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                Enviar invitaciones →
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pendientes", count: pending, color: "border-zinc-300" },
              { label: "Ruta lista", count: withRoute, color: "border-amber-400" },
              { label: "Matriculados", count: enrolled, color: "border-[#10B981]" },
            ].map(s => (
              <div key={s.label} className={`bg-white border-2 ${s.color} rounded-xl p-3 text-center`}>
                <p className="font-display font-extrabold text-xl text-[#1A1A1A]">{s.count}</p>
                <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <p className="text-sm font-bold text-[#1A1A1A]">{selectedEmployee.role || "Sin especificar"} · {selectedEmployee.department}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">Estado</p>
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
              {selectedEmployee.activePath.length > 0 && (
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
            </div>

            <button
              onClick={() => handleAssignCredits(selectedEmployee)}
              disabled={selectedEmployee.diagStatus !== "Ruta Generada"}
              className="w-full mt-6 py-3 bg-[#FFD000] text-[#1A1A1A] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              Asignar créditos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
