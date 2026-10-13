export interface BnccSkill {
  code: string;
  title: string;
  description: string;
}

export interface PlanStep {
  title: string;
  time: string;
  text: string;
}

export interface LessonPlan {
  status: "RASCUNHO" | "PENDENTE_MODERACAO" | "PUBLICADO" | "ARQUIVADO";
  title: string;
  summary: string;
  grade: string;
  teachingStage: string;
  duration: string;
  activityType: string;
  curricularComponents: string[];
  skillCodes: string[];
  reason: string;
  objective: string;
  materials: string[];
  availableMaterials: string[];
  classProfile: string;
  teacherInstructions: string;
  steps: PlanStep[];
  assessment: string;
  generatedByAI: boolean;
  isDerived: boolean;
  origin: {
    id: number | null;
    title: string;
    author: string;
  };
}

export function createDefaultLessonPlan(): LessonPlan {
  return {
    status: "RASCUNHO",
    title: "Missão Algoritmo: caminhos e comandos sem telas",
    summary:
      "Atividade desplugada criada com base no contexto da turma e nos materiais disponíveis.",
    grade: "6º ano",
    teachingStage: "Ensino Fundamental — Anos Finais",
    duration: "45 minutos",
    activityType: "Atividade colaborativa",
    curricularComponents: ["Computação"],
    skillCodes: ["EF06CO01"],
    reason:
      "A adaptação transforma conceitos de algoritmos e depuração em uma experiência concreta, colaborativa e adequada à turma. Os materiais acessíveis substituem recursos digitais sem alterar o objetivo pedagógico do plano-base.",
    objective:
      "Elaborar, executar e revisar uma sequência lógica de instruções para resolver um desafio, identificando a importância da clareza e da depuração.",
    materials: [
      "Papelão",
      "Tampinhas",
      "Barbante",
      "Cartões de papel",
      "Canetas coloridas",
      "Fita adesiva",
    ],
    availableMaterials: [
      "Papelão",
      "Tampinhas",
      "Barbante",
      "Cartões de papel",
      "Canetas coloridas",
      "Fita adesiva",
    ],
    classProfile:
      "Turma do 6º ano organizada em grupos de quatro estudantes, com interesse por desafios e jogos de percurso.",
    teacherInstructions:
      "Priorizar a colaboração, o teste entre grupos e a revisão das instruções.",
    steps: [
      {
        title: "Apresentação do desafio",
        time: "5 min",
        text: "Organize a turma em grupos de quatro e apresente a missão: criar uma sequência de instruções capaz de conduzir um colega por um percurso.",
      },
      {
        title: "Construção do percurso",
        time: "10 min",
        text: "Use papelão como base e tampinhas para marcar ponto de partida, obstáculos e destino.",
      },
      {
        title: "Criação do algoritmo",
        time: "15 min",
        text: "Cada grupo registra comandos simples em cartões e ordena as ações necessárias para concluir o percurso.",
      },
      {
        title: "Teste e depuração",
        time: "10 min",
        text: "Um grupo executa o algoritmo de outro exatamente como foi escrito, identifica instruções ambíguas ou falhas e propõe correções.",
      },
      {
        title: "Síntese coletiva",
        time: "5 min",
        text: "Compare as estratégias e convide os grupos a explicar como revisaram suas sequências.",
      },
    ],
    assessment:
      "Rubrica formativa: sequência lógica (constrói instruções em ordem e chega ao destino); depuração (identifica e corrige falhas); colaboração (participa e considera as contribuições do grupo). Registre evidências durante os testes e a síntese.",
    generatedByAI: true,
    isDerived: true,
    origin: {
      id: null,
      title: "Introdução ao Pensamento Computacional",
      author: "Prof. Carlos Henrique",
    },
  };
}

export function normalizeLessonPlan(value: unknown): LessonPlan {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("O plano salvo não possui um formato válido.");
  }

  const stored = value as Partial<LessonPlan> & { skillCode?: string };
  const defaults = createDefaultLessonPlan();
  const skillCodes =
    Array.isArray(stored.skillCodes) && stored.skillCodes.length > 0
      ? stored.skillCodes.filter(
          (code): code is string => typeof code === "string",
        )
      : typeof stored.skillCode === "string"
        ? [stored.skillCode]
        : defaults.skillCodes;
  const validSkillCodes =
    skillCodes.length > 0 ? skillCodes : defaults.skillCodes;
  const activityType =
    typeof stored.activityType === "string"
      ? stored.activityType
      : defaults.activityType;
  const allowedStatuses = [
    "RASCUNHO",
    "PENDENTE_MODERACAO",
    "PUBLICADO",
    "ARQUIVADO",
  ] as const;
  const status =
    stored.status && allowedStatuses.includes(stored.status)
      ? stored.status
      : defaults.status;

  return {
    ...defaults,
    ...stored,
    status,
    teachingStage:
      typeof stored.teachingStage === "string"
        ? stored.teachingStage
        : teachingStageForGrade(
            typeof stored.grade === "string" ? stored.grade : defaults.grade,
          ),
    skillCodes: validSkillCodes,
    activityType,
    curricularComponents: Array.isArray(stored.curricularComponents)
      ? stored.curricularComponents
      : defaults.curricularComponents,
    materials: Array.isArray(stored.materials)
      ? stored.materials
      : defaults.materials,
    availableMaterials: Array.isArray(stored.availableMaterials)
      ? stored.availableMaterials
      : defaults.availableMaterials,
    steps: Array.isArray(stored.steps) ? stored.steps : defaults.steps,
    origin: { ...defaults.origin, ...stored.origin },
  };
}

export function teachingStageForGrade(grade: string): string {
  if (grade === "Ensino médio") return "Ensino Médio";
  const year = Number.parseInt(grade, 10);
  if (year >= 1 && year <= 5) return "Ensino Fundamental — Anos Iniciais";
  if (year >= 6 && year <= 9) return "Ensino Fundamental — Anos Finais";
  return "Educação Infantil";
}
