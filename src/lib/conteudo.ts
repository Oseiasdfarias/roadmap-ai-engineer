import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { url } from './url';

type Item = CollectionEntry<'topicos'> | CollectionEntry<'dicas'> | CollectionEntry<'projetos'>;

const porOrdem = <T extends { data: { ordem: number } }>(a: T, b: T) => a.data.ordem - b.data.ordem;

/** Tópicos do nível agrupados na ordem dos grupos do nível, itens por `ordem`. */
export async function topicosDoNivel(n: number): Promise<Array<{ grupo: string; itens: CollectionEntry<'topicos'>[] }>> {
  const nivel = await getEntry('niveis', String(n));
  if (!nivel) return [];
  const todos = await getCollection('topicos', (t) => t.data.nivel === n);
  return nivel.data.grupos.map((g) => {
    const ids = new Set(g.topicos.map((r) => r.id));
    return { grupo: g.titulo, itens: todos.filter((t) => ids.has(t.id)).sort(porOrdem) };
  });
}

export async function dicasDaFase(f: number): Promise<CollectionEntry<'dicas'>[]> {
  return (await getCollection('dicas', (d) => d.data.fase === f)).sort(porOrdem);
}

/** Projetos do nível na ordem em que o nível os lista. */
export async function projetosDoNivel(n: number): Promise<CollectionEntry<'projetos'>[]> {
  const nivel = await getEntry('niveis', String(n));
  if (!nivel) return [];
  const todos = await getCollection('projetos', (p) => p.data.nivel === n);
  const ordem = nivel.data.projetos.map((r) => r.id);
  return todos.sort((a, b) => ordem.indexOf(a.id) - ordem.indexOf(b.id));
}

export function rotaDe(entry: Item): string {
  const prefixo = { topicos: 'topico', dicas: 'carreira', projetos: 'projeto' }[entry.collection];
  return url(`/${prefixo}/${entry.id}/`);
}

export function idProgresso(entry: CollectionEntry<'topicos'> | CollectionEntry<'dicas'>): string {
  return `${entry.collection === 'topicos' ? 'topico' : 'carreira'}:${entry.id}`;
}

/** Itens vizinhos dentro do mesmo nível ou fase, na ordem de exibição. */
export async function vizinhos(entry: Item): Promise<{ anterior?: Item; proximo?: Item }> {
  let lista: Item[];
  if (entry.collection === 'topicos') {
    lista = (await topicosDoNivel(entry.data.nivel)).flatMap((g) => g.itens);
  } else if (entry.collection === 'dicas') {
    lista = await dicasDaFase(entry.data.fase);
  } else {
    lista = await projetosDoNivel(entry.data.nivel);
  }
  const i = lista.findIndex((x) => x.id === entry.id);
  return { anterior: i > 0 ? lista[i - 1] : undefined, proximo: i >= 0 ? lista[i + 1] : undefined };
}
