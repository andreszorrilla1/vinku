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

export async function rechargeStudentWallet(userId: string, amount: number) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();
  if (!profile) throw new Error('Perfil no encontrado');

  const newBalance = (profile.wallet_balance ?? 0) + amount;

  const { error } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', userId);
  if (error) throw error;

  await supabase.from('wallet_transactions').insert({
    profile_id: userId,
    amount,
    type: 'recharge',
    description: `Recarga de billetera por $${amount.toLocaleString('es-CO')} COP`,
  });

  return newBalance;
}

// ============================================================
// ENROLLMENTS
// ============================================================

export async function fetchEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`*, courses(title, university_id, modality, start_date, access_link, classroom, universities(name))`)
    .eq('student_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function enrollCourse(studentId: string, courseId: string, creditsSpent: number) {
  // Verificar saldo
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', studentId)
    .single();

  if (!profile || (profile.wallet_balance ?? 0) < creditsSpent) {
    throw new Error('Saldo insuficiente en la billetera');
  }

  // Crear matrícula
  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .insert({ student_id: studentId, course_id: courseId, credits_spent: creditsSpent })
    .select()
    .single();
  if (error) throw error;

  // Descontar saldo
  await supabase
    .from('profiles')
    .update({ wallet_balance: (profile.wallet_balance ?? 0) - creditsSpent })
    .eq('id', studentId);

  // Registrar transacción
  await supabase.from('wallet_transactions').insert({
    profile_id: studentId,
    amount: -creditsSpent,
    type: 'enrollment',
    description: 'Matrícula de curso',
    reference_id: enrollment.id,
  });

  // Actualizar sello del pasaporte (upsert)
  const { data: course } = await supabase
    .from('courses')
    .select('university_id')
    .eq('id', courseId)
    .single();

  if (course) {
    const { data: existingStamp } = await supabase
      .from('passport_stamps')
      .select('id, enroll_count')
      .eq('student_id', studentId)
      .eq('university_id', course.university_id)
      .single();

    if (existingStamp) {
      await supabase
        .from('passport_stamps')
        .update({ enroll_count: existingStamp.enroll_count + 1 })
        .eq('id', existingStamp.id);
    } else {
      await supabase.from('passport_stamps').insert({
        student_id: studentId,
        university_id: course.university_id,
        enroll_count: 1,
      });
    }
  }

  return enrollment;
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

export async function addEmployee(employee: Database['public']['Tables']['employees']['Insert']) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function assignEmployeeBudget(employeeId: string, amount: number) {
  const { data: emp } = await supabase
    .from('employees')
    .select('assigned_budget')
    .eq('id', employeeId)
    .single();
  if (!emp) throw new Error('Empleado no encontrado');

  const { error } = await supabase
    .from('employees')
    .update({ assigned_budget: emp.assigned_budget + amount })
    .eq('id', employeeId);
  if (error) throw error;
}

export async function sendBulkDiagnosis(companyId: string, objective: string, deadline: string | null) {
  // Marca todos los empleados "Pendiente" de la empresa como "Ruta Generada"
  const { error } = await supabase
    .from('employees')
    .update({ diag_status: 'Ruta Generada' })
    .eq('company_id', companyId)
    .eq('diag_status', 'Pendiente');
  if (error) throw error;
  // Registra el envío como lead interno para trazabilidad
  await supabase.from('leads').insert({
    company_name: companyId,
    contact_email: '',
    message: `Diagnóstico masivo: ${objective}${deadline ? ` | Fecha límite: ${deadline}` : ''}`,
    source: 'diagnostico_masivo',
  }).throwOnError().catch(() => {});
}

export async function rechargeCorporateWallet(companyId: string, amount: number) {
  const { data: company } = await supabase
    .from('companies')
    .select('wallet_balance')
    .eq('id', companyId)
    .single();
  if (!company) throw new Error('Empresa no encontrada');

  const newBalance = company.wallet_balance + amount;
  const { error } = await supabase
    .from('companies')
    .update({ wallet_balance: newBalance })
    .eq('id', companyId);
  if (error) throw error;

  await supabase.from('wallet_transactions').insert({
    company_id: companyId,
    amount,
    type: 'recharge',
    description: `Recarga corporativa por $${amount.toLocaleString('es-CO')} COP`,
  });

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
