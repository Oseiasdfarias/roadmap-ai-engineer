export const SITE = {
  titulo: 'Roadmap AI Engineer',
  descricao:
    'Um roadmap em português para virar AI Engineer: estudo e carreira, lado a lado, em cinco níveis.',
  url: 'https://oseiasdfarias.github.io',
  base: '/roadmap-ai-engineer',
};

export type Canal = {
  nome: 'Portfólio' | 'LinkedIn' | 'GitHub' | 'Medium' | 'YouTube';
  url: string;
  icone: string;
};

export const AUTOR: { nome: string; cargo: string; canais: Canal[] } = {
  nome: 'Oséias Farias',
  cargo: 'Machine Learning & AI Engineer · MLOps',
  canais: [
    { nome: 'Portfólio', url: 'https://oseiasdfarias.github.io/', icone: 'Globe' },
    { nome: 'LinkedIn', url: 'https://www.linkedin.com/in/oseiasfarias/', icone: 'Linkedin' },
    { nome: 'GitHub', url: 'https://github.com/Oseiasdfarias', icone: 'Github' },
    { nome: 'Medium', url: 'https://medium.com/@oseiasfarias', icone: 'BookOpen' },
    { nome: 'YouTube', url: 'https://www.youtube.com/@otensor', icone: 'Youtube' },
  ],
};

export const REPO_URL = 'https://github.com/Oseiasdfarias/roadmap-ai-engineer';
export const ISSUES_URL = `${REPO_URL}/issues/new/choose`;
export const PDF_URL = `${SITE.base}/pdf/roadmap-ai-engineer.pdf`;
