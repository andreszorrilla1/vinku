// ============================================================================
// Identidad de marca VinkU (sección 9).
// Uso funcional y limpio: los colores y tipografía de marca, sin la estética
// pop-art completa del material de marketing. El amarillo es acento, nunca
// texto sobre blanco ni fondo grande (falla contraste).
// ============================================================================

export const MARCA = {
  amarillo: '#FFD000', // acento — nunca texto sobre blanco, nunca fondo grande
  oscuro: '#1A1A1A',
  violeta: '#6C47FF', // color de marca (la "U" del logo)
  violetaSuave: '#EFEAFF',
  blancoHueso: '#FAFAFA',
  gris: '#6B6B72',
  bordeSuave: '#E7E5EC',
} as const;

// Distinción visual obligatoria (regla 7.2): una habilidad autodeclarada NUNCA
// se ve igual que una validada. Estos estilos son la fuente de esa distinción.
export const ESTADO_HABILIDAD = {
  autodeclarada: {
    label: 'Autodeclarada',
    bg: '#FFF7DB',
    borde: '#F0D780',
    texto: '#7A5B00',
    ayuda: 'Lo que tú nos contaste. Aún sin evidencia formal.',
  },
  validada_skillpass: {
    label: 'Validada · SkillPass',
    bg: '#E9F7EE',
    borde: '#9FD9B4',
    texto: '#1F6B3B',
    ayuda: 'Verificada con evidencia a través de SkillPass.',
  },
  ajustada_skillpass: {
    label: 'Ajustada · SkillPass',
    bg: '#E9F1FB',
    borde: '#A7C4EC',
    texto: '#1F4E8B',
    ayuda: 'Reforzada con un ajuste corto de SkillPass.',
  },
  brecha_identificada: {
    label: 'Por desarrollar',
    bg: '#FBECEC',
    borde: '#E7B4B4',
    texto: '#9B2C2C',
    ayuda: 'Una habilidad que aún no tienes y te acerca a tu meta.',
  },
} as const;

export type EstadoHabilidadKey = keyof typeof ESTADO_HABILIDAD;
