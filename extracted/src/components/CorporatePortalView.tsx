import React, { useState, useMemo } from "react";
import {
  Briefcase,
  Layers,
  Users,
  Wallet,
  Search,
  Plus,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  Award,
  Compass,
  Building,
  ArrowRight,
  Lock,
  Sparkles,
  MapPin,
  Calendar,
  X,
  PlusCircle,
  ChevronRight,
  GraduationCap,
  Shield,
  FileCode,
  Check
} from "lucide-react";
import { Employee, Course } from "../types";

interface CorporatePortalViewProps {
  corporate: {
    budgetLeft: number;
    employees: Employee[];
    transactions?: any[];
  } | null;
  courses: Course[];
  corpTab: "dashboard" | "talent" | "wallet" | "diagnosis";
  setCorpTab: (tab: "dashboard" | "talent" | "wallet" | "diagnosis") => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  fetchState: () => Promise<void>;
}

export default function CorporatePortalView({
  corporate,
  courses,
  corpTab,
  setCorpTab,
  triggerToast,
  fetchState
}: CorporatePortalViewProps) {
  // Registration form state
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return localStorage.getItem("vinku_corp_registered") === "true";
  });
  
  const [regForm, setRegForm] = useState({
    companyName: localStorage.getItem("vinku_corp_name") || "",
    nit: localStorage.getItem("vinku_corp_nit") || "",
    email: localStorage.getItem("vinku_corp_email") || "",
    size: "51-200",
    password: "",
    confirmPassword: ""
  });

  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Quick Funding Input
  const [rechargeAmount, setRechargeAmount] = useState("5000");
  const [isRecharging, setIsRecharging] = useState(false);

  // Bulk Diagnostics Input
  const [bulkEmails, setBulkEmails] = useState(
    "diego.maradona@vinkupass.com, shakira@vinkupass.com, messi.leo@vinkupass.com\npedro.almodovar@vinkupass.com"
  );
  const [bulkDepartment, setBulkDepartment] = useState("Tecnología");
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // Talent filter/search
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("todos");

  // Budget allocation modal
  const [activeBudgetEmployee, setActiveBudgetEmployee] = useState<Employee | null>(null);
  const [transferAmount, setTransferAmount] = useState("1200");
  const [isAssigningBudget, setIsAssigningBudget] = useState(false);
  const [isAssignSuccess, setIsAssignSuccess] = useState(false);

  // Audited passport state (Read-Only Vinkupass copy view)
  const [auditedEmployee, setAuditedEmployee] = useState<Employee | null>(null);

  // Retrieve current statistics
  const walletBalance = corporate?.budgetLeft ?? 7500;
  const employees = corporate?.employees ?? [];
  const transactions = corporate?.transactions ?? [
    { id: "tx-1", date: "2026-06-03", type: "Carga de fondos", amount: 5000, detail: "Fondeo inicial de cuenta corporativa", status: "Completado" },
    { id: "tx-2", date: "2026-06-03", type: "Dispersión a colaborador", amount: 450, detail: "Esteban Córdoba (SRE Junior)", status: "Completado" },
    { id: "tx-3", date: "2026-06-04", type: "Dispersión a colaborador", amount: 1000, detail: "Laura Restrepo (Frontend Dev)", status: "Completado" },
    { id: "tx-4", date: "2026-06-04", type: "Dispersión a colaborador", amount: 890, detail: "Gabriel Medina (Product Marketer)", status: "Completado" },
    { id: "tx-5", date: "2026-06-04", type: "Dispersión a colaborador", amount: 1100, detail: "Sofía Martínez (Analista Datos)", status: "Completado" }
  ];

  // Calculations for KPI
  const budgetFundedTotal = useMemo(() => {
    // Total historical funding is initial + all 'Carga de fondos' sum
    const rechargeSum = transactions
      .filter((t: any) => t.type === "Carga de fondos")
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    return Math.max(15000, 15000 + rechargeSum);
  }, [transactions]);

  const capitalInvestedTotal = useMemo(() => {
    // Sum of assigned budgets of all employees
    return employees.reduce((sum, e) => sum + (e.assignedBudget || 0), 0);
  }, [employees]);

  const globalCompletionRate = useMemo(() => {
    if (employees.length === 0) return 0;
    const progressSum = employees.reduce((sum, e) => sum + (e.progress || 0), 0);
    return Math.round(progressSum / employees.length);
  }, [employees]);

  const totalInsigniasUnlocked = useMemo(() => {
    return employees.reduce((sum, e) => {
      const locks = e.passport?.insignias?.length ?? 0;
      return sum + locks;
    }, 4); // Default minimum baseline is 4 badges
  }, [employees]);

  // Handle corporate registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.companyName.trim()) {
      triggerToast("Por favor ingresa la Razón Social.", "error");
      return;
    }
    if (!regForm.nit.trim() || regForm.nit.length < 5) {
      triggerToast("El NIT suministrado no tiene un formato válido.", "error");
      return;
    }
    if (!regForm.email.includes("@")) {
      triggerToast("Por favor ingresa un correo electrónico corporativo válido.", "error");
      return;
    }
    if (regForm.password.length < 6) {
      triggerToast("La contraseña debe tener al menos 6 caracteres por seguridad.", "error");
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      triggerToast("Las contraseñas ingresadas no coinciden.", "error");
      return;
    }

    setIsSubmittingReg(true);
    try {
      const res = await fetch("/api/vinkupass/corporate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });
      if (res.ok) {
        localStorage.setItem("vinku_corp_registered", "true");
        localStorage.setItem("vinku_corp_name", regForm.companyName);
        localStorage.setItem("vinku_corp_nit", regForm.nit);
        localStorage.setItem("vinku_corp_email", regForm.email);
        setIsRegistered(true);
        triggerToast("¡Registro Exitoso! Bienvenido al ecosistema corporativo de Vinkupass.", "success");
        await fetchState();
      } else {
        const errData = await res.json();
        triggerToast(errData.error || "Error al registrar la organización", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión con el servidor", "error");
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Reset registration (for simulation context)
  const handleResetRegistration = () => {
    localStorage.removeItem("vinku_corp_registered");
    localStorage.removeItem("vinku_corp_name");
    localStorage.removeItem("vinku_corp_nit");
    setIsRegistered(false);
    setRegForm({
      companyName: "",
      nit: "",
      email: "",
      size: "51-200",
      password: "",
      confirmPassword: ""
    });
    triggerToast("Simulación de Registro Iniciada de nuevo.", "info");
  };

  // Quick Account Funding
  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerToast("Por favor ingresa un monto mayor a cero.", "error");
      return;
    }
    setIsRecharging(true);
    try {
      const res = await fetch("/api/vinkupass/corporate/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: rechargeAmount })
      });
      if (res.ok) {
        triggerToast(`Fondeo aprobado. Se han acreditado +${amount} Créditos Vinku.`, "success");
        setRechargeAmount("5000");
        await fetchState();
      } else {
        const err = await res.json();
        triggerToast(err.error || "No se pudo procesar el fondeo corporativo", "error");
      }
    } catch (e) {
      triggerToast("Error de comunicación con la pasarela", "error");
    } finally {
      setIsRecharging(false);
    }
  };

  // Bulk diagnostics invitation dispatcher
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkEmails.trim()) {
      triggerToast("Por favor ingresa al menos un correo electrónico.", "error");
      return;
    }

    setIsSendingBulk(true);
    try {
      const res = await fetch("/api/vinkupass/corporate/diagnose-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: bulkEmails,
          department: bulkDepartment
        })
      });
      if (res.ok) {
        triggerToast("Lote registrado con éxito. Se han programado las invitaciones por correo electrónico para los colaboradores seleccionados", "success");
        setBulkEmails("");
        await fetchState();
      } else {
        const err = await res.json();
        triggerToast(err.error || "Error de entrada masiva", "error");
      }
    } catch (e) {
      triggerToast("Fallo de conexión enviando diagnósticos masivos", "error");
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Assign credits to employee
  const handleAssignCreditsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBudgetEmployee) return;
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerToast("El monto a transferir debe ser numérico mayor a cero.", "error");
      return;
    }

    if (walletBalance < amount) {
      triggerToast("La Billetera Corporativa no cuenta con saldo disponible suficiente.", "error");
      return;
    }

    setIsAssigningBudget(true);
    try {
      const res = await fetch("/api/vinkupass/corporate/assign-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: activeBudgetEmployee.id,
          amount: transferAmount
        })
      });
      if (res.ok) {
        setIsAssignSuccess(true);
        triggerToast(`Transferencia Educativa completada con éxito para ${activeBudgetEmployee.name}.`, "success");
        await fetchState();
        setTimeout(() => {
          setIsAssignSuccess(false);
          setActiveBudgetEmployee(null);
        }, 1800);
      } else {
        const err = await res.json();
        triggerToast(err.error || "Error al transferir presupuesto", "error");
      }
    } catch (e) {
      triggerToast("Error de red asignando créditos", "error");
    } finally {
      setIsAssigningBudget(false);
    }
  };

  // Open asset funding modal
  const openBudgetModal = (emp: Employee) => {
    setActiveBudgetEmployee(emp);
    setTransferAmount(emp.suggestedRouteCost?.toString() || "1200");
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept =
        deptFilter === "todos" || emp.department.toLowerCase() === deptFilter.toLowerCase();
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, deptFilter]);

  // If NOT registered, display the modern two-column registration interface
  if (!isRegistered) {
    return (
      <div id="corporate_registration_container" className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-4 border-[#1A1A1A] overflow-hidden bg-[#FAFAFA] shadow-rigid-black rounded-none animate-fade-in my-4">
        {/* Left Column: SaaS Testimonials & ROI Metrics */}
        <div className="lg:col-span-5 bg-[#FFD000] p-8 lg:p-12 border-b-4 lg:border-b-0 lg:border-r-4 border-[#1A1A1A] flex flex-col justify-between relative overflow-hidden text-[#1A1A1A]">
          <div className="bg-benday-yellow absolute inset-0 opacity-15 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 bg-[#FAFAFA] border-2 border-[#1A1A1A] text-black shadow-[2px_2px_0px_#1A1A1A]">
                <Building className="w-6 h-6" />
              </span>
              <span className="font-display font-extrabold text-xl text-[#1A1A1A] tracking-vinku">VINKU<span className="text-[#6C47FF]">CORP</span></span>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-[#1A1A1A] tracking-vinku leading-none mb-4">
              Impulsa el upskilling de tus ingenieros con respaldo universitario real.
            </h2>
            
            <p className="text-xs text-[#1A1A1A] font-bold leading-snug mb-8">
              La única billetera de neoeducación conectada directamente con universidades del Neo-cluster para automatizar la formación tecnológica de tu personal sin procesos de reembolso tediosos. Del campus, de todos.
            </p>

            <div className="space-y-6">
              {/* Metric Card 1 */}
              <div className="bg-[#FAFAFA] border-2 border-[#1A1A1A] p-4 flex items-start gap-3 shadow-[3px_3px_0px_#1A1A1A]">
                <div className="p-1 px-2.5 bg-[#FFD000] border border-[#1A1A1A] text-[#1A1A1A] font-mono font-black text-xs mt-0.5 shadow-[1px_1px_0px_#1A1A1A]">
                  312%
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1A1A1A] mb-0.5 uppercase">Retorno de Inversión</h4>
                  <p className="text-[11px] text-zinc-700 font-bold">Reducción del costo de capacitación comparado con masters tradicionales.</p>
                </div>
              </div>
              
              {/* Metric Card 2 */}
              <div className="bg-[#FAFAFA] border-2 border-[#1A1A1A] p-4 flex items-start gap-3 shadow-[3px_3px_0px_#1A1A1A]">
                <div className="p-1 px-2.5 bg-[#FFD000] border border-[#1A1A1A] text-[#1A1A1A] font-mono font-black text-xs mt-0.5 shadow-[1px_1px_0px_#1A1A1A]">
                  100%
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1A1A1A] mb-0.5 uppercase">Tasa de Adopción</h4>
                  <p className="text-[11px] text-zinc-700 font-bold">Múltiples destinos de universidades de primer nivel en un solo pasaporte.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t-2 border-[#1A1A1A]">
            <h4 className="text-xs font-extrabold text-[#6C47FF] uppercase tracking-wider font-mono mb-2">Testimonio Corporativo</h4>
            <blockquote className="text-xs text-[#1A1A1A] italic font-bold mb-2 leading-tight">
              "Con la Consola de Diagnósticos Masivos pudimos registrar a todo nuestro equipo de desarrollo de inmediato. En menos de 24 horas cada uno tenía una ruta trazada y su pasaporte financiado."
            </blockquote>
            <p className="text-[10px] text-zinc-800 font-bold font-mono">
              — Gerente de Capital Humano, Globex SaaS Colombia
            </p>
          </div>
        </div>

        {/* Right Column: Clean, Structured Form */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-[#FAFAFA]">
          <div className="max-w-md w-full mx-auto">
            <span className="text-[10px] font-mono font-black text-[#FAFAFA] bg-[#6C47FF] border-2 border-[#1A1A1A] px-2.5 py-1.5 inline-block mb-4 shadow-[2px_2px_0px_#1A1A1A] uppercase tracking-widest">
              Registro SaaS en Google Stitch
            </span>
            <h3 className="text-2xl font-display font-extrabold text-[#1A1A1A] tracking-vinku uppercase leading-none mb-1">Crea tu Cuenta de Empresa</h3>
            <p className="text-xs text-zinc-700 font-bold mb-6">
              Propuesta en 48 horas con números reales. Si no cumplimos, no facturamos.
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-[#1A1A1A] font-extrabold block mb-1 uppercase tracking-wider">Nombre de la Organización / Razón Social *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1A1A1A]">
                    <Building className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Acme Tech S.A.S."
                    value={regForm.companyName}
                    onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                    className="w-full bg-white border-2 border-[#1A1A1A] py-2 px-3 pl-9 text-xs text-[#1A1A1A] font-bold placeholder-zinc-400 focus:outline-none focus:bg-[#FFD000] focus:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-[#1A1A1A] font-extrabold block mb-1 uppercase tracking-wider">NIT (Identificación Tributaria) *</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="Ej. NIT 901.234.567-8"
                    value={regForm.nit}
                    onChange={(e) => setRegForm({ ...regForm, nit: e.target.value })}
                    className="w-full bg-white border-2 border-[#1A1A1A] py-2 px-3 text-xs text-[#1A1A1A] font-bold placeholder-zinc-400 focus:outline-none focus:bg-[#FFD000] focus:ring-0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#1A1A1A] font-extrabold block mb-1 uppercase tracking-wider">Tamaño de la Empresa *</label>
                  <select
                    value={regForm.size}
                    onChange={(e) => setRegForm({ ...regForm, size: e.target.value })}
                    className="w-full bg-white border-2 border-[#1A1A1A] py-2 px-3 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:bg-[#FFD000] focus:ring-0"
                  >
                    <option value="1-50">1 - 50 empleados</option>
                    <option value="51-200">51 - 200 empleados</option>
                    <option value="More-200">Más de 200 empleados</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#1A1A1A] font-extrabold block mb-1 uppercase tracking-wider">Correo Electrónico del Administrador *</label>
                <input
                  type="email"
                  required
                  placeholder="admin.co@empresa.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full bg-white border-2 border-[#1A1A1A] py-2 px-3 text-xs text-[#1A1A1A] font-bold placeholder-zinc-400 focus:outline-none focus:bg-[#FFD000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-[#1A1A1A] font-extrabold block mb-1 uppercase tracking-wider">Contraseña *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full bg-white border-2 border-[#1A1A1A] py-2 px-3 text-xs text-[#1A1A1A] font-bold placeholder-zinc-400 focus:outline-none focus:bg-[#FFD000]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#1A1A1A] font-extrabold block mb-1 uppercase tracking-wider">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    className="w-full bg-white border-2 border-[#1A1A1A] py-2 px-3 text-xs text-[#1A1A1A] font-bold placeholder-zinc-400 focus:outline-none focus:bg-[#FFD000]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReg}
                className="w-full bg-[#6C47FF] hover:bg-[#5233df] border-2 border-[#1A1A1A] text-white font-extrabold text-xs py-3 rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-[3px_3px_0px_#1A1A1A] disabled:opacity-50 active:translate-y-[1px]"
              >
                {isSubmittingReg ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Verificando Credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Registro y Entrar al Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner indicating Registered Company Name */}
      <div className="bg-[#FFD000] border-3 border-[#1A1A1A] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-none shadow-rigid-black relative overflow-hidden">
        <div className="bg-benday-yellow absolute inset-0 opacity-10 pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-white border-2 border-[#1A1A1A] text-black shadow-[2px_2px_0px_#1A1A1A]">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#1A1A1A] font-display uppercase tracking-tight">
                {regForm.companyName || "Globex Corp S.A.S."}
              </span>
              <span className="bg-white text-black font-mono text-[9px] px-1.5 py-0.5 border border-[#1A1A1A] font-bold shadow-[1px_1px_0px_#1A1A1A]">
                CONEXIÓN SEGURA JWT
              </span>
            </div>
            <p className="text-[11px] text-[#1A1A1A] mt-0.5 font-bold font-mono">
              NIT: <span>{regForm.nit || "901.442.115-3"}</span> | Admin: <span className="text-[#6C47FF] font-black">{regForm.email || "humanresources@globex.com"}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto relative z-10">
          <button
            onClick={handleResetRegistration}
            className="flex-1 sm:flex-none border-2 border-[#1A1A1A] bg-white hover:bg-zinc-100 active:bg-zinc-200 text-[#1A1A1A] font-bold px-3 py-1.5 rounded-none text-xs transition-all font-mono shadow-[2px_2px_0px_#1A1A1A]"
            title="Esto restablece la simulación de registro"
          >
            Reiniciar Registro
          </button>
          
          <span className="bg-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded-none text-xs font-mono font-black text-[#1A1A1A] flex items-center gap-1.5 shadow-[2px_2px_0px_#1A1A1A]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Consola Activa
          </span>
        </div>
      </div>

      {/* SUBTAB CONTENT: 1. Dashboard Ejecutivo y Analítica ROI */}
      {corpTab === "dashboard" && (
        <div id="corp_subtab_dashboard_executive" className="space-y-6">
          {/* Key Metric KPI Cards Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Presupuesto General Fondeado */}
            <div className="bg-[#FAFAFA] border-3 border-[#1A1A1A] p-5 hover:shadow-rigid-black transition-all shadow-rigid-violet rounded-none text-[#1A1A1A] group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-600 uppercase">Fideicomiso Fondeado</span>
                <span className="p-1.5 bg-[#FFD000] border border-[#1A1A1A] rounded-none text-[#1A1A1A] text-xs shadow-[1px_1px_0px_#1A1A1A]">
                  <Building className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-extrabold text-[#1A1A1A] font-mono tracking-tight leading-none mt-1">
                {budgetFundedTotal.toLocaleString()} Credits
              </div>
              <p className="text-[10px] text-zinc-600 font-bold mt-1.5 flex items-center gap-1">
                <span className="text-[#6C47FF] font-extrabold">Tasa de Convenio</span> Fondeo Fijo SaaS
              </p>
            </div>

            {/* KPI 2: Capital Educativo Invertido */}
            <div className="bg-[#FAFAFA] border-3 border-[#1A1A1A] p-5 hover:shadow-rigid-black transition-all shadow-rigid-violet rounded-none text-[#1A1A1A] group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-600 uppercase">Capital Dispersado</span>
                <span className="p-1.5 bg-[#FFD000] border border-[#1A1A1A] rounded-none text-[#1A1A1A] text-xs shadow-[1px_1px_0px_#1A1A1A]">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-extrabold text-[#1A1A1A] font-mono tracking-tight leading-none mt-1">
                {capitalInvestedTotal.toLocaleString()} Credits
              </div>
              <p className="text-[10px] text-zinc-600 font-bold mt-1.5">
                Representando <span className="text-[#6C47FF] font-extrabold">USD {(capitalInvestedTotal * 1.2).toLocaleString()}</span> transferidos
              </p>
            </div>

            {/* KPI 3: Tasa de Finalización Global */}
            <div className="bg-[#FAFAFA] border-3 border-[#1A1A1A] p-5 hover:shadow-rigid-black transition-all shadow-rigid-violet rounded-none text-[#1A1A1A] group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-600 uppercase">Tasa de Finalización</span>
                <span className="p-1.5 bg-[#FFD000] border border-[#1A1A1A] rounded-none text-[#1A1A1A] text-xs shadow-[1px_1px_0px_#1A1A1A]">
                  <CheckCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-extrabold text-[#1A1A1A] tracking-tight leading-none mt-1 font-mono">
                {globalCompletionRate}%
              </div>
              {/* Custom progress visual inside card */}
              <div className="w-full bg-[#1A1A1A] h-2.5 mt-2.5 border border-[#1A1A1A]">
                <div className="bg-[#FFD000] h-full transition-all duration-1000" style={{ width: `${globalCompletionRate}%` }} />
              </div>
            </div>

            {/* KPI 4: Nuevas Habilidades Adquiridas */}
            <div className="bg-[#FAFAFA] border-3 border-[#1A1A1A] p-5 hover:shadow-rigid-black transition-all shadow-rigid-violet rounded-none text-[#1A1A1A] group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-600 uppercase">Insignias Validadas</span>
                <span className="p-1.5 bg-[#FFD000] border border-[#1A1A1A] rounded-none text-[#1A1A1A] text-xs shadow-[1px_1px_0px_#1A1A1A]">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-extrabold text-[#1A1A1A] font-mono tracking-tight leading-none mt-1">
                {totalInsigniasUnlocked} Habilidades
              </div>
              <p className="text-[10px] text-zinc-600 font-bold mt-1.5">
                Firmadas con <span className="text-[#6C47FF] font-extrabold">Criptografía SHA-256</span>
              </p>
            </div>
          </div>

          {/* Charts Row: Donut Chart left, Bar Chart right (Looker Studio Style Component mockup in neat CSS/SVG) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column (Donut Chart representation inside high-fidelity container) */}
            <div className="bg-[#121216] border border-border-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-dark/60">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Distribución del Presupuesto por Departamentos
                </h4>
                <span className="text-[10px] text-text-dim font-mono bg-black/40 px-2 py-0.5 rounded text-white border border-border-dark">Dona SVG Interactiva</span>
              </div>
              
              {/* Custom SVG Donut Component */}
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Circle 1: Technology (e.g. 55% -> stroke-dasharray: 55, 100) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#8B5CF6" /* violet */
                      strokeWidth="12"
                      strokeDasharray="55 100"
                      strokeDashoffset="0"
                    />
                    {/* Circle 2: Sales (e.g. 25% -> stroke-dasharray: 25, 100, off-set 55) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10B981" /* emerald */
                      strokeWidth="12"
                      strokeDasharray="25 100"
                      strokeDashoffset="-55"
                    />
                    {/* Circle 3: Operations (e.g. 15% -> stroke-dasharray: 15, 100, off-set 80) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#FBBF24" /* yellow */
                      strokeWidth="12"
                      strokeDasharray="15 100"
                      strokeDashoffset="-80"
                    />
                    {/* Circle 4: Finance (e.g. 5% -> stroke-dasharray: 5, 100, off-set 95) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#EF4444" /* red */
                      strokeWidth="12"
                      strokeDasharray="5 100"
                      strokeDashoffset="-95"
                    />
                  </svg>
                  {/* Center metrics indicator */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase font-mono text-zinc-500 font-semibold">Total</span>
                    <span className="text-base font-extrabold text-white font-mono">100%</span>
                  </div>
                </div>

                {/* Donut Chart Legend */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-accent-violet block" />
                    <span className="text-zinc-300 font-semibold font-mono">Tecnología:</span>
                    <span className="text-white font-bold">55%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#10B981] block" />
                    <span className="text-zinc-300 font-semibold font-mono">Ventas:</span>
                    <span className="text-white font-bold">25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-accent-yellow block" />
                    <span className="text-zinc-300 font-semibold font-mono">Operaciones:</span>
                    <span className="text-white font-bold">15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500 block" />
                    <span className="text-zinc-300 font-semibold font-mono">Finanzas:</span>
                    <span className="text-white font-bold">5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Bar Chart: Top Universities Preferidas) */}
            <div className="bg-[#121216] border border-border-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-dark/60">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Top 3 de Universidades Aliadas Preferidas
                </h4>
                <span className="text-[10px] text-text-dim font-mono bg-black/40 px-2 py-0.5 rounded text-white border border-border-dark">Looker Studio Bars</span>
              </div>

              {/* Graphic bars representing enrollment metrics */}
              <div className="space-y-4 py-3">
                <div className="relative">
                  <div className="flex justify-between items-center text-xs text-zinc-300 font-semibold mb-1">
                    <span>1. Universidad de los Andes</span>
                    <span className="font-mono text-white">22 Alumnos matriculados</span>
                  </div>
                  {/* Outer bar container */}
                  <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden border border-border-dark">
                    <div className="bg-gradient-to-r from-accent-violet to-indigo-500 h-full rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center text-xs text-zinc-300 font-semibold mb-1">
                    <span>2. Tecnológico de Monterrey</span>
                    <span className="font-mono text-white">18 Alumnos matriculados</span>
                  </div>
                  {/* Outer bar container */}
                  <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden border border-border-dark">
                    <div className="bg-gradient-to-r from-accent-violet to-emerald-500/80 h-full rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center text-xs text-zinc-300 font-semibold mb-1">
                    <span>3. IE Business School (Madrid)</span>
                    <span className="font-mono text-white">14 Alumnos matriculados</span>
                  </div>
                  {/* Outer bar container */}
                  <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden border border-border-dark">
                    <div className="bg-gradient-to-r from-accent-violet to-yellow-500 h-full rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick instructions panel */}
          <div className="bg-gradient-to-r from-[#171725] to-[#111116] border border-border-dark rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-accent-yellow">Capacitaciones Activas</h4>
              <p className="text-xs text-text-dim max-w-2xl leading-normal">
                Explora el directorio de colaboradores en la pestaña "Gestión de Talento" para financiar instantáneamente las rutas generadas para tus colaboradores. Los créditos asignados de la billetera corporativa se aplican directamente en tiempo de ejecución.
              </p>
            </div>
            <button
              onClick={() => setCorpTab("talent")}
              className="w-full md:w-auto bg-accent-violet hover:bg-violet-600 font-bold font-display text-white text-xs py-2 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow"
            >
              <span>Ir a Gestión de Talento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: 2. Gestión de Talento */}
      {corpTab === "talent" && (
        <div id="corp_subtab_talent_active" className="space-y-6">
          <div className="bg-[#121216] border border-border-dark rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white font-display">Directorio de Gestión de Talento</h3>
                <p className="text-xs text-text-gray">Monitorea y financia activamente los planes educativos de los empleados.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Bar Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Búsqueda por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/40 border border-border-dark rounded-lg py-1.5 px-3 pl-9 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent-violet w-full sm:w-64"
                  />
                </div>

                {/* Filter Dropdown */}
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-black/40 border border-border-dark/80 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-accent-violet"
                >
                  <option value="todos">Todos los Departamentos</option>
                  <option value="tecnología">Tecnología</option>
                  <option value="ventas">Ventas</option>
                  <option value="operaciones">Operaciones</option>
                  <option value="finanzas">Finanzas</option>
                </select>
              </div>
            </div>

            {/* MASTER COLLABORATORS GRID */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-dark font-mono text-zinc-400 uppercase text-[10px] tracking-wider pb-3 bg-black/20">
                    <th className="py-3 px-4">Colaborador / Correo</th>
                    <th className="py-3 px-4">Departamento / Área</th>
                    <th className="py-3 px-4">Estado del Diagnóstico</th>
                    <th className="py-3 px-4">Ruta Activa Asignada</th>
                    <th className="py-3 px-4">Progreso Académico</th>
                    <th className="py-3 px-4 text-center">Presupuesto (Créditos)</th>
                    <th className="py-3 px-4 text-right">Acciones de Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/40">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-text-dim text-xs">
                        No se encontraron colaboradores con los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-black/20 transition-all">
                        {/* Name and Email */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{emp.name}</div>
                          <div className="text-[10px] text-text-dim font-mono">{emp.email || "colaborador@vinkupass.com"}</div>
                        </td>
                        
                        {/* Department / Area */}
                        <td className="py-3.5 px-4">
                          <span className="text-zinc-300 font-mono text-[11px] font-semibold bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">
                            {emp.department || "Tecnología"}
                          </span>
                        </td>

                        {/* Diag status badge colors */}
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {emp.diagStatus === "Pendiente" ? (
                            <span className="text-[10px] text-accent-yellow bg-accent-yellow/10 px-2 py-0.5 rounded border border-accent-yellow/20">
                              Pendiente
                            </span>
                          ) : emp.diagStatus === "Ruta Generada" ? (
                            <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                              Ruta Generada
                            </span>
                          ) : (
                            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Matriculado
                            </span>
                          )}
                        </td>

                        {/* Suggested active path course */}
                        <td className="py-3.5 px-4 text-[11px] text-zinc-300 max-w-[200px] truncate leading-tight">
                          {emp.activePath && emp.activePath.length > 0 ? (
                            <span>{emp.activePath.join(", ")}</span>
                          ) : (
                            <span className="text-text-dim italic">Sin ruta asignada</span>
                          )}
                        </td>

                        {/* Custom Progress bar loader */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-accent-emerald rounded-full transition-all duration-500"
                                style={{ width: `${emp.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] font-bold text-white">{emp.progress}%</span>
                          </div>
                        </td>

                        {/* Assigned budgets */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-accent-emerald text-xs">
                          {emp.assignedBudget || 0} Credits
                        </td>

                        {/* Actions: Asignar Créditos / Ver Pasaporte */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Ver Pasaporte Button */}
                            <button
                              onClick={() => {
                                setAuditedEmployee(emp);
                              }}
                              className="bg-zinc-800/80 hover:bg-zinc-700/90 text-white font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-zinc-700/50 cursor-pointer transition-all"
                            >
                              Ver Pasaporte
                            </button>

                            {/* Asignar Créditos Button (enabled uniquely for 'Ruta Generada') */}
                            <button
                              onClick={() => openBudgetModal(emp)}
                              disabled={emp.diagStatus !== "Ruta Generada"}
                              className={`font-semibold font-display text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                                emp.diagStatus === "Ruta Generada"
                                  ? "bg-accent-violet hover:bg-violet-600 text-white cursor-pointer shadow"
                                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
                              }`}
                            >
                              Asignar Créditos
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: 3. Billetera Corporativa Centralizada */}
      {corpTab === "wallet" && (
        <div id="corp_subtab_wallet_active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Box: Balances and Quick Recharge Fondeo Rápido */}
            <div className="lg:col-span-5 bg-[#121216] border border-border-dark rounded-xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-accent-violet bg-accent-violet/10 border border-accent-violet/20 px-2.5 py-0.5 rounded inline-block mb-3 uppercase tracking-wider">
                  Módulo de Gestión Financiera
                </span>
                <h3 className="text-base font-bold text-white font-display">Billetera Corporativa Centralizada</h3>
                <p className="text-xs text-text-dim leading-relaxed mt-1">
                  Adquiere créditos prepago para financiar de forma síncrona los pasaportes de tus colaboradores. $1 USD equivale aproximadamente a 1.2 Créditos Vinku.
                </p>
              </div>

              {/* Big Balanced Display Card */}
              <div className="bg-black/60 p-5 rounded-xl border border-border-dark space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">SALDO TOTAL DISPONIBLE</span>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight leading-none">
                  {walletBalance.toLocaleString()} <span className="text-accent-yellow font-display font-medium text-lg">Credits</span>
                </div>
                <div className="text-xs text-[#10B981] font-mono font-semibold flex items-center gap-1">
                  <span>≈ USD {(walletBalance * 1.2).toLocaleString()} dólares americanos</span>
                </div>
              </div>

              {/* Quick Funding Form (Simulated form) */}
              <form onSubmit={handleRechargeSubmit} className="space-y-3.5 pt-2 border-t border-border-dark/60">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Monto de Créditos a Comprar *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={100}
                      step={100}
                      placeholder="Ej. 5000"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      className="w-full bg-black/40 border border-border-dark rounded-xl py-2 px-3 text-xs text-white uppercase placeholder-zinc-600 focus:outline-none focus:border-accent-violet"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-accent-yellow font-mono font-extrabold">
                      VINKU CREDITS
                    </span>
                  </div>
                  <p className="text-[10px] text-text-dim mt-1.5">
                    Equivalencia estimada: <span className="text-accent-emerald font-semibold font-mono">USD {(parseFloat(rechargeAmount || "0") * 1.2).toLocaleString()}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isRecharging}
                  className="w-full bg-[#10B981] hover:bg-emerald-600 font-bold font-display text-white text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {isRecharging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Conectando con Pasarela...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Recargar Billetera Corporativa</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Box: Historical Transaction Table */}
            <div className="lg:col-span-7 bg-[#121216] border border-border-dark rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-4 pb-2 border-b border-border-dark/60">
                  Historial de Transacciones de Billetera
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border-dark font-mono text-zinc-500 uppercase text-[9px] tracking-wider pb-2">
                        <th className="py-2.5">Fecha</th>
                        <th className="py-2.5">Movimiento</th>
                        <th className="py-2.5 text-center">Estado</th>
                        <th className="py-2.5">Detalle / Colaborador</th>
                        <th className="py-2.5 text-right">Monto (Créditos)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark/30 font-mono text-[11px]">
                      {transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-white/5">
                          <td className="py-3 text-zinc-400">{tx.date}</td>
                          <td className="py-3 font-semibold text-zinc-100">
                            {tx.type}
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-[9px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded border border-[#10B981]/25">
                              {tx.status || "Completado"}
                            </span>
                          </td>
                          <td className="py-3 text-zinc-300 font-sans">{tx.detail}</td>
                          <td className={`py-3 text-right font-bold ${tx.type.includes("Carga") ? "text-[#10B981]" : "text-zinc-200"}`}>
                            {tx.type.includes("Carga") ? "+" : "-"}{tx.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: 4. Consola de Diagnóstico de Equipos */}
      {corpTab === "diagnosis" && (
        <div id="corp_subtab_diagnosis_active" className="max-w-4xl mx-auto">
          <div className="bg-[#121216] border border-border-dark rounded-xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-yellow/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center max-w-xl mx-auto">
              <span className="p-3 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-accent-yellow inline-block mb-3">
                <Compass className="w-8 h-8 font-extrabold" />
              </span>
              <h3 className="text-lg font-display font-extrabold text-white tracking-tight">Consola de Diagnóstico de Equipos</h3>
              <p className="text-xs text-text-dim leading-relaxed text-center mt-1">
                Invita a tus colaboradores a descubrir sus rutas de upskilling de forma automatizada. El sistema les enviará un enlace para diagnosticar sus habilidades en minutos.
              </p>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4 pt-4 border-t border-border-dark/60">
              <div className="bg-black/20 p-4 rounded-xl border border-border-dark/60 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase font-mono text-accent-yellow tracking-wider">
                  Bulk Input Console (Instrucción de Carga)
                </h4>
                <p className="text-[11px] text-text-dim leading-relaxed">
                  Pega la lista de correos separados por coma o por salto de línea. El sistema los estructurará con JWT únicos, listos para recibir su sugerencia en Créditos Vinku.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Asignar este lote al Área/Departamento de: *</label>
                <select
                  value={bulkDepartment}
                  onChange={(e) => setBulkDepartment(e.target.value)}
                  className="w-full bg-black/40 border border-border-dark rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-accent-violet font-semibold"
                >
                  <option value="Tecnología">Tecnología & Ingeniería Cloud</option>
                  <option value="Ventas">Ventas & Growth Marketing</option>
                  <option value="Operaciones">Operaciones & Análisis Operacional</option>
                  <option value="Finanzas">Finanzas & Control Administrativo</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Direcciones de Correo Electrónico a Invitar *</label>
                <textarea
                  required
                  rows={4}
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="Pega aquí las direcciones de correo electrónico de tus colaboradores separadas por comas o saltos de línea... (Ejemplo: empleado1@empresa.com, empleado2@empresa.com)"
                  className="w-full bg-[#111115] border border-border-dark rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent-violet outline-none font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSendingBulk}
                  className="w-full bg-accent-yellow hover:bg-yellow-500 font-bold font-display text-black text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow disabled:opacity-50"
                >
                  {isSendingBulk ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando Direcciones...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-black text-black" />
                      <span>Disparar Diagnósticos Masivos y Enviar Invitaciones</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: Individual budget allocation */}
      {activeBudgetEmployee && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#121217] border border-border-dark rounded-2xl p-6 max-w-md w-full relative space-y-6">
            <button
              onClick={() => setActiveBudgetEmployee(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-accent-violet bg-accent-violet/10 border border-accent-violet/20 px-2 py-0.5 rounded inline-block uppercase">
                Fondeo Individual Autorizado
              </span>
              <h3 className="text-base font-bold text-white font-display">Asignar Créditos a Colaborador</h3>
              <p className="text-xs text-text-dim">
                Asigna presupuesto para financiar la ruta generada de <span className="font-bold text-white">{activeBudgetEmployee.name}</span>.
              </p>
            </div>

            <div className="bg-black/40 border border-border-dark rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Ruta Recomendada:</span>
                <span className="font-bold text-zinc-200">SaaS Engineering Program</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border-dark/60 pt-2 text-accent-yellow">
                <span className="font-semibold text-white">Costo de la Ruta:</span>
                <span className="font-bold font-mono">1,200 Créditos Vinku</span>
              </div>
            </div>

            {isAssignSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2 text-center animate-fade-in">
                <div className="p-3 bg-accent-emerald/20 border border-accent-emerald/40 text-[#10B981] rounded-full">
                  <Check className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="text-sm font-bold text-white">¡Asignación Completada con Éxito!</h4>
                <p className="text-xs text-text-dim">Se ha debitado el presupuesto corporativo.</p>
              </div>
            ) : (
              <form onSubmit={handleAssignCreditsSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Monto de Créditos a Transferir</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Monto de Créditos"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full bg-[#111115] border border-border-dark rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent-violet font-mono"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-accent-yellow font-mono font-bold">
                      VINKU CREDITS
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveBudgetEmployee(null)}
                    className="px-4 py-2 border border-border-dark hover:bg-white/5 text-zinc-400 hover:text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigningBudget}
                    className="px-4 py-2 bg-accent-violet hover:bg-violet-600 font-bold font-display text-white text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow disabled:opacity-50"
                  >
                    {isAssigningBudget ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Confirmar Transferencia Educativa</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Read-Only Vinkupass audit view */}
      {auditedEmployee && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-[#121217] border border-border-dark rounded-3xl p-6 md:p-8 max-w-2xl w-full relative my-8 space-y-6 shadow-2xl">
            <button
              onClick={() => setAuditedEmployee(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-[#1A1A24] p-2 rounded-full cursor-pointer transition-all border border-border-dark"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-border-dark/60 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent-violet/10 border border-accent-violet/20 rounded-2xl text-accent-violet">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white font-display">MODO DE AUDITORÍA DIRECTA</span>
                    <span className="bg-zinc-800 text-zinc-300 font-mono text-[9px] px-2 py-0.5 rounded border border-zinc-700">Lectura Únicamente</span>
                  </div>
                  <h3 className="text-xl font-display font-extrabold text-white mt-0.5">Clon del Pasaporte Inteligente Vinkupass</h3>
                </div>
              </div>
              <div className="text-center sm:text-right font-mono text-[10px] text-zinc-400">
                Colaborador: <span className="text-accent-yellow font-bold text-xs font-sans block">{auditedEmployee.name}</span>
              </div>
            </div>

            {/* Simulated Vinkupass Passport Layout */}
            <div className="bg-gradient-to-br from-[#1B1B26] to-[#0D0D14] border-2 border-accent-yellow/40 rounded-2xl p-6 relative overflow-hidden shadow-inner">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-40">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald block" />
                <span className="text-[9px] font-mono text-white">CHIP CRIPTOGRÁFICO</span>
              </div>

              {/* Passport Header */}
              <div className="flex justify-between items-start border-b border-border-dark/60 pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-accent-yellow font-bold">VINKUPASS</span>
                  <div className="text-white text-xs font-semibold">PASAPORTE EDUCATIVO GLOBAL</div>
                  <div className="text-[10px] text-zinc-400 font-mono">ID: {auditedEmployee.id} | REG: {auditedEmployee.email}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-zinc-400 text-[10px]">CIUDADANÍA:</span>
                  <div className="text-white font-mono text-[11px] font-bold">EDTECH NEO-CLUSTER</div>
                </div>
              </div>

              {/* Passport Body Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Section: Destinations (Universities stamped) */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-accent-yellow font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-border-dark/40 pb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent-yellow" />
                    Destinos Autorizados (Universidades)
                  </h4>
                  
                  {auditedEmployee.passport?.destinations && auditedEmployee.passport.destinations.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {auditedEmployee.passport.destinations.map((dest, i) => (
                        <div key={i} className="p-3 bg-black/60 rounded-xl border border-border-dark text-center space-y-1 relative group">
                          {/* Stamps design decoration */}
                          <div className="w-10 h-10 mx-auto rounded-full bg-accent-violet/10 border-2 border-dashed border-accent-violet/30 flex items-center justify-center font-bold text-xs text-white">
                            {dest.stampLogo || "Uni"}
                          </div>
                          <div className="text-[10px] font-bold text-white leading-tight min-h-[30px] flex items-center justify-center">{dest.university}</div>
                          <span className="text-[9px] text-text-dim block border-t border-border-dark/60 pt-1 font-mono">{dest.enrollCount} Sello Activo</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic text-[11px] py-4">No se han registrado visitas a destinos universitarios.</p>
                  )}
                </div>

                {/* Sellos List (Cursos) */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-accent-yellow font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-border-dark/40 pb-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-accent-yellow" />
                    Cátedras Levantadas (Los Sellos)
                  </h4>
                  
                  {auditedEmployee.passport?.sellos && auditedEmployee.passport.sellos.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {auditedEmployee.passport.sellos.map((sello, i) => (
                        <div key={i} className="p-2.5 bg-black/40 rounded-lg border border-border-dark flex justify-between items-center text-[11px]">
                          <div>
                            <div className="font-bold text-white leading-tight">{sello.courseTitle}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{sello.university}</div>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 rounded ${
                            sello.status === "Certificado" 
                              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                              : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                          }`}>
                            {sello.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-black/40 rounded-xl border border-border-dark text-zinc-500 italic text-[11px]">
                      Pendiente por cursar. Matricula al colaborador para estampar los sellos de su ruta generada.
                    </div>
                  )}
                </div>
              </div>

              {/* Insignias Block */}
              <div className="mt-6 pt-4 border-t border-border-dark/60">
                <h4 className="text-[10px] font-mono text-accent-yellow font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Award className="w-3.5 h-3.5" />
                  Insignias Criptográficas Registradas en la Ledger
                </h4>
                
                {auditedEmployee.passport?.insignias && auditedEmployee.passport.insignias.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {auditedEmployee.passport.insignias.map((ins, i) => (
                      <span key={i} className="bg-zinc-800/80 border border-zinc-700 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs text-white">
                        <Award className="w-3.5 h-3.5 text-accent-yellow" />
                        <span className="font-bold">{ins.skillName}</span>
                        <span className="text-[9px] text-zinc-400 font-mono">({ins.dateEarned})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 italic text-[11px] py-1">Insignias pendientes por reclamar en el pasaporte.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAuditedEmployee(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition-all border border-border-dark"
              >
                Cerrar Auditoría de Pasaporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
