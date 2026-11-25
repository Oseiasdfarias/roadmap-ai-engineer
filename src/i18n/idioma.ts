import { SITE } from '../config';
import { url } from '../lib/url';

/** Idiomas do site. O português fica na raiz; o inglês, em /en/. */
export type Idioma = 'pt' | 'en';
export const IDIOMAS: Idioma[] = ['pt', 'en'];

/** Primeiro segmento das rotas em português e o equivalente em inglês. */
const SEGMENTOS: Record<string, string> = {
  topico: 'topic',
  carreira: 'career',
  projeto: 'project',
  nivel: 'level',
  fase: 'phase',
  calculadora: 'calculator',
  progresso: 'progress',
  sobre: 'about',
};
const SEGMENTOS_PT = Object.fromEntries(Object.entries(SEGMENTOS).map(([pt, en]) => [en, pt]));

/** Idioma de um pathname (com ou sem a base do site). */
export function idiomaDaUrl(pathname: string): Idioma {
  const semBase = pathname.startsWith(SITE.base) ? pathname.slice(SITE.base.length) : pathname;
  return semBase === '/en' || semBase.startsWith('/en/') ? 'en' : 'pt';
}

function separar(caminho: string): { rota: string; resto: string } {
  const corte = caminho.search(/[?#]/);
  return corte === -1 ? { rota: caminho, resto: '' } : { rota: caminho.slice(0, corte), resto: caminho.slice(corte) };
}

/** Caminho em português (sem a base, ex.: "/topico/rag/") convertido para o idioma, já com a base. */
export function link(lang: Idioma, caminhoPt: string): string {
  if (lang === 'pt') return url(caminhoPt);
  const { rota, resto } = separar(caminhoPt.startsWith('/') ? caminhoPt : '/' + caminhoPt);
  const partes = rota.split('/');
  if (partes[1] && SEGMENTOS[partes[1]]) partes[1] = SEGMENTOS[partes[1]];
  return url('/en' + partes.join('/') + resto);
}

/** A mesma página nos dois idiomas, a partir do pathname atual (com a base). */
export function equivalentes(pathname: string): Record<Idioma, string> {
  const semBase = pathname.startsWith(SITE.base) ? pathname.slice(SITE.base.length) : pathname;
  let rotaPt = semBase;
  if (idiomaDaUrl(pathname) === 'en') {
    const partes = semBase.replace(/^\/en/, '').split('/');
    if (partes[1] && SEGMENTOS_PT[partes[1]]) partes[1] = SEGMENTOS_PT[partes[1]];
    rotaPt = partes.join('/') || '/';
  }
  return { pt: link('pt', rotaPt), en: link('en', rotaPt) };
}

/** Escolhe o texto do idioma: tr(lang, { pt: '...', en: '...' }). */
export function tr<T>(lang: Idioma, textos: Record<Idioma, T>): T {
  return textos[lang];
}

/** Nome da coleção de conteúdo no idioma. */
export type ColecaoBase = 'topicos' | 'dicas' | 'projetos' | 'niveis' | 'fases';
export function colecao<C extends ColecaoBase>(nome: C, lang: Idioma): C | `${C}En` {
  return lang === 'pt' ? nome : (`${nome}En` as `${C}En`);
}
