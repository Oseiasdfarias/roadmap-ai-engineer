import { SITE } from '../config';

/** Prefixa a base do site; rotas ganham barra final, arquivos com extensão não. */
export function url(caminho: string): string {
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(caminho)) return caminho;

  const corte = caminho.search(/[?#]/);
  let rota = corte === -1 ? caminho : caminho.slice(0, corte);
  const resto = corte === -1 ? '' : caminho.slice(corte);

  if (!rota.startsWith('/')) rota = '/' + rota;
  const ultimo = rota.slice(rota.lastIndexOf('/') + 1);
  if (!rota.endsWith('/') && !ultimo.includes('.')) rota += '/';

  return SITE.base + rota + resto;
}
