import { supabase } from './supabase';
import type { Database } from './database.types';

type CourseRow = Database['public']['Tables']['courses']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EnrollmentRow = Database['public']['Tables']['enrollments']['Row'];
type EmployeeRow = Database['public']['Tables']['employees']['Row'];
type UniversityRow = Database['public']['Tables']['universities']['Row'];
type MentorSessionRow = Database['public']['Tables']['mentor_sessions']['Row'];
type AchievementRow = Database['public']['Tables']['achievements']['Row'];

// ============================================================
// COURSES
// ============================================================

export async function fetchCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`*, universities(name, logo_url)`)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCourse(course: Database['public']['Tables']['courses']['Insert']) {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Inserta un curso intentando incluir campos extra (prerequisites, required_docs,
// max_seats). Si la BD aún no tiene esas columnas, reintenta sin ellos.
export async function addCourseResilient(
  base: Database['public']['Tables']['courses']['Insert'],
  extras: Record<string, unknown>
) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert({ ...base, ...extras })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err: any) {
    const msg = String(err?.message ?? '').toLowerCase();
    if (msg.includes('column') || msg.includes('does not exist')) {
      const { data, error } = await supabase
        .from('courses')
        .insert(base)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw err;
  }
}

export async function toggleCourseActive(courseId: string, isActive: boolean) {
  const { error } = await supabase
    .from('courses')
    .update({ is_active: isActive })
    .eq('id', courseId);
  if (error) throw error;
}

// ============================================================
// PROFILE / STUDENT
// ============================================================

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<ProfileRow>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

export async function rechargeStudentWallet(_userId: string, amount: number) {
  // Validación de entrada: solo montos positivos enteros, con tope de seguridad
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('El monto a recargar debe ser un número positivo.');
  }
  const amt = Math.round(amount);
  if (amt > 50_000_000) {
    throw new Error('El monto máximo de recarga es 50.000.000 COP.');
  }

  // RPC SECURITY DEFINER atómico (migración 020): valida sesión, acredita y
  // registra la transacción en una sola operación. Reemplaza el read-modify-write
  // en cliente que sufría el bug de count===null de supabase-js v2.
  const { data: newBalance, error } = await supabase.rpc('recharge_student_wallet', {
    p_amount: amt,
  });
  if (!error) return newBalance as number;

  // Fallback si la migración 020 aún no está aplicada en este entorno
  if (error.message?.includes('Could not find the function') || (error as any).code === 'PGRST202') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sesión no válida.');
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();
    if (!profile) throw new Error('Perfil no encontrado');

    const computed = (profile.wallet_balance ?? 0) + amt;
    const { data: updated, error: upErr } = await supabase
      .from('profiles')
      .update({ wallet_balance: computed })
      .eq('id', user.id)
      .select('wallet_balance')
      .single();
    if (upErr) throw upErr;
    if (!updated) throw new Error('No se pudo actualizar el saldo. Verifica tu sesión.');

    await supabase.from('wallet_transactions').insert({
      profile_id: user.id,
      amount: amt,
      type: 'recharge',
      description: `Recarga de billetera por $${amt.toLocaleString('es-CO')} COP`,
    });
    return updated.wallet_balance as number;
  }

  throw error;
}

// ============================================================
// ENROLLMENTS
// ============================================================

// Fetch enrollments for an employee via their linked profile_id
export async function fetchEmployeeEnrollments(employeeId: string) {
  const { data: emp } = await supabase
    .from('employees')
    .select('profile_id')
    .eq('id', employeeId)
    .single();
  if (!emp?.profile_id) return [];
  return fetchEnrollments(emp.profile_id);
}

export async function fetchEnrollments(userId: string) {
  // Try full select including delivery columns (migration 009)
  const { data, error } = await supabase
    .from('enrollments')
    .select(`*, courses(title, university_id, modality, start_date, access_link, classroom, universities(name))`)
    .eq('student_id', userId);
  if (!error) return data ?? [];

  // Fallback without delivery columns if migration 009 not yet applied
  const { data: d2, error: e2 } = await supabase
    .from('enrollments')
    .select(`*, courses(title, university_id, universities(name))`)
    .eq('student_id', userId);
  if (e2) throw e2;
  return d2 ?? [];
}

export async function enrollCourse(studentId: string, courseId: string, creditsSpent: number) {
  // Validación de entrada
  if (!Number.isFinite(creditsSpent) || creditsSpent < 0) {
    throw new Error('El costo del curso no es válido.');
  }

  // Matrícula exclusivamente vía RPC SECURITY DEFINER (migración 018): atómica
  // (inserta enrollment, descuenta wallet, registra transacción y sella el
  // pasaporte en una sola transacción). NO usamos un fallback en cliente porque
  // sería una secuencia no-atómica que podría matricular gratis o hacer
  // double-spend si falla a mitad de camino.
  const { data: rpcId, error: rpcErr } = await supabase.rpc('enroll_course_rpc', {
    p_course_id:     courseId,
    p_credits_spent: Math.round(creditsSpent),
  });
  if (!rpcErr) return { id: rpcId as string, course_id: courseId, student_id: studentId, status: 'Cursando', credits_spent: creditsSpent };

  if (rpcErr.message?.includes('Could not find the function') || (rpcErr as any).code === 'PGRST202') {
    throw new Error('La matrícula no está disponible: falta aplicar la migración 018 en la base de datos. Contacta al administrador.');
  }

  throw rpcErr;
}

export async function certifyEnrollment(enrollmentId: string, certificateUrl?: string) {
  // 1. Actualizar estado de la matrícula
  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .update({
      status: 'Certificado',
      completed_at: new Date().toISOString(),
      certificate_url: certificateUrl ?? null,
    })
    .eq('id', enrollmentId)
    .select('student_id, course_id')
    .single();
  if (error) throw error;

  // 2. Crear skill_badges por cada habilidad del curso certificado
  if (enrollment) {
    const { data: course } = await supabase
      .from('courses')
      .select('skills')
      .eq('id', enrollment.course_id)
      .single();
    if (course?.skills?.length) {
      const badges = course.skills.map((skill: string) => ({
        student_id: enrollment.student_id,
        skill_name: skill,
        icon_name: 'award',
      }));
      // upsert silencioso — ignora duplicados
      await supabase.from('skill_badges').upsert(badges, { onConflict: 'student_id,skill_name', ignoreDuplicates: true }).catch(() => {});
    }
  }
}

// ============================================================
// PASSPORT
// ============================================================

export async function fetchPassportStamps(userId: string) {
  const { data, error } = await supabase
    .from('passport_stamps')
    .select(`*, universities(name, logo_url)`)
    .eq('student_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchSkillBadges(userId: string) {
  const { data, error } = await supabase
    .from('skill_badges')
    .select('*')
    .eq('student_id', userId);
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

export async function fetchAchievements(userId: string) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addAchievement(achievement: Database['public']['Tables']['achievements']['Insert']) {
  const { data, error } = await supabase
    .from('achievements')
    .insert(achievement)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAchievement(id: string, updates: Partial<AchievementRow>) {
  const { error } = await supabase
    .from('achievements')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ============================================================
// DIAGNÓSTICO
// ============================================================

export async function saveDiagnosticResult(
  userId: string,
  suggestedRoute: string[],
  suggestedLabel: string
) {
  const { error } = await supabase
    .from('profiles')
    .update({
      diagnosed: true,
      suggested_route: suggestedRoute,
    })
    .eq('id', userId);
  if (error) throw error;
  return { route: suggestedRoute, label: suggestedLabel };
}

// ============================================================
// MENTOR SESSIONS (Fellowship)
// ============================================================

export async function fetchMentorSessions(userId: string) {
  const { data, error } = await supabase
    .from('mentor_sessions')
    .select('*')
    .eq('student_id', userId)
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function bookMentorSession(session: Database['public']['Tables']['mentor_sessions']['Insert']) {
  const { data, error } = await supabase
    .from('mentor_sessions')
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// UNIVERSITIES
// ============================================================

export async function fetchUniversities() {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .eq('approval_status', 'Aprobada')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchUniversityWithStats(universityId: string) {
  const [uniRes, coursesRes, enrollmentsRes] = await Promise.all([
    supabase.from('universities').select('*').eq('id', universityId).single(),
    supabase.from('courses').select('*').eq('university_id', universityId),
    supabase
      .from('enrollments')
      .select(`*, courses!inner(university_id), profiles(full_name, email)`)
      .eq('courses.university_id', universityId),
  ]);
  return {
    university: uniRes.data,
    courses: coursesRes.data ?? [],
    enrollments: enrollmentsRes.data ?? [],
  };
}

// ============================================================
// COMPANIES & EMPLOYEES
// ============================================================

export async function fetchCompany(companyId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();
  if (error) return null;
  return data;
}

export async function fetchEmployees(companyId: string): Promise<EmployeeRow[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

// Link profile to company using SECURITY DEFINER RPC (bypasses RLS on profiles UPDATE)
export async function linkProfileCompany(companyId: string): Promise<void> {
  const { error } = await supabase.rpc('link_profile_company', { p_company_id: companyId });
  if (error && !(error.message?.includes('Could not find the function') || (error as any).code === 'PGRST202')) {
    // Fallback to direct update (works if UPDATE policy exists)
    await supabase.from('profiles').update({ company_id: companyId }).eq('id', (await supabase.auth.getUser()).data.user?.id ?? '');
  }
}

export async function linkProfileUniversity(universityId: string): Promise<void> {
  const { error } = await supabase.rpc('link_profile_university', { p_university_id: universityId });
  if (error && !(error.message?.includes('Could not find the function') || (error as any).code === 'PGRST202')) {
    await supabase.from('profiles').update({ university_id: universityId }).eq('id', (await supabase.auth.getUser()).data.user?.id ?? '');
  }
}

export async function addEmployee(employee: Database['public']['Tables']['employees']['Insert']) {
  // Try SECURITY DEFINER RPC first (migration 015)
  const { data, error } = await supabase.rpc('insert_employee', {
    p_company_id:  employee.company_id,
    p_name:        employee.name,
    p_email:       employee.email,
    p_role_title:  employee.role_title ?? null,
    p_department:  employee.department ?? null,
    p_budget:      employee.assigned_budget ?? 0,
  });
  if (!error) return data as string;

  // Fallback to direct insert if RPC not yet deployed in this environment
  if (error.message?.includes('Could not find the function') || (error as any).code === 'PGRST202') {
    const { data: d2, error: e2 } = await supabase
      .from('employees')
      .insert({
        company_id:       employee.company_id,
        name:             employee.name,
        email:            employee.email,
        role_title:       employee.role_title ?? null,
        department:       employee.department ?? null,
        assigned_budget:  employee.assigned_budget ?? 0,
        diag_status:      'Pendiente',
        active_path:      null,
        progress_pct:     0,
        suggested_route_cost: null,
      })
      .select('id')
      .single();
    if (e2) throw e2;
    return d2?.id as string;
  }

  throw error;
}

export async function updateEmployee(id: string, updates: { name?: string; role_title?: string; department?: string }) {
  const { error } = await supabase.from('employees').update(updates).eq('id', id);
  if (error) throw error;
}

export async function removeEmployee(id: string) {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}

export async function updateCompany(id: string, updates: { name?: string; nit?: string; industry?: string; size_employees?: number | null; contact_name?: string }) {
  // Verificamos con .select() en vez de `count`: supabase-js v2 devuelve count:null
  // por defecto en UPDATE, por lo que `count === 0` nunca detecta un bloqueo de RLS.
  const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No se pudo actualizar la empresa. Verifica tu sesión.');
}

export async function sendEmployeeDiagnosis(employeeId: string, companyId: string, objective: string, deadline: string | null) {
  const { error } = await supabase
    .from('employees')
    .update({ diag_status: 'Ruta Generada' })
    .eq('id', employeeId)
    .eq('company_id', companyId);
  if (error) throw error;

  const { data: company } = await supabase.from('companies').select('name, contact_email').eq('id', companyId).single();
  await supabase.from('leads').insert({
    company_name: company?.name ?? companyId,
    contact_email: company?.contact_email ?? '',
    message: `Diagnóstico individual: ${objective}${deadline ? ` | Fecha límite: ${deadline}` : ''}`,
    source: 'diagnostico_individual',
  }).catch(() => {});
}

export async function assignEmployeeBudget(employeeId: string, companyId: string, amount: number) {
  // Try SECURITY DEFINER RPC first (migration 016)
  const { data, error } = await supabase.rpc('assign_employee_budget', {
    p_employee_id: employeeId,
    p_company_id:  companyId,
    p_amount:      amount,
  });
  if (!error) return data as number;

  // Fallback if RPC not deployed yet
  if (!error.message?.includes('Could not find the function') && (error as any).code !== 'PGRST202') {
    throw error;
  }

  // Direct fallback
  const { data: company } = await supabase.from('companies').select('wallet_balance').eq('id', companyId).single();
  if (!company) throw new Error('Empresa no encontrada');
  if (company.wallet_balance < amount) throw new Error('Saldo insuficiente en billetera corporativa');

  const { data: emp } = await supabase.from('employees').select('assigned_budget, profile_id').eq('id', employeeId).single();
  if (!emp) throw new Error('Empleado no encontrado');

  const newCompanyBalance = company.wallet_balance - amount;

  const { error: e1 } = await supabase.from('employees').update({ assigned_budget: emp.assigned_budget + amount }).eq('id', employeeId);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('companies').update({ wallet_balance: newCompanyBalance }).eq('id', companyId);
  if (e2) throw e2;

  if (emp.profile_id) {
    const { data: prof } = await supabase.from('profiles').select('wallet_balance').eq('id', emp.profile_id).single();
    if (prof) {
      await supabase.from('profiles').update({ wallet_balance: (prof.wallet_balance ?? 0) + amount }).eq('id', emp.profile_id);
      await supabase.from('wallet_transactions').insert({ profile_id: emp.profile_id, amount, type: 'allocation', description: 'Créditos asignados por empresa' }).catch(() => {});
    }
  }

  await supabase.from('wallet_transactions').insert({ company_id: companyId, amount: -amount, type: 'allocation', description: 'Asignación de créditos a colaborador' }).catch(() => {});
  return newCompanyBalance;
}

export async function sendBulkDiagnosis(companyId: string, objective: string, deadline: string | null) {
  const { data: company } = await supabase.from('companies').select('name, contact_email').eq('id', companyId).single();

  const { error } = await supabase
    .from('employees')
    .update({ diag_status: 'Ruta Generada' })
    .eq('company_id', companyId)
    .eq('diag_status', 'Pendiente');
  if (error) throw error;

  await supabase.from('leads').insert({
    company_name: company?.name ?? companyId,
    contact_email: company?.contact_email ?? '',
    message: `Diagnóstico masivo: ${objective}${deadline ? ` | Fecha límite: ${deadline}` : ''}`,
    source: 'diagnostico_masivo',
  }).catch(() => {});
}

export async function rechargeCorporateWallet(companyId: string, amount: number) {
  // Try SECURITY DEFINER RPC first (migration 016)
  const { data, error } = await supabase.rpc('recharge_corporate_wallet', {
    p_company_id: companyId,
    p_amount:     amount,
  });
  if (!error) return data as number;

  // Fallback if RPC not deployed yet
  if (!error.message?.includes('Could not find the function') && (error as any).code !== 'PGRST202') {
    throw error;
  }

  // Direct fallback
  const { data: company } = await supabase.from('companies').select('wallet_balance').eq('id', companyId).single();
  if (!company) throw new Error('Empresa no encontrada');

  const newBalance = company.wallet_balance + amount;
  const { error: e2 } = await supabase.from('companies').update({ wallet_balance: newBalance }).eq('id', companyId);
  if (e2) throw e2;

  await supabase.from('wallet_transactions').insert({
    company_id: companyId,
    amount,
    type: 'recharge',
    description: `Recarga corporativa por $${amount.toLocaleString('es-CO')} COP`,
  }).catch(() => {});

  return newBalance;
}

// ============================================================
// LEADS
// ============================================================

export async function submitLead(lead: Database['public']['Tables']['leads']['Insert']) {
  const { error } = await supabase.from('leads').insert(lead);
  if (error) throw error;
}

// ============================================================
// WALLET TRANSACTIONS
// ============================================================

export async function fetchWalletTransactions(userId: string) {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function fetchCorporateTransactions(companyId: string) {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// UNIVERSITY ADMIN — SETUP & MANAGEMENT
// ============================================================

export async function fetchUniversityList(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('universities')
    .select('id, name')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function linkUniversityToProfile(userId: string, universityId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ university_id: universityId })
    .eq('id', userId);
  if (error) throw error;
}

export async function createUniversity(data: { name: string; city?: string; nit?: string }) {
  const { data: uni, error } = await supabase
    .from('universities')
    .insert({
      name: data.name,
      legal_nit: data.nit ?? null,
      contact_email: '',
      approval_status: 'Pendiente' as const,
      total_earnings: 0,
      liquid_balance: 0,
    })
    .select('id, name')
    .single();
  if (error) throw error;
  return uni;
}

export async function markEnrollmentCompleted(enrollmentId: string) {
  const { error } = await supabase
    .from('enrollments')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', enrollmentId);
  if (error) throw error;
}

export async function updateUniversity(
  universityId: string,
  updates: { name?: string; logo_url?: string | null; contact_email?: string }
) {
  const { error } = await supabase
    .from('universities')
    .update(updates)
    .eq('id', universityId);
  if (error) throw error;
}

export async function markEnrollmentStarted(enrollmentId: string) {
  const { error } = await supabase
    .from('enrollments')
    .update({ started_at: new Date().toISOString() })
    .eq('id', enrollmentId);
  if (error) throw error;
}

// Acredita ingresos a la universidad tras una certificación.
// Bruto al total_earnings; 80% (neto) al liquid_balance. Silencioso si RLS lo bloquea.
export async function addUniversityEarnings(universityId: string, grossAmount: number) {
  try {
    const { data: uni } = await supabase
      .from('universities')
      .select('total_earnings, liquid_balance')
      .eq('id', universityId)
      .single();
    if (!uni) return;
    await supabase
      .from('universities')
      .update({
        total_earnings: (uni.total_earnings ?? 0) + grossAmount,
        liquid_balance: (uni.liquid_balance ?? 0) + Math.round(grossAmount * 0.8),
      })
      .eq('id', universityId);
  } catch (err) {
    console.warn('addUniversityEarnings falló (probablemente RLS):', err);
  }
}

export async function deleteCourse(courseId: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);
  if (error) throw error;
}

export async function updateCourse(courseId: string, updates: {
  title?: string;
  description?: string | null;
  level?: string;
  duration?: string;
  cost_credits?: number;
  skills?: string[];
  category?: string;
  modality?: string | null;
  start_date?: string | null;
  access_link?: string | null;
  classroom?: string | null;
  max_seats?: number | null;
}) {
  const { error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId);
  if (error) throw error;
}
