import type { Situacao } from './blocos';

/**
 * Trilha de carreira por situação de partida. Rascunho: o autor revisa os textos.
 * `fase`: fase de carreira em que a pessoa já está; null = a fase do nível de partida.
 */
export const CARREIRA: Record<Situacao, { titulo: string; curto: string; fase: number | null; texto: string; dicas: string[] }> = {
  estudante: {
    titulo: 'Estágio desde cedo, depois júnior',
    curto: 'Estágio, depois júnior',
    fase: null,
    texto:
      'Vaga de AI Engineer júnior é rara. O caminho mais comum passa por estágio em desenvolvimento ou dados, já no começo da graduação. Use o estágio para ganhar prática de time e puxar tarefas de IA, e mantenha o portfólio crescendo em paralelo.',
    dicas: ['estagio-como-investimento', 'github-como-vitrine', 'linkedin-desde-ja', 'onde-buscar-vagas'],
  },
  dev: {
    titulo: 'Transição dentro do time ou vaga direta',
    curto: 'Transição ou vaga direta',
    fase: 4,
    texto:
      'Você já tem a parte mais difícil de provar: entrega software em produção. O caminho mais curto costuma ser levar IA para o time atual, assumindo tarefas com LLM, e contar essa história no currículo. Em paralelo, candidate-se a vagas de backend com IA ou de AI Engineer pleno, sem passar por estágio.',
    dicas: ['puxar-tarefas-de-ia', 'projeto-em-producao', 'contar-a-historia', 'design-de-sistemas-com-llm'],
  },
  dados: {
    titulo: 'Reposicionamento a partir do cargo atual',
    curto: 'Reposicionamento para IA',
    fase: 4,
    texto:
      'Você já conhece modelos, métricas e dados. O que falta para AI Engineer costuma ser engenharia de software: APIs, testes, deploy e operação. Priorize os níveis 3 e 4, mostre um sistema completo em produção e proponha projetos com LLM onde você trabalha.',
    dicas: ['puxar-tarefas-de-ia', 'projeto-em-producao', 'contar-a-historia', 'design-de-sistemas-com-llm'],
  },
  fora: {
    titulo: 'Primeiro emprego em tecnologia',
    curto: 'Primeiro emprego em tecnologia',
    fase: null,
    texto:
      'Siga a trilha completa, começando pela base. Se você não estuda numa graduação, o estágio pode não estar ao seu alcance: procure programas de trainee, vagas de primeiro emprego em desenvolvimento e cursos com apoio à empregabilidade. Sua área de origem conta a favor quando você constrói projetos de IA para ela.',
    dicas: ['base-larga-foco-em-um', 'github-como-vitrine', 'contar-a-historia', 'onde-buscar-vagas'],
  },
};
