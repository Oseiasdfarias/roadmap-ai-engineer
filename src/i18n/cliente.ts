// Idioma nos scripts do navegador: vem do <html lang>, definido pelo layout a partir da URL.
import { link, type Idioma } from './idioma';

export const LANG: Idioma = typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'pt';
export const EN = LANG === 'en';

/** Texto no idioma da página. */
export const t = <T>(pt: T, en: T): T => (EN ? en : pt);

/** Caminho em português ("/nivel/1/") no idioma da página, com a base do site. */
export const rota = (caminhoPt: string): string => link(LANG, caminhoPt);

/** "3 meses" / "3 months". */
export const meses = (n: number): string => (EN ? `${n} ${n === 1 ? 'month' : 'months'}` : `${n} ${n === 1 ? 'mês' : 'meses'}`);

/** "3 a 5 meses" / "3 to 5 months". */
export const faixaTexto = (min: number, max: number): string => (min === max ? meses(min) : `${min} ${t('a', 'to')} ${meses(max)}`);
