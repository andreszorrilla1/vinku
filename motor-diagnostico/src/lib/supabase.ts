// ============================================================================
// Cliente Supabase. Opcional en local: si no hay variables de entorno, la app
// corre con el catálogo mock en memoria (data/mockCatalog.ts) y el repositorio
// resuelve todo sin backend. Esto permite recorrer el vertical completo sin
// un proyecto Supabase conectado.
// ============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const HAY_SUPABASE = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = HAY_SUPABASE
  ? createClient(url as string, anonKey as string)
  : null;
