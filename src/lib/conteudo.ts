import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { colecao, link, type Idioma } from '../i18n/idioma';

// As coleções em inglês (topicosEn...) têm o mesmo schema das em português; os tipos usam as de português.
type Item = CollectionEntry<'topicos'> | CollectionEntry<'dicas'> | CollectionEntry<'projetos'>;
type Base = 'topicos' | 'dicas' | 'projetos' | 'niveis' | 'fases';

const porOrdem = <T extends { data: { ordem: number } }>(a: T, b: T) => a.data.ordem - b.data.ordem;

/** Todas as entradas de uma coleção no idioma. */
export async function colecaoDe<C extends Base>(nome: C, lang: Idioma = 'pt', filtro?: (e: CollectionEntry<C>) => boolean): Promise<CollectionEntry<C>[]> {
  const todas = (await getCollection(colecao(nome, lang) as C)) as CollectionEntry<C>[];
  return filtro ? todas.filter(filtro) : todas;
}

/** Uma entrada de uma coleção no idioma. */
export async function entradaDe<C extends Base>(nome: C, id: string, lang: Idioma = 'pt'): Promise<CollectionEntry<C> | undefined> {
  return (await getEntry(colecao(nome, lang) as C, id)) as CollectionEntry<C> | undefined;
}

/** Nome base da coleção (sem o sufixo En). */
export function baseDe(entry: { collection: string }): Base {
  return entry.collection.replace(/En$/, '') as Base;
}

/** Tópicos do nível agrupados na ordem dos grupos do nível, itens por `ordem`. */
export async function topicosDoNivel(n: number, lang: Idioma = 'pt'): Promise<Array<{ grupo: string; itens: CollectionEntry<'topicos'>[] }>> {
  const nivel = await entradaDe('niveis', String(n), lang);
  if (!nivel) return [];
  const todos = await colecaoDe('topicos', lang, (t) => t.data.nivel === n);
  return nivel.data.grupos.map((g) => {
    const ids = new Set(g.topicos.map((r) => r.id));
    return { grupo: g.titulo, itens: todos.filter((t) => ids.has(t.id)).sort(porOrdem) };
  });
}

export async function dicasDaFase(f: number, lang: Idioma = 'pt'): Promise<CollectionEntry<'dicas'>[]> {
  return (await colecaoDe('dicas', lang, (d) => d.data.fase === f)).sort(porOrdem);
}

/** Projetos do nível na ordem em que o nível os lista. */
export async function projetosDoNivel(n: number, lang: Idioma = 'pt'): Promise<CollectionEntry<'projetos'>[]> {
  const nivel = await entradaDe('niveis', String(n), lang);
  if (!nivel) return [];
  const todos = await colecaoDe('projetos', lang, (p) => p.data.nivel === n);
  const ordem = nivel.data.projetos.map((r) => r.id);
  return todos.sort((a, b) => ordem.indexOf(a.id) - ordem.indexOf(b.id));
}

/** Endereço da página da entrada; o idioma vem da coleção da própria entrada. */
export function rotaDe(entry: Item): string {
  const lang: Idioma = entry.collection.endsWith('En') ? 'en' : 'pt';
  const prefixo = { topicos: 'topico', dicas: 'carreira', projetos: 'projeto' }[baseDe(entry) as 'topicos' | 'dicas' | 'projetos'];
  return link(lang, `/${prefixo}/${entry.id}/`);
}

/** Id de progresso: igual nos dois idiomas, para o progresso valer em ambos. */
export function idProgresso(entry: CollectionEntry<'topicos'> | CollectionEntry<'dicas'>): string {
  return `${baseDe(entry) === 'topicos' ? 'topico' : 'carreira'}:${entry.id}`;
}

/** Itens vizinhos dentro do mesmo nível ou fase, na ordem de exibição. */
export async function vizinhos(entry: Item): Promise<{ anterior?: Item; proximo?: Item }> {
  const lang: Idioma = entry.collection.endsWith('En') ? 'en' : 'pt';
  let lista: Item[];
  const b = baseDe(entry);
  if (b === 'topicos') {
    lista = (await topicosDoNivel((entry as CollectionEntry<'topicos'>).data.nivel, lang)).flatMap((g) => g.itens);
  } else if (b === 'dicas') {
    lista = await dicasDaFase((entry as CollectionEntry<'dicas'>).data.fase, lang);
  } else {
    lista = await projetosDoNivel((entry as CollectionEntry<'projetos'>).data.nivel, lang);
  }
  const i = lista.findIndex((x) => x.id === entry.id);
  return { anterior: i > 0 ? lista[i - 1] : undefined, proximo: i >= 0 ? lista[i + 1] : undefined };
}

/** Ids de progresso de todos os tópicos e dicas (a base da contagem do cabeçalho). */
export async function todosIdsProgresso(): Promise<string[]> {
  const [topicos, dicas] = await Promise.all([getCollection('topicos'), getCollection('dicas')]);
  return [...topicos, ...dicas].map(idProgresso).sort();
}
