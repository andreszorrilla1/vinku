// ============================================================
// Campus Pass — Panel de administración del catálogo
// CRUD mínimo sobre cursos Campus Pass (cp_* en la tabla courses).
// Se monta en el portal Universidad. Requiere universityId.
// ============================================================

import { useEffect, useState } from "react";
import * as api from "../../lib/api";
import type { CampusPassInput } from "../../lib/api";
import type { Curso } from "../../types/etapa1";
import { formatCOP } from "../../lib/cotizacion";

interface Props {
  universityId: string;
  institucionNombre: string;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const VACIO: CampusPassInput = {
  university_id: "",
  nombre_curso: "",
  institucion: "",
  tipo_institucion: "universidad",
  nivel: "educacion_continua",
  modalidad: "virtual",
  duracion_horas: 0,
  duracion_semanas: 0,
  precio_publico_cop: 0,
  precio_vinku_cop: 0,
  descuento_disponible: false,
  ciudad: "",
  habilidades_que_desarrolla: [],
  roles_que_habilita: [],
  cupos_disponibles: 0,
  proxima_fecha_inicio: null,
  categoria: "",
  palabras_clave: [],
};

const NIVELES = ["tecnico_laboral", "tecnico_profesional", "tecnologico", "universitario", "diplomado", "especializacion", "maestria", "educacion_continua"];
const MODALIDADES = ["virtual", "presencial", "hibrida"];
const TIPOS = ["universidad", "tecnologica", "tecnica", "IETDH"];

export default function CatalogoAdmin({ universityId, institucionNombre, triggerToast }: Props) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState<CampusPassInput>({ ...VACIO, university_id: universityId, institucion: institucionNombre });
  const [editId, setEditId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const data = await api.fetchCampusPassCatalogoAdmin(universityId);
      setCursos(data);
    } catch {
      triggerToast("No se pudo cargar el catálogo. ¿Aplicaste la migración 022?", "error");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { void cargar(); /* eslint-disable-next-line */ }, [universityId]);

  function resetForm() {
    setForm({ ...VACIO, university_id: universityId, institucion: institucionNombre });
    setEditId(null);
    setMostrarForm(false);
  }

  function editar(c: Curso) {
    setEditId(c.id_curso);
    setForm({
      university_id: universityId,
      nombre_curso: c.nombre_curso,
      institucion: c.institucion,
      tipo_institucion: c.tipo_institucion,
      nivel: c.nivel,
      modalidad: c.modalidad,
      duracion_horas: c.duracion_horas,
      duracion_semanas: c.duracion_semanas,
      precio_publico_cop: c.precio_publico_cop,
      precio_vinku_cop: c.precio_vinku_cop,
      descuento_disponible: c.descuento_disponible,
      ciudad: c.ciudad,
      habilidades_que_desarrolla: c.habilidades_que_desarrolla,
      roles_que_habilita: c.roles_que_habilita,
      cupos_disponibles: c.cupos_disponibles,
      proxima_fecha_inicio: c.proxima_fecha_inicio || null,
      categoria: c.categoria,
      palabras_clave: c.palabras_clave,
    });
    setMostrarForm(true);
  }

  async function guardar() {
    if (!form.nombre_curso || form.precio_publico_cop <= 0) {
      triggerToast("Nombre y precio público (> 0) son obligatorios.", "error");
      return;
    }
    setGuardando(true);
    try {
      if (editId) {
        await api.updateCampusPassCourse(editId, form);
        triggerToast("Curso actualizado.", "success");
      } else {
        await api.createCampusPassCourse(form);
        triggerToast("Curso agregado al catálogo Campus Pass.", "success");
      }
      resetForm();
      await cargar();
    } catch (e) {
      triggerToast(e instanceof Error ? e.message : "Error al guardar el curso.", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function desactivar(id: string) {
    try {
      await api.deactivateCampusPassCourse(id);
      triggerToast("Curso desactivado.", "success");
      await cargar();
    } catch {
      triggerToast("Error al desactivar.", "error");
    }
  }

  const setNum = (k: keyof CampusPassInput) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v === "" ? 0 : Number(v) }));
  const setStr = (k: keyof CampusPassInput) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setList = (k: keyof CampusPassInput) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v.split(",").map((s) => s.trim()).filter(Boolean) }));

  const label = "text-[10px] font-mono uppercase text-gray-500 font-bold block mb-1";
  const inp = "w-full border-2 border-gray-200 focus:border-[#6C47FF] rounded-xl px-3 py-2 text-sm outline-none";

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#1A1A1A]">Catálogo Campus Pass</h3>
          <p className="text-xs text-gray-500">Cursos que el motor de curaduría ofrece a las personas.</p>
        </div>
        <button
          onClick={() => { resetForm(); setMostrarForm(true); }}
          className="bg-[#FFD000] text-[#1A1A1A] font-extrabold text-xs px-4 py-2.5 rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] hover:-translate-y-0.5 transition-all"
        >
          + Agregar curso
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-extrabold text-sm text-[#1A1A1A]">{editId ? "Editar curso" : "Nuevo curso Campus Pass"}</p>
            <button onClick={resetForm} className="text-xs text-gray-400 hover:text-[#1A1A1A]">Cancelar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={label}>Nombre del curso *</label>
              <input className={inp} value={form.nombre_curso} onChange={(e) => setStr("nombre_curso")(e.target.value)} placeholder="ej. Diplomado en Analítica de Datos" />
            </div>
            <div>
              <label className={label}>Institución</label>
              <input className={inp} value={form.institucion} onChange={(e) => setStr("institucion")(e.target.value)} />
            </div>
            <div>
              <label className={label}>Tipo institución</label>
              <select className={inp} value={form.tipo_institucion} onChange={(e) => setStr("tipo_institucion")(e.target.value)}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Nivel</label>
              <select className={inp} value={form.nivel} onChange={(e) => setStr("nivel")(e.target.value)}>
                {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Modalidad</label>
              <select className={inp} value={form.modalidad} onChange={(e) => setStr("modalidad")(e.target.value)}>
                {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Ciudad</label>
              <input className={inp} value={form.ciudad} onChange={(e) => setStr("ciudad")(e.target.value)} placeholder="ej. Medellín" />
            </div>
            <div>
              <label className={label}>Categoría</label>
              <input className={inp} value={form.categoria} onChange={(e) => setStr("categoria")(e.target.value)} placeholder="ej. Tecnología y sistemas" />
            </div>
            <div>
              <label className={label}>Duración (horas)</label>
              <input type="number" min={0} className={inp} value={form.duracion_horas || ""} onChange={(e) => setNum("duracion_horas")(e.target.value)} />
            </div>
            <div>
              <label className={label}>Duración (semanas)</label>
              <input type="number" min={0} className={inp} value={form.duracion_semanas || ""} onChange={(e) => setNum("duracion_semanas")(e.target.value)} />
            </div>
            <div>
              <label className={label}>Precio público (COP) *</label>
              <input type="number" min={1} className={inp} value={form.precio_publico_cop || ""} onChange={(e) => setNum("precio_publico_cop")(e.target.value)} />
            </div>
            <div>
              <label className={label}>Precio VinkU (COP)</label>
              <input type="number" min={0} className={inp} value={form.precio_vinku_cop || ""} onChange={(e) => setNum("precio_vinku_cop")(e.target.value)} />
            </div>
            <div>
              <label className={label}>Cupos disponibles</label>
              <input type="number" min={0} className={inp} value={form.cupos_disponibles || ""} onChange={(e) => setNum("cupos_disponibles")(e.target.value)} />
            </div>
            <div>
              <label className={label}>Próxima fecha inicio</label>
              <input type="date" className={inp} value={form.proxima_fecha_inicio ?? ""} onChange={(e) => setForm((f) => ({ ...f, proxima_fecha_inicio: e.target.value || null }))} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Habilidades que desarrolla (separadas por coma)</label>
              <input className={inp} value={form.habilidades_que_desarrolla.join(", ")} onChange={(e) => setList("habilidades_que_desarrolla")(e.target.value)} placeholder="liderazgo, comunicación, datos" />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Roles que habilita (separados por coma)</label>
              <input className={inp} value={form.roles_que_habilita.join(", ")} onChange={(e) => setList("roles_que_habilita")(e.target.value)} placeholder="Líder de Equipo, Coordinador" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input id="cp-desc" type="checkbox" checked={form.descuento_disponible} onChange={(e) => setForm((f) => ({ ...f, descuento_disponible: e.target.checked }))} />
              <label htmlFor="cp-desc" className="text-xs font-bold text-gray-600">Tiene descuento VinkU (Caso A)</label>
            </div>
          </div>
          <button
            onClick={guardar}
            disabled={guardando}
            className="w-full py-3 bg-[#1A1A1A] text-[#FFD000] font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#FFD000] hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {guardando ? "Guardando..." : editId ? "Guardar cambios" : "Agregar al catálogo"}
          </button>
        </div>
      )}

      {/* Lista */}
      {cargando ? (
        <p className="text-center text-sm text-gray-400 py-8">Cargando catálogo...</p>
      ) : cursos.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
          <p className="text-sm font-bold text-gray-400">Aún no tienes cursos en el catálogo Campus Pass.</p>
          <p className="text-xs text-gray-400 mt-1">Agrega uno para que aparezca en las rutas de las personas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cursos.map((c) => (
            <div key={c.id_curso} className="bg-white border-2 border-[#1A1A1A] rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1A1A1A] truncate">{c.nombre_curso}</p>
                <p className="text-[11px] text-gray-400">{c.nivel} · {c.modalidad} · {formatCOP(c.precio_publico_cop)} · {c.cupos_disponibles} cupos</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => editar(c)} className="text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-[#6C47FF] text-[#6C47FF] hover:bg-[#6C47FF]/10">Editar</button>
                <button onClick={() => desactivar(c.id_curso)} className="text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-red-300 text-red-500 hover:bg-red-50">Desactivar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
