// ============================================================
// Campus Pass — Vista de Cotización (Módulo 3 output)
// Tabla de líneas, totales, ahorro, vencimiento y CTAs
// (WhatsApp + descarga PDF con jsPDF).
// ============================================================

import { jsPDF } from "jspdf";
import type { Cotizacion } from "../../types/etapa1";
import { WHATSAPP_ASESOR } from "../../types/etapa1";
import { formatCOP } from "../../lib/cotizacion";

interface Props {
  cotizacion: Cotizacion;
  onAprobar: () => void;
}

function diasHabilesRestantes(vencISO: string): number {
  const venc = new Date(vencISO);
  const hoy = new Date();
  const ms = venc.getTime() - hoy.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function fechaLegible(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function generarPDF(cot: Cotizacion) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margen = 40;
  let y = 50;

  doc.setFontSize(18);
  doc.setTextColor(26, 26, 26);
  doc.text("Campus Pass by VinkU", margen, y);
  doc.setFontSize(10);
  doc.setTextColor(108, 71, 255);
  doc.text("Cotización de ruta de aprendizaje", margen, y + 16);

  y += 44;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Número: ${cot.numero}`, margen, y);
  doc.text(`Emitida: ${fechaLegible(cot.fecha_emision)}`, margen, y + 14);
  doc.text(`Vence: ${fechaLegible(cot.fecha_vencimiento)}`, margen, y + 28);
  doc.text(`Cliente: ${cot.cliente_nombre} (${cot.tipo_cliente})`, margen, y + 42);
  doc.text(`Ruta: ${cot.ruta_nombre}`, margen, y + 56);

  y += 84;
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.setFont("helvetica", "bold");
  doc.text("#", margen, y);
  doc.text("Curso", margen + 20, y);
  doc.text("Público", 380, y, { align: "right" });
  doc.text("Tu precio", 480, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(margen, y, 520, y);
  y += 14;

  for (const l of cot.lineas) {
    const nombre = l.nombre_curso.length > 44 ? l.nombre_curso.slice(0, 43) + "…" : l.nombre_curso;
    doc.text(String(l.orden), margen, y);
    doc.text(nombre, margen + 20, y);
    doc.text(formatCOP(l.precio_publico_cop), 380, y, { align: "right" });
    doc.text(formatCOP(l.precio_cliente_cop), 480, y, { align: "right" });
    y += 12;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text(`${l.institucion} · Caso ${l.caso_comercial}`, margen + 20, y);
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 26);
    y += 16;
  }

  y += 6;
  doc.line(margen, y, 520, y);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal precio público:", 380, y, { align: "right" });
  doc.text(formatCOP(cot.subtotal_precio_publico_cop), 520, y, { align: "right" });
  y += 16;
  doc.text("Tu precio Campus Pass:", 380, y, { align: "right" });
  doc.text(formatCOP(cot.subtotal_precio_cliente_cop), 520, y, { align: "right" });
  y += 16;
  doc.setTextColor(16, 185, 129);
  doc.text("Ahorras:", 380, y, { align: "right" });
  doc.text(formatCOP(cot.ahorro_cop), 520, y, { align: "right" });

  y += 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  const nota = "Campus Pass by VinkU actúa como intermediario comercial autorizado. El servicio educativo es prestado directamente por cada institución aliada.";
  doc.text(doc.splitTextToSize(nota, 480), margen, y);

  doc.save(`${cot.numero}.pdf`);
}

function abrirWhatsApp(cot: Cotizacion) {
  const msg = `Hola, quiero avanzar con mi ruta Campus Pass.
Cotización: ${cot.numero}
Ruta: ${cot.ruta_nombre}
Total: ${formatCOP(cot.subtotal_precio_cliente_cop)} (ahorro ${formatCOP(cot.ahorro_cop)})`;
  window.open(`${WHATSAPP_ASESOR}?text=${encodeURIComponent(msg)}`, "_blank");
}

export default function VistaCotizacion({ cotizacion, onAprobar }: Props) {
  const dias = diasHabilesRestantes(cotizacion.fecha_vencimiento);
  const porVencer = dias <= 5;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#1A1A1A]">Tu cotización</h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">{cotizacion.numero}</p>
        </div>
        <div className={`text-right text-xs font-bold px-3 py-1.5 rounded-full border-2 ${porVencer ? "bg-red-50 text-red-600 border-red-300" : "bg-white text-zinc-500 border-zinc-200"}`}>
          Vence {fechaLegible(cotizacion.fecha_vencimiento)}
          {porVencer && dias > 0 && <span className="block">¡Quedan {dias} días!</span>}
        </div>
      </div>

      {/* Badge de ahorro */}
      <div className="bg-[#10B981] text-white border-2 border-[#1A1A1A] rounded-xl p-4 mb-4 shadow-[4px_4px_0px_0px_#1A1A1A] text-center">
        <p className="text-xs font-bold uppercase tracking-wider opacity-90">Ahorras vs. precio público</p>
        <p className="font-display font-extrabold text-3xl">{formatCOP(cotizacion.ahorro_cop)}</p>
      </div>

      {/* Tabla */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-xl overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-wider">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Curso</th>
                <th className="p-3 text-left">Caso</th>
                <th className="p-3 text-right">Público</th>
                <th className="p-3 text-right">Tu precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cotizacion.lineas.map((l) => (
                <tr key={l.orden}>
                  <td className="p-3 text-zinc-400">{l.orden}</td>
                  <td className="p-3">
                    <p className="font-bold text-[#1A1A1A]">{l.nombre_curso}</p>
                    <p className="text-[10px] text-zinc-400">{l.institucion}</p>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.caso_comercial === "A" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-zinc-100 text-zinc-500"}`}>{l.caso_comercial}</span>
                  </td>
                  <td className="p-3 text-right text-zinc-400 line-through">{formatCOP(l.precio_publico_cop)}</td>
                  <td className="p-3 text-right font-bold text-[#6C47FF]">{formatCOP(l.precio_cliente_cop)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#1A1A1A] bg-zinc-50">
                <td colSpan={3} className="p-3 font-bold text-right">Totales</td>
                <td className="p-3 text-right text-zinc-400 line-through">{formatCOP(cotizacion.subtotal_precio_publico_cop)}</td>
                <td className="p-3 text-right font-display font-extrabold text-[#1A1A1A]">{formatCOP(cotizacion.subtotal_precio_cliente_cop)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={() => { abrirWhatsApp(cotizacion); onAprobar(); }}
          className="flex-1 px-6 py-3.5 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
        >
          Quiero esta ruta →
        </button>
        <button
          onClick={() => generarPDF(cotizacion)}
          className="px-6 py-3.5 bg-white text-[#1A1A1A] font-bold rounded-xl border-2 border-[#1A1A1A] hover:bg-zinc-50 transition-all"
        >
          Descargar PDF
        </button>
      </div>

      <p className="text-[10px] text-zinc-400 leading-relaxed">
        Campus Pass by VinkU actúa como intermediario comercial autorizado. El servicio educativo es prestado
        directamente por cada institución aliada.
      </p>
    </div>
  );
}
