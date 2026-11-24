export const CHAVE_PROGRESSO = 'rm-progresso-v1';

export type Estado = Record<string, true>;
type Armazem = Pick<Storage, 'getItem' | 'setItem'>;

/** Lê o progresso salvo; qualquer conteúdo inválido vale como estado vazio. */
export function ler(storage: Armazem): Estado {
  try {
    const bruto = storage.getItem(CHAVE_PROGRESSO);
    if (!bruto) return {};
    const obj: unknown = JSON.parse(bruto);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const estado: Estado = {};
    for (const [k, v] of Object.entries(obj)) if (v === true) estado[k] = true;
    return estado;
  } catch {
    return {};
  }
}

/** Marca ou desmarca o id e devolve o novo estado dele (true = estudado). */
export function alternar(storage: Armazem, id: string): boolean {
  const estado = ler(storage);
  const agora = !estado[id];
  if (agora) estado[id] = true;
  else delete estado[id];
  try {
    storage.setItem(CHAVE_PROGRESSO, JSON.stringify(estado));
  } catch {
    /* armazenamento indisponível: o estado vale só nesta página */
  }
  return agora;
}

export function contar(estado: Estado, ids: string[]): { feitos: number; total: number; pct: number } {
  const feitos = ids.filter((i) => estado[i]).length;
  const total = ids.length;
  return { feitos, total, pct: total ? Math.round((100 * feitos) / total) : 0 };
}
