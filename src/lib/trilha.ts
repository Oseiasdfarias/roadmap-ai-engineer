import { BLOCOS, PRESETS, SITUACOES, type Bloco, type Situacao } from '../data/blocos';

export type Marca = 'pular' | 'revisar' | 'estudar';
export type TopicoEntrada = { id: string; nivel: number; tempo: string; prerequisitos: string[] };
export type NivelEntrada = { nivel: number; duracao: string };
/** `nivel`: nível em que a pessoa está (1 a 4); os anteriores contam como dominados. */
export type Perfil = { situacao: Situacao; horas: number; blocos: string[]; nivel: number };
export type Estimativa = { nivel: number; meses: number; min: number; max: number };

/** Horas por semana da referência do roteiro (10 a 15 h). */
export const HORAS_REFERENCIA = 12.5;
export const HORAS_PADRAO = 12;
/** Parcela de cada nível que são projetos e não se pula. */
const PARCELA_PROJETOS = 0.3;
const PESO: Record<Marca, number> = { estudar: 1, revisar: 0.25, pular: 0 };

function pontoMedio(texto: string): number {
  const nums = (texto.match(/\d+(?:[.,]\d+)?/g) ?? []).slice(0, 2).map((n) => Number(n.replace(',', '.')));
  if (!nums.length) return 0;
  return nums.length === 1 ? nums[0] : (nums[0] + nums[1]) / 2;
}

/** "1 a 2 semanas" → 1,5; "3 a 5 dias" → 4/7. Só a primeira parte, antes de vírgula. */
export function parseSemanas(tempo: string): number {
  const parte = tempo.split(',')[0];
  const m = pontoMedio(parte);
  return /dia/i.test(parte) ? m / 7 : m;
}

/** "4 a 6 meses" → 5. */
export function parseMeses(duracao: string): number {
  return pontoMedio(duracao);
}

/** Inteiro entre 3 e 40; qualquer valor inválido vira o padrão de 12. */
export function limitarHoras(h: unknown): number {
  if (h === null || h === undefined || (typeof h === 'string' && h.trim() === '')) return HORAS_PADRAO;
  const n = Number(h);
  if (!Number.isFinite(n)) return HORAS_PADRAO;
  return Math.min(40, Math.max(3, Math.round(n)));
}

export function classificar(
  topicos: TopicoEntrada[],
  blocos: string[],
  blocosDef: Bloco[] = BLOCOS,
  nivelInicial = 1,
): Record<string, Marca> {
  const marcas: Record<string, Marca> = {};
  for (const t of topicos) marcas[t.id] = t.nivel > 0 && t.nivel < nivelInicial ? 'pular' : 'estudar';
  const ativos = blocosDef.filter((b) => blocos.includes(b.id));
  for (const b of ativos) for (const id of b.revisar) if (id in marcas && marcas[id] !== 'pular') marcas[id] = 'revisar';
  for (const b of ativos) for (const id of b.pular) if (id in marcas) marcas[id] = 'pular';
  return marcas;
}

/**
 * Para cada tópico pulado, os tópicos a estudar ou revisar que dependem dele.
 * A pessoa declarou dominar o bloco, então o tópico continua pulado; a página mostra o aviso
 * para que nenhuma base suma da trilha sem explicação.
 */
export function dependentes(topicos: TopicoEntrada[], marcas: Record<string, Marca>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const t of topicos) {
    if (marcas[t.id] === 'pular') continue;
    for (const p of t.prerequisitos) if (marcas[p] === 'pular') (out[p] ??= []).push(t.id);
  }
  return out;
}

function faixa(meses: number): { min: number; max: number } {
  const min = Math.max(1, Math.floor(meses * 0.85));
  return { min, max: Math.max(min, Math.ceil(meses * 1.25)) };
}

export function estimar(
  topicos: TopicoEntrada[],
  niveis: NivelEntrada[],
  marcas: Record<string, Marca>,
  horas: number,
  nivelInicial = 1,
): Estimativa[] {
  // Aceita fração (a calibração usa 12,5); fora de 3 a 40 ou inválido, limita como o campo.
  const h = Number.isFinite(horas) ? Math.min(40, Math.max(3, horas)) : HORAS_PADRAO;
  const escala = HORAS_REFERENCIA / h;
  return [...niveis]
    .sort((a, b) => a.nivel - b.nivel)
    .map(({ nivel, duracao }) => {
      if (nivel < nivelInicial) return { nivel, meses: 0, min: 0, max: 0 };
      const doNivel = topicos.filter((t) => t.nivel === nivel);
      const todo = doNivel.reduce((s, t) => s + parseSemanas(t.tempo), 0);
      const resta = doNivel.reduce((s, t) => s + parseSemanas(t.tempo) * PESO[marcas[t.id] ?? 'estudar'], 0);
      const fracao = todo > 0 ? resta / todo : 1;
      const meses = Math.max(0.5, parseMeses(duracao) * (PARCELA_PROJETOS + (1 - PARCELA_PROJETOS) * fracao) * escala);
      return { nivel, meses, ...faixa(meses) };
    });
}

export function total(est: Estimativa[]): { min: number; max: number } {
  const soma = est.reduce((s, n) => s + n.meses, 0);
  return { min: Math.max(1, Math.floor(soma * 0.85)), max: Math.ceil(soma * 1.25) };
}

function ehSituacao(s: string | null): s is Situacao {
  return SITUACOES.some((x) => x.id === s);
}

export function perfilDaURL(q: URLSearchParams): Perfil {
  const s = q.get('s');
  const situacao: Situacao = ehSituacao(s) ? s : 'estudante';
  const horas = limitarHoras(q.get('h'));
  const b = q.get('b');
  const validos = new Set(BLOCOS.map((x) => x.id));
  const blocos =
    b === null ? [...PRESETS[situacao]] : b.split(',').filter((id, i, arr) => validos.has(id) && arr.indexOf(id) === i);
  const n = Number(q.get('n'));
  const nivel = Number.isInteger(n) && n >= 1 && n <= 4 ? n : 1;
  return { situacao, horas, blocos, nivel };
}

export function perfilParaURL(p: Perfil): string {
  return new URLSearchParams({ s: p.situacao, h: String(p.horas), b: p.blocos.join(','), n: String(p.nivel) }).toString();
}

export const CHAVE_PERFIL = 'rm-perfil-v1';

/** Início e fim (em meses) de cada nível: em sequência, com sobreposição de até 1 mês (metade do nível, se ele for curto). */
export function posicoes(est: Estimativa[]): { nivel: number; inicio: number; fim: number }[] {
  let fimAnterior = 0;
  let primeiro = true;
  return est.map((n) => {
    if (n.meses <= 0) return { nivel: n.nivel, inicio: fimAnterior, fim: fimAnterior };
    const inicio = primeiro ? 0 : Math.max(0, fimAnterior - Math.min(1, n.meses / 2));
    primeiro = false;
    fimAnterior = inicio + n.meses;
    return { nivel: n.nivel, inicio, fim: fimAnterior };
  });
}

/** Perfil salvo pela calculadora, ou null se não houver (ou se o armazenamento falhar). */
export function lerPerfilSalvo(storage: Pick<Storage, 'getItem'>): Perfil | null {
  try {
    const bruto = storage.getItem(CHAVE_PERFIL);
    return bruto ? perfilDaURL(new URLSearchParams(bruto)) : null;
  } catch {
    return null;
  }
}
