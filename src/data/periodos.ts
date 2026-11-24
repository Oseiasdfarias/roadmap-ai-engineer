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
  /** Fase para a qual a nota de carreira aponta. */
  faseLink?: number;
};

/** Seis períodos do mapa (seção 7 do design). Indicativos: 10 a 15 horas de estudo por semana. */
export const PERIODOS: Periodo[] = [
  { nome: 'Começo', nivel: 1, fase: 1 },
  { nome: '1º ano', nivel: 2, fase: 2 },
  {
    nome: '1º e 2º ano',
    nivel: 3,
    notaCarreira: 'Fase 2 continua: estágio. Use os projetos deste nível no currículo e nas entrevistas.',
    faseLink: 2,
  },
  { nome: '2º ano', nivel: 4, fase: 3 },
  {
    nome: 'Com experiência',
    notaEstudo: 'Aprofundar no trabalho: as features de IA da empresa viram o seu laboratório.',
    fase: 4,
  },
  {
    nome: 'Maturidade',
    notaEstudo: 'Especializar: design de sistemas com LLM, custo e segurança em escala.',
    fase: 5,
  },
];
