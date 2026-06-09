import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Course, Student, Employee, UniversityStats, MentorSession, AuthLog, Achievement } from "./src/types";

// Crypto simulation helper for JWT and BCRYPT Hashing demonstration
function simulateBcryptHash(password: string): { salt: string; hash: string } {
  // Simulate standard salt generation "$2b$10$..."
  const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let saltSuffix = "";
  for (let i = 0; i < 22; i++) {
    saltSuffix += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  const salt = `$2b$12$${saltSuffix}`;
  
  // Real-looking hash simulation
  let hashVal = 0;
  for (let i = 0; i < password.length; i++) {
    hashVal = (hashVal << 5) - hashVal + password.charCodeAt(i);
    hashVal |= 0;
  }
  const simulatedDigest = Math.abs(hashVal).toString(16).padEnd(31, "abcdef78923");
  const hash = `${salt}.${simulatedDigest}`;
  
  return { salt, hash };
}

function simulateJwtSign(payload: object): string {
  // Base64Url encode helpers
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const header = { alg: "HS256", typ: "JWT" };
  const partialToken = `${b64(header)}.${b64(payload)}`;
  // Simulated signature
  const signature = Buffer.from(partialToken + "vinkupass-super-secret-key-256").toString("base64url").slice(0, 43);
  return `${partialToken}.${signature}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === IN-MEMORY STATE ===
  
  // 1. Initial Courses Library
  let courses: Course[] = [
    {
      id: "c-1",
      title: "Arquitectura e Integración de Sistemas en la Nube",
      university: "Universidad de los Andes",
      level: "Educación Continua",
      duration: "6 Semanas",
      cost: 450,
      skills: ["Cloud Architecture", "AWS", "API Design"],
      description: "Aprende a estructurar plataformas distribuidas utilizando servicios modernos en la nube, garantizando resiliencia y alta disponibilidad corporativa.",
      category: "Ingeniería & Tech"
    },
    {
      id: "c-2",
      title: "Estrategias de Growth Marketing y Analítica Digital",
      university: "IE Business School",
      level: "Posgrado",
      duration: "8 Semanas",
      cost: 890,
      skills: ["Growth Hacking", "CRO", "Data Analytics"],
      description: "Optimiza embudos de conversión, configura analítica avanzada e interactúa con métricas que escalan startups y productos consolidados.",
      category: "Negocios & Marketing"
    },
    {
      id: "c-3",
      title: "Desarrollo Fullstack Profesional con React y Node.js",
      university: "Tec de Monterrey",
      level: "Educación Continua",
      duration: "10 Semanas",
      cost: 620,
      skills: ["React", "Express", "PostgreSQL", "REST APIs"],
      description: "Construye verdaderas aplicaciones web de extremo a extremo, aplicando patrones escalables y despliegue rápido con contenedores.",
      category: "Ingeniería & Tech"
    },
    {
      id: "c-4",
      title: "Diplomado en Inteligencia Artificial y Machine Learning",
      university: "Pontificia Universidad Católica",
      level: "Posgrado",
      duration: "12 Semanas",
      cost: 1100,
      skills: ["Python", "TensorFlow", "Generative AI", "Data Science"],
      description: "Inscríbete en el programa de frontera técnica e implementa redes neuronales, modelos predictivos y lógica generativa para resolver problemas reales.",
      category: "AI & Data Science"
    },
    {
      id: "c-5",
      title: "Especialización en Liderazgo de Producto y UX",
      university: "Universidad de Buenos Aires",
      level: "Pregrado",
      duration: "5 Semanas",
      cost: 380,
      skills: ["Product Management", "UX Research", "Figma"],
      description: "Lidera equipos multidisciplinarios definiendo el sitemap, los flujos de experiencia de usuario y las promesas de valor de plataformas SaaS interactuando con clientes.",
      category: "Diseño & UX"
    },
    {
      id: "c-6",
      title: "Finanzas para Emprendedores y Modelamiento Financiero",
      university: "Tec de Monterrey",
      level: "Educación Continua",
      duration: "4 Semanas",
      cost: 290,
      skills: ["Financial Models", "Excel Pro", "SaaS Metrics"],
      description: "Domina el flujo de caja, las proyecciones financieras para levantar capital y el cálculo de métricas vitales como LTV, CAC y Churn.",
      category: "Negocios & Marketing"
    },
    {
      id: "c-7",
      title: "Sostenibilidad Corporativa, Impacto Social y Estrategia ASG",
      university: "IE Business School",
      level: "Posgrado",
      duration: "6 Semanas",
      cost: 520,
      skills: ["Estrategia ASG", "ESG", "Economía Circular", "Carbono Neutro"],
      description: "Aprende a formular y auditar estrategias de sostenibilidad alineadas con marcos globales ASG (Ambiental, Social y Gobernanza), impulsando la resiliencia climática.",
      category: "Sostenibilidad & ASG"
    },
    {
      id: "c-8",
      title: "Ciberseguridad Empresarial y Gestión de Riesgos Digitales",
      university: "Universidad de los Andes",
      level: "Educación Continua",
      duration: "8 Semanas",
      cost: 750,
      skills: ["Ciberseguridad", "DevSecOps", "ISO 27001", "Pentesting"],
      description: "Protege la infraestructura tecnológica de empresas medianas y grandes, gestionando vulnerabilidades y configurando arquitecturas defensivas de primer nivel.",
      category: "Tecnología & Seguridad"
    },
    {
      id: "c-9",
      title: "Descarbonización Industrial y Eficiencia Energética",
      university: "Tec de Monterrey",
      level: "Educación Continua",
      duration: "7 Semanas",
      cost: 480,
      skills: ["Huella de Carbono", "Eficiencia", "Sostenibilidad"],
      description: "Aprende metodologías avanzadas de medición de gases de efecto invernadero y estrategias para la transición de tu organización hacia la carbono-neutralidad.",
      category: "Sostenibilidad & ASG"
    }
  ];

  // 2. Active Student State (mock individual user: "Diana Prince")
  let currentStudent: Student = {
    id: "s-101",
    name: "Diana Prince",
    email: "diana.prince@vinkupass.com",
    walletBalance: 1250,
    creditApproved: 1500,
    diagnosed: true,
    suggestedRoute: ["c-1", "c-3", "c-5"], // 3-course track initially suggested
    passport: {
      destinations: [
        { university: "Universidad de los Andes", stampLogo: "UniAndes", enrollCount: 1 },
        { university: "Tec de Monterrey", stampLogo: "TecMTY", enrollCount: 1 }
      ],
      sellos: [
        { courseId: "c-1", courseTitle: "Arquitectura e Integración de Sistemas en la Nube", university: "Universidad de los Andes", dateApproved: "2026-04-12", status: "Certificado" },
        { courseId: "c-3", courseTitle: "Desarrollo Fullstack Profesional con React y Node.js", university: "Tec de Monterrey", dateApproved: undefined, status: "Cursando" }
      ],
      insignias: [
        { skillName: "Cloud Architecture", iconName: "Cloud", dateEarned: "2026-04-12" },
        { skillName: "API Design", iconName: "Layers", dateEarned: "2026-04-12" }
      ],
      perfiles: [
        { title: "SaaS Tech Lead", enabledPercent: 65, laborDemand: "Muy Alta", salaryMedian: "USD 5,200 / mes" },
        { title: "Fullstack Architect", enabledPercent: 40, laborDemand: "Crítica", salaryMedian: "USD 6,500 / mes" }
      ],
      logros: [
        { id: "l-1", goal: "Lanzar mi primer MVP funcional para una startup SaaS", associatedProducts: ["Repositorio backend en Node.js", "Arquitectura de base de datos Postgres"], status: "En Progreso" },
        { id: "l-2", goal: "Dominar integraciones seguras de APIs de terceros", associatedProducts: ["API Proxy en Express", "Esquema JWT de autenticación"], status: "Cumplido" }
      ]
    }
  };

  // 3. Corporate Dashboard State ("Vinkupass Corp")
  let corporateBudgetLeft = 7500;
  let corporateTransactions = [
    { id: "tx-1", date: "2026-06-03", type: "Carga de fondos", amount: 5000, detail: "Fondeo inicial de cuenta corporativa", status: "Completado" },
    { id: "tx-2", date: "2026-06-03", type: "Dispersión a colaborador", amount: 450, detail: "Esteban Córdoba (SRE Junior)", status: "Completado" },
    { id: "tx-3", date: "2026-06-04", type: "Dispersión a colaborador", amount: 1000, detail: "Laura Restrepo (Frontend Dev)", status: "Completado" },
    { id: "tx-4", date: "2026-06-04", type: "Dispersión a colaborador", amount: 890, detail: "Gabriel Medina (Product Marketer)", status: "Completado" },
    { id: "tx-5", date: "2026-06-04", type: "Dispersión a colaborador", amount: 1100, detail: "Sofía Martínez (Analista Datos)", status: "Completado" }
  ];
  let corporateEmployees: Employee[] = [
    {
      id: "emp-1",
      name: "Esteban Córdoba",
      email: "esteban.cordoba@vinkupass.com",
      role: "SRE Junior",
      department: "Tecnología",
      diagStatus: "Matriculado",
      activePath: ["Arquitectura e Integración de Sistemas en la Nube"],
      progress: 75,
      assignedBudget: 450,
      suggestedRouteCost: 1200,
      passport: {
        destinations: [{ university: "Universidad de los Andes", stampLogo: "UniAndes", enrollCount: 1 }],
        sellos: [{ courseId: "c-1", courseTitle: "Arquitectura e Integración de Sistemas en la Nube", university: "Universidad de los Andes", status: "Cursando" }],
        insignias: [{ skillName: "Cloud Systems", iconName: "Cloud", dateEarned: "2026-05-10" }],
        perfiles: [{ title: "SRE Consultant", enabledPercent: 60, laborDemand: "Alta", salaryMedian: "USD 4,200" }],
        logros: []
      }
    },
    {
      id: "emp-2",
      name: "Laura Restrepo",
      email: "laura.restrepo@vinkupass.com",
      role: "Frontend Developer",
      department: "Tecnología",
      diagStatus: "Matriculado",
      activePath: ["Desarrollo Fullstack Profesional con React y Node.js"],
      progress: 45,
      assignedBudget: 1000,
      suggestedRouteCost: 1200,
      passport: {
        destinations: [{ university: "Tec de Monterrey", stampLogo: "TecMTY", enrollCount: 1 }],
        sellos: [{ courseId: "c-3", courseTitle: "Desarrollo Fullstack Profesional con React y Node.js", university: "Tec de Monterrey", status: "Cursando" }],
        insignias: [{ skillName: "React Framework", iconName: "Layers", dateEarned: "2026-05-15" }],
        perfiles: [{ title: "Frontend Architect", enabledPercent: 45, laborDemand: "Crítica", salaryMedian: "USD 5,500" }],
        logros: []
      }
    },
    {
      id: "emp-3",
      name: "Gabriel Medina",
      email: "gabriel.medina@vinkupass.com",
      role: "Product Marketer",
      department: "Ventas",
      diagStatus: "Ruta Generada",
      activePath: ["Estrategias de Growth Marketing"],
      progress: 15,
      assignedBudget: 0,
      suggestedRouteCost: 890,
      passport: {
        destinations: [{ university: "IE Business School", stampLogo: "IEBS", enrollCount: 1 }],
        sellos: [],
        insignias: [],
        perfiles: [{ title: "Growth Specialist", enabledPercent: 10, laborDemand: "Media", salaryMedian: "USD 3,000" }],
        logros: []
      }
    },
    {
      id: "emp-4",
      name: "Sofía Martínez",
      email: "sofia.martinez@vinkupass.com",
      role: "Analista de Datos",
      department: "Operaciones",
      diagStatus: "Matriculado",
      activePath: ["Diplomado en Inteligencia Artificial y Machine Learning"],
      progress: 95,
      assignedBudget: 1100,
      suggestedRouteCost: 1100,
      passport: {
        destinations: [{ university: "Universidad de Buenos Aires", stampLogo: "UBA", enrollCount: 1 }],
        sellos: [{ courseId: "c-4", courseTitle: "Diplomado en Inteligencia Artificial y Machine Learning", university: "Universidad de Buenos Aires", status: "Cursando" }],
        insignias: [{ skillName: "AI Modeling", iconName: "Award", dateEarned: "2026-05-20" }],
        perfiles: [{ title: "Data Scientist", enabledPercent: 90, laborDemand: "Crítica", salaryMedian: "USD 6,000" }],
        logros: []
      }
    },
    {
      id: "emp-5",
      name: "Juan Sebastián Cardona",
      email: "sebastian.cardona@vinkupass.com",
      role: "Junior Associate",
      department: "Finanzas",
      diagStatus: "Pendiente",
      activePath: [],
      progress: 0,
      assignedBudget: 0,
      suggestedRouteCost: 1500,
      passport: {
        destinations: [],
        sellos: [],
        insignias: [],
        perfiles: [],
        logros: []
      }
    }
  ];

  // 4. Universities States and Certifications Control
  let universities: UniversityStats[] = [
    {
      id: "u-andes",
      name: "Universidad de los Andes",
      logo: "UniAndes",
      uploadedCoursesCount: 1,
      enrolledStudentsCount: 22,
      totalEarnings: 9900,
      certificationsPending: []
    },
    {
      id: "u-tec",
      name: "Tec de Monterrey",
      logo: "TecMTY",
      uploadedCoursesCount: 2,
      enrolledStudentsCount: 45,
      totalEarnings: 27900,
      certificationsPending: [
        { studentId: "s-101", studentName: "Diana Prince", courseId: "c-3", courseTitle: "Desarrollo Fullstack Profesional con React y Node.js" }
      ]
    },
    {
      id: "u-ie",
      name: "IE Business School",
      logo: "IEBS",
      uploadedCoursesCount: 1,
      enrolledStudentsCount: 14,
      totalEarnings: 12460,
      certificationsPending: []
    },
    {
      id: "u-puc",
      name: "Pontificia Universidad Católica",
      logo: "PUC",
      uploadedCoursesCount: 1,
      enrolledStudentsCount: 19,
      totalEarnings: 20900,
      certificationsPending: []
    },
    {
      id: "u-uba",
      name: "Universidad de Buenos Aires",
      logo: "UBA",
      uploadedCoursesCount: 1,
      enrolledStudentsCount: 31,
      totalEarnings: 11780,
      certificationsPending: []
    }
  ];

  // 5. Fellowship Sessions
  let fellowshipSessions: MentorSession[] = [
    { id: "f-1", mentorName: "Ing. Alejandro Cruz", topic: "Revisión de Arquitectura del MVP y Modelado de Base de Datos", dateTime: "Este Sábado, 10:00 AM (Col)", zoomLink: "https://zoom.us/j/vinkupass-fellowship" },
    { id: "f-2", mentorName: "Dra. Eliana Torres (IE BS)", topic: "Alineación de Metodología CRO en tu SaaS Emprendedor", dateTime: "Próximo Martes, 6:00 PM (Col)", zoomLink: "https://zoom.us/j/vinkupass-fellowship-2" }
  ];

  // 6. Security, Hashing & JWT Telemetry simulation logs
  let authTelemetryLogs: AuthLog[] = [
    { timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString(), type: "REGISTER", payload: "User: diana.prince@vinkupass.com, secure_pass encrypted." },
    { timestamp: new Date(Date.now() - 25 * 60000).toLocaleTimeString(), type: "LOGIN", payload: "Successful email login. Initiated BCrypt retrieval." },
    { timestamp: new Date(Date.now() - 20 * 60000).toLocaleTimeString(), type: "SOCIAL_JWT", payload: "Oauth Google connection matched for sub_id: '10928372671'. Token granted." }
  ];

  // 7. Prospects (B2B leads) for 'Prospectos_Empresas'
  let prospects: any[] = [
    { id: "p-1", companyName: "GlobalTech Corp", workEmail: "hr@globaltech.com", employeeCount: 150, dateSubmitted: "2026-06-03" }
  ];

  // === DYNAMIC EVENTS STREAM FOR DASHBOARDS ===
  let platformActivityEvents = [
    "Sistemas: Diana Prince completó el diagnóstico de upskilling de 5 preguntas.",
    "Billetera: Recarga exitosa de crédito digital para Corporativo por USD 2,500.",
    "Universidad: IE Business School actualizó el contenido de 'Estrategias de Growth Marketing'.",
    "Fellowship: Mentoría sincronizada agendada exitosamente con Lic. Juan Ortiz."
  ];

  // Add a random heartbeat event simulation
  setInterval(() => {
    const randomDecisions = [
      "Universidades: Pontificia Universidad Católica registró una inscripción en Diplomado en Inteligencia Artificial.",
      "Sistemas: JWT Session Token rotado automáticamente para usuario corporativo.",
      "Vinku Fellowship: Se abrió un nuevo slot síncrono para Liderazgo de Producto.",
      "Billetera: Empresa 'Talent Accelerator Inc.' adquirió 3 cupos a través de crédito digital.",
      "Sistemas: Diana Prince subió un nuevo producto al 'Portafolio de Logros e Hitos'."
    ];
    const picked = randomDecisions[Math.floor(Math.random() * randomDecisions.length)];
    platformActivityEvents.unshift(picked);
    if (platformActivityEvents.length > 30) {
      platformActivityEvents.pop();
    }
  }, 15000);


  // ==========================================
  //               API ENDPOINTS
  // ==========================================

  // Health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", vinkupass_engine: "API v1.0.0 Online", uptime: process.uptime() });
  });

  // Get total platform state for frontend
  app.get("/api/vinkupass/state", (req, res) => {
    res.json({
      courses,
      student: currentStudent,
      corporate: {
        budgetLeft: corporateBudgetLeft,
        employees: corporateEmployees,
        transactions: corporateTransactions
      },
      universities,
      fellowshipSessions,
      authLogs: authTelemetryLogs,
      recentActivity: platformActivityEvents.slice(0, 10),
      prospects: prospects
    });
  });

  // Post new B2B Contact Prospect (writes to 'Prospectos_Empresas' concept)
  app.post("/api/vinkupass/leads", (req, res) => {
    const { companyName, workEmail, employeeCount } = req.body;
    if (!companyName || !workEmail) {
      return res.status(400).json({ error: "El Nombre de la Empresa y el Correo Corporativo son requeridos." });
    }
    const newLead = {
      id: `p-${prospects.length + 1}`,
      companyName,
      workEmail,
      employeeCount: parseInt(employeeCount) || 10,
      dateSubmitted: new Date().toISOString().split("T")[0]
    };
    prospects.unshift(newLead);
    platformActivityEvents.unshift(`Sistema (B2B): Nuevo prospecto de empresa '${companyName}' registrado en la tabla Prospectos_Empresas.`);
    res.json({ success: true, lead: newLead, prospects });
  });

  // Route to reset state back to defaults
  app.post("/api/vinkupass/reset", (req, res) => {
    // Reset back to mock defaults
    currentStudent = {
      id: "s-101",
      name: "Diana Prince",
      email: "diana.prince@vinkupass.com",
      walletBalance: 1250,
      creditApproved: 1500,
      diagnosed: true,
      suggestedRoute: ["c-1", "c-3", "c-5"],
      passport: {
        destinations: [
          { university: "Universidad de los Andes", stampLogo: "UniAndes", enrollCount: 1 },
          { university: "Tec de Monterrey", stampLogo: "TecMTY", enrollCount: 1 }
        ],
        sellos: [
          { courseId: "c-1", courseTitle: "Arquitectura e Integración de Sistemas en la Nube", university: "Universidad de los Andes", dateApproved: "2026-04-12", status: "Certificado" },
          { courseId: "c-3", courseTitle: "Desarrollo Fullstack Profesional con React y Node.js", university: "Tec de Monterrey", dateApproved: undefined, status: "Cursando" }
        ],
        insignias: [
          { skillName: "Cloud Architecture", iconName: "Cloud", dateEarned: "2026-04-12" },
          { skillName: "API Design", iconName: "Layers", dateEarned: "2026-04-12" }
        ],
        perfiles: [
          { title: "SaaS Tech Lead", enabledPercent: 65, laborDemand: "Muy Alta", salaryMedian: "USD 5,200 / mes" },
          { title: "Fullstack Architect", enabledPercent: 40, laborDemand: "Crítica", salaryMedian: "USD 6,500 / mes" }
        ],
        logros: [
          { id: "l-1", goal: "Lanzar mi primer MVP funcional para una startup SaaS", associatedProducts: ["Repositorio backend en Node.js", "Arquitectura de base de datos Postgres"], status: "En Progreso" },
          { id: "l-2", goal: "Dominar integraciones seguras de APIs de terceros", associatedProducts: ["API Proxy en Express", "Esquema JWT de autenticación"], status: "Cumplido" }
        ]
      }
    };

    corporateBudgetLeft = 7500;
    corporateEmployees = [
      {
        id: "emp-1",
        name: "Esteban Córdoba",
        email: "esteban.cordoba@vinkupass.com",
        role: "SRE Junior",
        department: "Tecnología",
        diagStatus: "Matriculado",
        activePath: ["Arquitectura e Integración en la Nube"],
        progress: 75,
        assignedBudget: 450,
        suggestedRouteCost: 1200,
        passport: {
          destinations: [{ university: "Universidad de los Andes", stampLogo: "UniAndes", enrollCount: 1 }],
          sellos: [{ courseId: "c-1", courseTitle: "Arquitectura Cloud Avanzada", university: "Universidad de los Andes", status: "Cursando" }],
          insignias: [{ skillName: "Kubernetes Ops", iconName: "Cloud", dateEarned: "2026-05-15" }],
          perfiles: [],
          logros: []
        }
      },
      {
        id: "emp-2",
        name: "Laura Restrepo",
        email: "laura.restrepo@vinkupass.com",
        role: "Frontend Developer",
        department: "Tecnología",
        diagStatus: "Matriculado",
        activePath: ["Desarrollo Fullstack Profesional", "Liderazgo de Producto y UX"],
        progress: 45,
        assignedBudget: 1000,
        suggestedRouteCost: 1200,
        passport: {
          destinations: [{ university: "Tec de Monterrey", stampLogo: "TecMTY", enrollCount: 2 }],
          sellos: [
            { courseId: "c-3", courseTitle: "React Global Context", university: "Tec de Monterrey", status: "Certificado" },
            { courseId: "c-3", courseTitle: "Node.js Microservices", university: "Tec de Monterrey", status: "Cursando" }
          ],
          insignias: [{ skillName: "TypeScript Expert", iconName: "Code", dateEarned: "2026-06-01" }],
          perfiles: [],
          logros: []
        }
      },
      {
        id: "emp-3",
        name: "Gabriel Medina",
        email: "gabriel.medina@vinkupass.com",
        role: "Product Marketer",
        department: "Ventas",
        diagStatus: "Ruta Generada",
        activePath: ["Estrategias de Growth Marketing"],
        progress: 15,
        assignedBudget: 890,
        suggestedRouteCost: 1200,
        passport: {
          destinations: [{ university: "IE Business School", stampLogo: "IEBS", enrollCount: 1 }],
          sellos: [{ courseId: "c-2", courseTitle: "SaaS Performance Marketing", university: "IE Business School", status: "Cursando" }],
          insignias: [],
          perfiles: [],
          logros: []
        }
      },
      {
        id: "emp-4",
        name: "Sofía Martínez",
        email: "sofia.martinez@vinkupass.com",
        role: "Analista de Datos",
        department: "Finanzas",
        diagStatus: "Pendiente",
        activePath: ["Diplomado en Inteligencia Artificial"],
        progress: 95,
        assignedBudget: 1100,
        suggestedRouteCost: 1200,
        passport: {
          destinations: [],
          sellos: [],
          insignias: [],
          perfiles: [],
          logros: []
        }
      }
    ];

    universities = [
      { id: "u-andes", name: "Universidad de los Andes", logo: "UniAndes", uploadedCoursesCount: 1, enrolledStudentsCount: 22, totalEarnings: 9900, certificationsPending: [] },
      { id: "u-tec", name: "Tec de Monterrey", logo: "TecMTY", uploadedCoursesCount: 2, enrolledStudentsCount: 45, totalEarnings: 27900, certificationsPending: [{ studentId: "s-101", studentName: "Diana Prince", courseId: "c-3", courseTitle: "Desarrollo Fullstack Profesional con React y Node.js" }] },
      { id: "u-ie", name: "IE Business School", logo: "IEBS", uploadedCoursesCount: 1, enrolledStudentsCount: 14, totalEarnings: 12460, certificationsPending: [] },
      { id: "u-puc", name: "Pontificia Universidad Católica", logo: "PUC", uploadedCoursesCount: 1, enrolledStudentsCount: 19, totalEarnings: 20900, certificationsPending: [] },
      { id: "u-uba", name: "Universidad de Buenos Aires", logo: "UBA", uploadedCoursesCount: 1, enrolledStudentsCount: 31, totalEarnings: 11780, certificationsPending: [] }
    ];

    fellowshipSessions = [
      { id: "f-1", mentorName: "Ing. Alejandro Cruz", topic: "Revisión de Arquitectura del MVP y Modelado de Base de Datos", dateTime: "Este Sábado, 10:00 AM (Col)", zoomLink: "https://zoom.us/j/vinkupass-fellowship" },
      { id: "f-2", mentorName: "Dra. Eliana Torres (IE BS)", topic: "Alineación de Metodología CRO en tu SaaS Emprendedor", dateTime: "Próximo Martes, 6:00 PM (Col)", zoomLink: "https://zoom.us/j/vinkupass-fellowship-2" }
    ];

    platformActivityEvents = [
      "Sistemas: Plataforma restaurada al estado de simulación inicial.",
      "Sistemas: Diana Prince completó el diagnóstico de upskilling de 5 preguntas.",
      "Billetera: Recarga exitosa de crédito digital para Corporativo por USD 2,500.",
      "Universidad: IE Business School actualizó el contenido de 'Estrategias de Growth Marketing'."
    ];

    authTelemetryLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type: "JWT_VERIFY",
      payload: "Operator initiated master reset. Clear database collections."
    });

    res.json({ success: true, message: "State successfully clean reset to demo baseline." });
  });

  // Endpoints: Interactive questionnaire simulator (Diagnostics Up-skilling)
  // Recommends courses dynamically depending on answered areas and budget
  app.post("/api/vinkupass/diagnose", (req, res) => {
    const { primaryGoal, technicalExperience, budgetRange, lengthPreference } = req.body;
    
    // Evaluate choices and match with available course IDs
    // lengthPreference is 3, 5, or 7 courses
    const targetLength = parseInt(lengthPreference) || 3;
    
    // Sort courses scoring them against goal keywords
    let scoreList = courses.map(c => {
      let score = 0;
      if ((primaryGoal === "Engineering" || primaryGoal === "Software") && (c.category.includes("Ingeniería") || c.category.includes("Tech"))) score += 10;
      if ((primaryGoal === "Marketing") && (c.category.includes("Negocios") || c.category.includes("Marketing"))) score += 10;
      if ((primaryGoal === "AI" || primaryGoal === "Science") && (c.category.includes("AI") || c.category.includes("Science"))) score += 10;
      if ((primaryGoal === "Design" || primaryGoal === "Management") && (c.category.includes("Diseño") || c.category.includes("Negocios"))) score += 10;
      if ((primaryGoal === "Sustainability" || primaryGoal === "Sostenibilidad") && c.category.includes("Sostenibilidad")) score += 10;
      if ((primaryGoal === "Cybersecurity" || primaryGoal === "Sistemas") && (c.category.includes("Seguridad") || c.category.includes("Tech"))) score += 10;
      
      // Technical vs level adjustments
      if (technicalExperience === "beginner" && c.level === "Pregrado") score += 5;
      if (technicalExperience === "advanced" && c.level === "Posgrado") score += 5;
      
      return { id: c.id, score, title: c.title };
    });

    // Sort by score
    scoreList.sort((a, b) => b.score - a.score);
    
    // Fill route list with courses matching length (min 3, max 7)
    let selectedRoute: string[] = [];
    for (let i = 0; i < courses.length; i++) {
      if (selectedRoute.length < targetLength) {
        selectedRoute.push(scoreList[i]?.id || courses[i].id);
      }
    }

    currentStudent.suggestedRoute = selectedRoute;
    currentStudent.diagnosed = true;

    platformActivityEvents.unshift(`Sistemas: Diana Prince completó su autodiagnóstico de ${targetLength} cursos (${primaryGoal}).`);
    
    res.json({
      success: true,
      suggestedRoute: selectedRoute,
      coursesSelectedDetail: courses.filter(c => selectedRoute.includes(c.id))
    });
  });

  // Recharge student digital wallet
  app.post("/api/vinkupass/student/wallet-recharge", (req, res) => {
    const { amount, source } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Monto de recarga inválido" });
    }

    currentStudent.walletBalance += parseFloat(amount);
    platformActivityEvents.unshift(`Billetera: Diana Prince recargó $${amount} a través de ${source || "crédito digital fácil"}.`);

    authTelemetryLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type: "JWT_VERIFY",
      payload: `JWT parsed. Session active. Wallet top-up transaction completed for +$${amount}.`
    });

    res.json({ success: true, balance: currentStudent.walletBalance });
  });

  // Enterprise / Corporate Registration
  app.post("/api/vinkupass/corporate/register", (req, res) => {
    const { companyName, nit, email, size, password } = req.body;
    if (!companyName || !nit || !email || !password) {
      return res.status(400).json({ error: "Todos los campos de registro son obligatorios." });
    }
    
    authTelemetryLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type: "REGISTER",
      payload: `Organización registrada: ${companyName} (NIT: ${nit}), Admin: ${email}, Tamaño: ${size} empleados.`
    });
    
    platformActivityEvents.unshift(`Corporativo: Organización '${companyName}' se ha registrado exitosamente en la plataforma.`);
    
    res.json({ success: true, companyName, nit, email, size });
  });

  // Enterprise / Corporate Recharge
  app.post("/api/vinkupass/corporate/recharge", (req, res) => {
    const { amount } = req.body;
    const numericAmount = parseFloat(amount || "0");
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "El monto a recargar debe ser un número válido mayor a 0." });
    }
    
    corporateBudgetLeft += numericAmount;
    
    corporateTransactions.unshift({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Carga de fondos",
      amount: numericAmount,
      detail: "Recarga por Pasarela de Pagos (Stitch Pay)",
      status: "Completado"
    });
    
    platformActivityEvents.unshift(`Billetera Corp: Recarga acreditada de ${numericAmount} Créditos Vinku.`);
    
    authTelemetryLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type: "JWT_VERIFY",
      payload: `JWT parsed. Corporate budget updated. Added +${numericAmount} Vinku Credits.`
    });
    
    res.json({ success: true, budgetLeft: corporateBudgetLeft, transactions: corporateTransactions });
  });

  // Enterprise / Corporate Bulk Diagnostic invites
  app.post("/api/vinkupass/corporate/diagnose-bulk", (req, res) => {
    const { emails, department } = req.body;
    if (!emails || !department) {
      return res.status(400).json({ error: "Se requieren los correos y el departamento de asignación." });
    }
    
    const emailList = emails
      .split(/[\s,;\n]+/)
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0 && e.includes("@"));
      
    if (emailList.length === 0) {
      return res.status(400).json({ error: "Suministre al menos una dirección de correo electrónico válida." });
    }
    
    emailList.forEach((email: string) => {
      const name = email.split("@")[0].split(".")[0];
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      
      const newEmp: Employee = {
        id: `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: `${capitalizedName} (Invitado)`,
        email: email,
        role: "Colaborador " + department,
        department: department,
        diagStatus: "Ruta Generada",
        activePath: ["Ruta Automatizada: " + department],
        progress: 0,
        assignedBudget: 0,
        suggestedRouteCost: 1200,
        passport: {
          destinations: [],
          sellos: [],
          insignias: [],
          perfiles: [],
          logros: []
        }
      };
      
      corporateEmployees.unshift(newEmp);
    });
    
    platformActivityEvents.unshift(`Diagnóstico: Se han programado invitaciones y rutas automatizadas para ${emailList.length} colaboradores de ${department}.`);
    
    res.json({ success: true, count: emailList.length, employees: corporateEmployees });
  });

  // Enterprise / Corporate Assign Credits to employee
  app.post("/api/vinkupass/corporate/assign-credits", (req, res) => {
    const { employeeId, amount } = req.body;
    const numericAmount = parseFloat(amount || "0");
    if (!employeeId || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "ID de colaborador y monto a transferir válidos son necesarios." });
    }
    
    const emp = corporateEmployees.find(e => e.id === employeeId);
    if (!emp) {
      return res.status(404).json({ error: "Colaborador no encontrado." });
    }
    
    if (corporateBudgetLeft < numericAmount) {
      return res.status(400).json({ error: "La Billetera Corporativa no posee suficientes Créditos Vinku." });
    }
    
    corporateBudgetLeft -= numericAmount;
    
    emp.assignedBudget += numericAmount;
    emp.diagStatus = "Matriculado";
    emp.progress = 10;
    
    if (!emp.activePath || emp.activePath.length === 0) {
      emp.activePath = ["Ruta Personalizada Financiada"];
    }
    
    if (emp.passport) {
      emp.passport.destinations = [{ university: "Universidad de los Andes", stampLogo: "UniAndes", enrollCount: 1 }];
      emp.passport.sellos = [{ courseId: "c-1", courseTitle: emp.activePath[0], university: "Universidad de los Andes", status: "Cursando" }];
      emp.passport.insignias = [{ skillName: "Introducción a " + emp.department, iconName: "BookOpen", dateEarned: new Date().toISOString().split("T")[0] }];
    }
    
    corporateTransactions.unshift({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Dispersión a colaborador",
      amount: numericAmount,
      detail: `${emp.name} (${emp.role})`,
      status: "Completado"
    });
    
    platformActivityEvents.unshift(`Billetera Corp: Transferencia de ${numericAmount} Créditos Vinku a ${emp.name}.`);
    
    res.json({
      success: true,
      employee: emp,
      budgetLeft: corporateBudgetLeft,
      transactions: corporateTransactions,
      employees: corporateEmployees
    });
  });

  // Register / Enroll Course (Purchase)
  // Handles Wallet depletion, Passport Destinations stamps, Los Sellos addition.
  app.post("/api/vinkupass/course/enroll", (req, res) => {
    const { courseId, actor } = req.body; // actor: "student" or "corporate"
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    // Double registration check in student passport
    const alreadyEnrolled = currentStudent.passport.sellos.some(s => s.courseId === courseId);
    if (alreadyEnrolled) {
      return res.status(400).json({ error: "Ya estás cursando o aprobaste este curso" });
    }

    if (actor === "corporate") {
      if (corporateBudgetLeft < course.cost) {
        return res.status(400).json({ error: "Presupuesto corporativo insuficiente. Solicite recarga de crédito." });
      }
      corporateBudgetLeft -= course.cost;
      
      // Add a randomized employee enrollment representation
      const randomNames = ["Carlos Gómez", "Patricia Torres", "Aline Ruiz"];
      const rName = randomNames[Math.floor(Math.random() * randomNames.length)];
      corporateEmployees.unshift({
        id: `emp-${Date.now()}`,
        name: rName,
        email: `${rName.toLowerCase().replace(" ", ".")}@vinkupass.com`,
        role: "Team Colaborador",
        department: "Tecnología",
        diagStatus: "Matriculado",
        activePath: [course.title],
        progress: 0,
        assignedBudget: course.cost,
        suggestedRouteCost: course.cost,
        passport: {
          destinations: [{ university: course.university, stampLogo: "STMP", enrollCount: 1 }],
          sellos: [{ courseId: course.id, courseTitle: course.title, university: course.university, status: "Cursando" }],
          insignias: [],
          perfiles: [],
          logros: []
        }
      });

      platformActivityEvents.unshift(`Corporativo: Empresa matriculó a ${rName} en '${course.title}' ($${course.cost}).`);
    } else {
      // Individual context
      if (currentStudent.walletBalance < course.cost) {
        return res.status(400).json({ error: "Saldo de billetera Vinkupass insuficiente. Solicita un crédito digital o recarga." });
      }
      currentStudent.walletBalance -= course.cost;

      // Add Course to passport sellos
      currentStudent.passport.sellos.unshift({
        courseId: course.id,
        courseTitle: course.title,
        university: course.university,
        status: "Cursando"
      });

      // Update or add stamp to destinations
      const destIndex = currentStudent.passport.destinations.findIndex(d => d.university === course.university);
      if (destIndex >= 0) {
        currentStudent.passport.destinations[destIndex].enrollCount += 1;
      } else {
        const logoMap: { [key: string]: string } = {
          "Universidad de los Andes": "UniAndes",
          "Tec de Monterrey": "TecMTY",
          "IE Business School": "IEBS",
          "Pontificia Universidad Católica": "PUC",
          "Universidad de Buenos Aires": "UBA"
        };
        currentStudent.passport.destinations.push({
          university: course.university,
          stampLogo: logoMap[course.university] || "UnivLogo",
          enrollCount: 1
        });
      }

      // Add Pending Certificate entry to University
      const uni = universities.find(u => u.name === course.university);
      if (uni) {
        uni.certificationsPending.push({
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          courseId: course.id,
          courseTitle: course.title
        });
        uni.enrolledStudentsCount += 1;
        uni.totalEarnings += course.cost;
      }

      platformActivityEvents.unshift(`Billetera: Diana Prince compró el curso '${course.title}' usando su pasaporte.`);
    }

    res.json({
      success: true,
      studentWallet: currentStudent.walletBalance,
      corporateBudget: corporateBudgetLeft
    });
  });

  // Action: Add new course (University Profile)
  app.post("/api/vinkupass/course/add", (req, res) => {
    const { title, university, level, duration, cost, skills, description, category } = req.body;
    if (!title || !university || !cost) {
      return res.status(400).json({ error: "Título, Universidad y costo total son requeridos" });
    }

    const newCourse: Course = {
      id: `c-${courses.length + 1}`,
      title,
      university,
      level: level || "Educación Continua",
      duration: duration || "8 Semanas",
      cost: parseFloat(cost),
      skills: Array.isArray(skills) ? skills : [skills],
      description: description || "Sin descripción provista.",
      category: category || "Ingeniería & Tech"
    };

    courses.push(newCourse);

    // Update university catalog stats
    const uni = universities.find(u => u.name === university);
    if (uni) {
      uni.uploadedCoursesCount += 1;
    }

    platformActivityEvents.unshift(`Universidad: ${university} publicó un nuevo curso: '${title}'.`);
    
    res.json({ success: true, course: newCourse });
  });

  // Action: Validate & Upload Certification (University Profile)
  // Approves/Certifies a course, awarding the respective Insignias & Skills
  app.post("/api/vinkupass/university/certify", (req, res) => {
    const { studentId, courseId, universityId } = req.body;
    
    const uni = universities.find(u => u.id === universityId);
    if (!uni) {
      return res.status(404).json({ error: "Universidad no registrada" });
    }

    // Filter pending list
    const foundIdx = uni.certificationsPending.findIndex(p => p.studentId === studentId && p.courseId === courseId);
    if (foundIdx === -1) {
      return res.status(404).json({ error: "La solicitud de certificación no existe o ya fue aprobada" });
    }

    // Remove from pending
    const [certifiedItem] = uni.certificationsPending.splice(foundIdx, 1);

    // Find course skills to award to the student
    const course = courses.find(c => c.id === courseId);
    const awardedSkill = course?.skills[0] || "Advanced Upskilling";

    // Update student's passport course status from "Cursando" to "Certificado"
    if (currentStudent.id === studentId) {
      const sello = currentStudent.passport.sellos.find(s => s.courseId === courseId);
      if (sello) {
        sello.status = "Certificado";
        sello.dateApproved = new Date().toISOString().split("T")[0];
      }

      // Add Insignia
      currentStudent.passport.insignias.push({
        skillName: awardedSkill,
        iconName: "Award",
        dateEarned: new Date().toISOString().split("T")[0]
      });

      // Elevate suggested role metrics percentages
      currentStudent.passport.perfiles = currentStudent.passport.perfiles.map(p => ({
        ...p,
        enabledPercent: Math.min(100, p.enabledPercent + 15)
      }));
    }

    platformActivityEvents.unshift(`Certificación: ${uni.name} aprobó sellos de habilidades para '${certifiedItem.courseTitle}'.`);

    res.json({ success: true, pendingLeft: uni.certificationsPending });
  });

  // Post: Add student personalized achievement goals
  app.post("/api/vinkupass/student/achievement", (req, res) => {
    const { goal, associatedProducts } = req.body;
    if (!goal) {
      return res.status(400).json({ error: "La meta profesional es requerida" });
    }

    const newAchievement: Achievement = {
      id: `l-${Date.now()}`,
      goal,
      associatedProducts: Array.isArray(associatedProducts) ? associatedProducts : [associatedProducts],
      status: "Definido"
    };

    currentStudent.passport.logros.push(newAchievement);
    platformActivityEvents.unshift(`Logros: Diana Prince agregó un hito profesional: '${goal}'.`);

    res.json({ success: true, logros: currentStudent.passport.logros });
  });

  // Post: Schedule Fellowship Mentorship
  app.post("/api/vinkupass/fellowship/book", (req, res) => {
    const { mentorName, topic, dateTime } = req.body;
    if (!mentorName || !topic || !dateTime) {
      return res.status(400).json({ error: "Todos los campos para mentoring son requeridos." });
    }

    const newSession: MentorSession = {
      id: `f-${fellowshipSessions.length + 1}`,
      mentorName,
      topic,
      dateTime,
      zoomLink: "https://zoom.us/j/vinkupass-fellowship-custom"
    };

    fellowshipSessions.push(newSession);
    platformActivityEvents.unshift(`Fellowship: Mentoría síncrona reservada con ${mentorName} para revisar '${topic}'.`);

    res.json({ success: true, sessions: fellowshipSessions });
  });

  // Action: Simulate Complete cryptographic authentication telemetry panel
  // Simulates registration or login with email/password vs OAuth
  app.post("/api/vinkupass/auth/simulate", (req, res) => {
    const { mode, email, password, provider } = req.body;

    if (mode === "oauth") {
      // Social login simulation
      const payloadObj = {
        sub: `oauth|${provider}|${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        name: email || "Usuario Social",
        email: email || "oauth-user@gmail.com",
        provider: provider,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      const jwtToken = simulateJwtSign(payloadObj);
      const logMsg: AuthLog = {
        timestamp: new Date().toLocaleTimeString(),
        type: "SOCIAL_JWT",
        payload: `OAuth flow complete. Provider: ${provider.toUpperCase()}. Sub-Id match. Generated JWT Token: ${jwtToken.slice(0, 40)}...`
      };
      authTelemetryLogs.unshift(logMsg);

      return res.json({
        success: true,
        type: "OAuth Integration",
        jwt: jwtToken,
        payloadDecoded: payloadObj,
        explanation: `Social login complete. OAuth ID token signatures validated. Verified cryptographic sub ID. Issued JWT session token containing claims.`
      });
    } else {
      // Standard email/password
      const { salt, hash } = simulateBcryptHash(password || "VinkuSecured123");
      const payloadObj = {
        sub: "user-id-s-101",
        email: email || "diana.prince@vinkupass.com",
        role: "Student",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      const jwtToken = simulateJwtSign(payloadObj);
      const logMsg: AuthLog = {
        timestamp: new Date().toLocaleTimeString(),
        type: mode === "register" ? "REGISTER" : "LOGIN",
        payload: `Local Authentication. Email: ${email}. Calculated dynamic BCrypt Salt (${salt.slice(0, 15)}...) and generated Hash (${hash.slice(20, 35)}...). Issued session JWT.`
      };
      authTelemetryLogs.unshift(logMsg);

      return res.json({
        success: true,
        email,
        bcryptAlgorithm: "Blowfish-based crypt (BCrypt - Rounds: 12)",
        generatedSalt: salt,
        resultingHash: hash,
        jwt: jwtToken,
        payloadDecoded: payloadObj,
        explanation: `Password processed with the blowfish adaptive hash algorithm (bcrypt) parameterized with work factor 12. Generates a cryptographically strong 128-bit salt before hashing.`
      });
    }
  });


  // === VITE & PRODUCTION STATIC SERVING ===
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
