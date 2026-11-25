/** Situações de partida e blocos de conhecimento da calculadora de trilha. */
export type Situacao = 'estudante' | 'dev' | 'dados' | 'fora';

export const SITUACOES: { id: Situacao; rotulo: string }[] = [
  { id: 'estudante', rotulo: 'Estudante' },
  { id: 'dev', rotulo: 'Dev de outra área' },
  { id: 'dados', rotulo: 'Dados/ML' },
  { id: 'fora', rotulo: 'Fora da TI' },
];

/** Um bloco marcado como dominado pula ou manda revisar os tópicos listados. */
export type Bloco = { id: string; rotulo: string; pular: string[]; revisar: string[] };

export const BLOCOS: Bloco[] = [
  { id: 'python-basico', rotulo: 'Python básico', pular: ['python-fundamentos'], revisar: [] },
  { id: 'python-intermediario', rotulo: 'Python intermediário (POO, tipos)', pular: ['python-poo-e-tipos'], revisar: [] },
  { id: 'terminal', rotulo: 'Terminal e ambientes', pular: ['terminal-e-ambientes'], revisar: [] },
  { id: 'git', rotulo: 'Git e GitHub', pular: ['git-e-github'], revisar: [] },
  { id: 'sql', rotulo: 'SQL', pular: ['sql-essencial'], revisar: [] },
  { id: 'apis-web', rotulo: 'APIs web (FastAPI ou similar)', pular: ['fastapi'], revisar: [] },
  { id: 'docker', rotulo: 'Docker', pular: ['docker-local'], revisar: [] },
  { id: 'testes', rotulo: 'Testes automatizados', pular: [], revisar: ['testes-e-evals-no-projeto'] },
  { id: 'ci-cd', rotulo: 'CI/CD', pular: ['ci-cd'], revisar: [] },
  { id: 'nuvem', rotulo: 'Nuvem (AWS ou outra)', pular: ['aws-fundamentos', 'seguranca-e-custo-na-nuvem'], revisar: [] },
  { id: 'postgres', rotulo: 'Postgres', pular: [], revisar: ['postgres-e-pgvector'] },
  {
    id: 'apis-llm',
    rotulo: 'Já usei APIs de LLM',
    pular: [],
    revisar: ['api-e-parametros', 'prompt-engineering', 'saida-estruturada', 'tokens-e-janela-de-contexto'],
  },
  { id: 'dados-ml', rotulo: 'Dados e machine learning', pular: [], revisar: ['embeddings', 'fine-tuning', 'evolucao-dos-modelos'] },
];

/** Blocos marcados ao escolher a situação; a pessoa ajusta depois. */
export const PRESETS: Record<Situacao, string[]> = {
  estudante: [],
  dev: ['python-basico', 'terminal', 'git', 'sql', 'apis-web', 'testes'],
  dados: ['python-basico', 'python-intermediario', 'terminal', 'git', 'sql', 'dados-ml'],
  fora: [],
};
