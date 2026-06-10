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
    .select(`*, courses(title, university_id, universities(name))`)
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
    await supabase.from('passport_stamps').upsert(
      { student_id: studentId, university_id: course.university_id, enroll_count: 1 },
      { onConflict: 'student_id,university_id', ignoreDuplicates: false }
    );
  }

  return enrollment;
}

export async function certifyEnrollment(enrollmentId: string, certificateUrl?: string) {
  const { error } = await supabase
    .from('enrollments')
    .update({
      status: 'Certificado',
      completed_at: new Date().toISOString(),
      certificate_url: certificateUrl ?? null,
    })
    .eq('id', enrollmentId);
  if (error) throw error;
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

export async function deleteCourse(courseId: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);
  if (error) throw error;
}
