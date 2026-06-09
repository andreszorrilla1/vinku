// Shared Types for Vinkupass EdTech SaaS Platform

export interface Course {
  id: string;
  title: string;
  university: string;
  level: "Pregrado" | "Posgrado" | "Educación Continua";
  duration: string;
  cost: number;
  skills: string[];
  description: string;
  category: string;
}

export interface Achievement {
  id: string;
  goal: string;
  associatedProducts: string[];
  status: "Definido" | "En Progreso" | "Cumplido";
}

export interface VinkuPassport {
  destinations: { university: string; stampLogo: string; enrollCount: number }[];
  sellos: { courseId: string; courseTitle: string; university: string; dateApproved?: string; status: "Cursando" | "Certificado" }[];
  insignias: { skillName: string; iconName: string; dateEarned: string }[];
  perfiles: { title: string; enabledPercent: number; laborDemand: string; salaryMedian: string }[];
  logros: Achievement[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  creditApproved: number;
  diagnosed: boolean;
  suggestedRoute: string[]; // Course IDs
  passport: VinkuPassport;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  diagStatus: "Pendiente" | "Ruta Generada" | "Matriculado";
  activePath: string[]; // Course names
  progress: number; // percentage
  assignedBudget: number; // in credits
  suggestedRouteCost?: number;
  passport?: VinkuPassport;
}

export interface UniversityStats {
  id: string;
  name: string;
  logo: string;
  uploadedCoursesCount: number;
  enrolledStudentsCount: number;
  totalEarnings: number;
  certificationsPending: {
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
  }[];
}

export interface MentorSession {
  id: string;
  mentorName: string;
  topic: string;
  dateTime: string;
  zoomLink: string;
}

export interface AuthLog {
  timestamp: string;
  type: "REGISTER" | "LOGIN" | "SOCIAL_JWT" | "JWT_VERIFY";
  payload: string;
}
