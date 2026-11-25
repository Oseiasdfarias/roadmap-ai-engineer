export type Periodo = {
  nome: string;
  /** Nível de estudo do período. */
  nivel?: number;
  /** Fase de carreira do período. */
  fase?: number;
  /** Nota exibida na pista de estudo quando não há nível. */
  notaEstudo?: string;
  /** Nota exibida na pista de carreira quando não há fase nova. */
  notaCarreira?: string;
  /** Subtítulo da estação na página inicial. */
  sub?: string;
  /** Fase para a qual a nota de carreira aponta. */
  faseLink?: number;
  /** Textos em inglês. */
  en: { nome: string; sub?: string; notaEstudo?: string; notaCarreira?: string };
};

/** Seis períodos do mapa (seção 7 do design). Indicativos: 10 a 15 horas de estudo por semana. */
export const PERIODOS: Periodo[] = [
  { nome: 'Começo',
    sub: 'Base · Fundamentos', nivel: 1, fase: 1, en: { nome: 'Start', sub: 'Base · Fundamentals' } },
  { nome: '1º ano',
    sub: 'Conceitos · Estágio', nivel: 2, fase: 2, en: { nome: 'Year 1', sub: 'Concepts · Internship' } },
  {
    nome: '1º e 2º ano',
    sub: 'Construção',
    nivel: 3,
    notaCarreira: 'Fase 2 continua: estágio. Use os projetos deste nível no currículo e nas entrevistas.',
    faseLink: 2,
    en: { nome: 'Years 1 and 2', sub: 'Building', notaCarreira: 'Phase 2 continues: internship. Use the projects from this level in your résumé and interviews.' },
  },
  { nome: '2º ano',
    sub: 'Produção · Júnior', nivel: 4, fase: 3, en: { nome: 'Year 2', sub: 'Production · Junior' } },
  {
    nome: 'Com experiência',
    sub: 'Fronteira · Transição para IA',
    nivel: 5,
    fase: 4,
    en: { nome: 'With experience', sub: 'Frontier · Transition to AI' },
  },
  {
    nome: 'Maturidade',
    sub: 'Empresas consolidadas',
    notaEstudo: 'Especializar: design de sistemas com LLM, custo e segurança em escala.',
    fase: 5,
    en: { nome: 'Maturity', sub: 'Established companies', notaEstudo: 'Specialize: LLM system design, cost and security at scale.' },
  },
];
