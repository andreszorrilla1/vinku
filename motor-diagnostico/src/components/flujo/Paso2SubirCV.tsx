// Paso 2 — Subir la hoja de vida y extraer habilidades contra el catálogo cerrado.
// El parseo de PDF/Word ocurre del lado servidor (Edge Function). En local se
// puede pegar el texto o cargar un .txt, y usar CVs de ejemplo para la demo.
import { useState } from 'react';
import { ArrowRight, FileText, Loader2, Upload } from 'lucide-react';
import { extraerHabilidadesDeCV } from '@/services/extraccionCV';
import type { CvExtractionResult } from '@/lib/types';
import type { Catalogo } from '@/data/catalogoRepo';
import { MARCA } from '@/lib/marca';
import { Boton, Card } from '@/components/ui/kit';

const CV_EJEMPLO_CONTABLE = `Auxiliar contable con 3 años de experiencia. Manejo de contabilidad, causación y conciliaciones bancarias. Facturación electrónica y manejo de Excel avanzado con tablas dinámicas. Coordiné un equipo de 4 personas en cierres de mes cumpliendo plazos ajustados. Conocimientos de inglés intermedio.`;

const CV_EJEMPLO_VENTAS = `Vendedor en tienda de retail. Atendí clientes y manejé reclamos y postventa en un call center. Superé la cuota de ventas trimestral. Manejo de CRM Salesforce y redes sociales para prospección. Trabajo bajo alta demanda.`;

export function Paso2SubirCV({ catalogo, onExtraido }: { catalogo: Catalogo; onExtraido: (r: CvExtractionResult) => void }) {
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);

  async function procesar() {
    if (!texto.trim()) return;
    setCargando(true);
    try {
      const r = await extraerHabilidadesDeCV(texto.trim(), catalogo.skills);
      onExtraido(r);
    } finally {
      setCargando(false);
    }
  }

  async function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type === 'text/plain' || f.name.endsWith('.txt')) {
      setTexto(await f.text());
    } else {
      // PDF/Word: en producción va a la Edge Function; en demo pedimos pegar texto.
      setTexto(
        `[Archivo "${f.name}" recibido. En producción el texto se extrae en el servidor. Para la demo, pega aquí el texto de tu hoja de vida.]`,
      );
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Sube tu hoja de vida</h1>
        <p className="text-marca-gris">
          Vamos a sugerirte habilidades a partir de tu experiencia. Solo son sugerencias:
          tú confirmas en el siguiente paso.
        </p>
      </header>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <label
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold"
            style={{ borderColor: MARCA.violeta, color: MARCA.violeta }}
          >
            <Upload size={16} /> Cargar archivo (.txt, PDF, Word)
            <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={onArchivo} />
          </label>
          <span className="text-sm text-marca-gris">o pega el texto abajo</span>
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={8}
          placeholder="Pega aquí el contenido de tu hoja de vida…"
          className="mt-4 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
          style={{ borderColor: MARCA.bordeSuave }}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-marca-gris">¿Sin CV a mano? Prueba con un ejemplo:</span>
          <button className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium" style={{ color: MARCA.violeta }} onClick={() => setTexto(CV_EJEMPLO_CONTABLE)}>
            <FileText size={14} /> Perfil contable
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium" style={{ color: MARCA.violeta }} onClick={() => setTexto(CV_EJEMPLO_VENTAS)}>
            <FileText size={14} /> Perfil ventas
          </button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Boton onClick={procesar} disabled={!texto.trim() || cargando}>
          {cargando ? <><Loader2 size={16} className="animate-spin" /> Analizando…</> : <>Analizar mi CV <ArrowRight size={16} /></>}
        </Boton>
      </div>
    </div>
  );
}
