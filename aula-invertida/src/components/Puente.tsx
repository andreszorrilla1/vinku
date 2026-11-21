import { ESTACIONES } from "../lib/motor";

// El puente de VinkU edu como medidor del encargo:
// nodo abierto (lo que sabes) → 60 % IA → 40 % humano → nodo lleno (donde se necesita).
const P0 = [20, 100], P1 = [160, -28], P2 = [300, 100];
const punto = (t: number) => {
  const a = (1 - t) ** 2, b = 2 * (1 - t) * t, c = t ** 2;
  return [a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1]];
};
const tramo = (t0: number, t1: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) { const [x, y] = punto(t0 + ((t1 - t0) * i) / 40); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
  return pts.join(" ");
};

export default function Puente({ avance, actual = -1, alto = 150 }: { avance: number; actual?: number; alto?: number }) {
  const f = Math.max(0, Math.min(100, avance)) / 100;
  return (
    <svg viewBox="0 0 320 124" width="100%" height={alto} role="img" aria-label={`Avance de la herramienta: ${Math.round(avance)} %`}>
      <defs>
        <linearGradient id="pg" x1="0" x2="1"><stop offset="0" stopColor="#86CBB9" /><stop offset=".6" stopColor="#86CBB9" /><stop offset="1" stopColor="#FF8A4C" /></linearGradient>
      </defs>
      <polyline points={tramo(0, 0.6)} fill="none" stroke="#86CBB9" strokeOpacity=".22" strokeWidth="9" strokeLinecap="round" />
      <polyline points={tramo(0.6, 1)} fill="none" stroke="#FF8A4C" strokeOpacity=".22" strokeWidth="9" strokeLinecap="round" />
      {f > 0 && <polyline points={tramo(0, f)} fill="none" stroke="url(#pg)" strokeWidth="9" strokeLinecap="round" />}
      {(() => { const [x, y] = punto(0.6); return <line x1={x} y1={y - 12} x2={x} y2={y + 12} stroke="#EEF4F1" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="3 3" />; })()}
      {ESTACIONES.slice(0, -1).map((t, i) => {
        const [x, y] = punto(t); const hecha = f >= t - 0.001;
        return <circle key={i} cx={x} cy={y} r={i === actual ? 7.5 : 5} fill={hecha ? (t > 0.6 ? "#FF8A4C" : "#86CBB9") : "#0D2F33"} stroke={i === actual ? "#fff" : t > 0.6 ? "#FF8A4C" : "#86CBB9"} strokeWidth="2.5" />;
      })}
      <circle cx={P0[0]} cy={P0[1]} r="12" fill="#0D2F33" stroke="#86CBB9" strokeWidth="5" />
      <circle cx={P2[0]} cy={P2[1]} r="14" fill="#FF8A4C" opacity={f >= 1 ? 1 : 0.55} stroke={actual === ESTACIONES.length - 1 ? "#fff" : "none"} strokeWidth="2.5" />
    </svg>
  );
}

export function Isotipo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M9 17v8a11 11 0 0 0 22 0v-8" fill="none" stroke="#EEF4F1" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M9 9.5Q20 1 31 9.5" fill="none" stroke="#86CBB9" strokeWidth="3" strokeLinecap="round" />
      <circle cx="9" cy="10" r="3.4" fill="#0D2F33" stroke="#86CBB9" strokeWidth="2.2" />
      <circle cx="31" cy="10" r="4" fill="#FF8A4C" />
    </svg>
  );
}
