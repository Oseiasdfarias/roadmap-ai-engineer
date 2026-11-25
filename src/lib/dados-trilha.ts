import type { NivelEntrada, TopicoEntrada } from './trilha';
import { colecaoDe, topicosDoNivel } from './conteudo';
import { link, type Idioma } from '../i18n/idioma';

export type DadosTrilha = {
  topicos: (TopicoEntrada & { titulo: string; href: string })[];
  niveis: (NivelEntrada & { titulo: string; curto: string; href: string; fase: number })[];
};

/** Tópicos e níveis que a calculadora e as etiquetas de perfil usam no navegador. */
export async function dadosTrilha(lang: Idioma = 'pt'): Promise<DadosTrilha> {
  const niveisCol = (await colecaoDe('niveis', lang)).sort((a, b) => Number(a.id) - Number(b.id));
  const topicos: DadosTrilha['topicos'] = [];
  for (const n of niveisCol) {
    for (const g of await topicosDoNivel(Number(n.id), lang)) {
      for (const { id, data } of g.itens) {
        topicos.push({
          id,
          titulo: data.titulo,
          nivel: data.nivel,
          tempo: data.tempo ?? (lang === 'en' ? '1 week' : '1 semana'),
          prerequisitos: (data.prerequisitos ?? []).map((p) => p.id),
          href: link(lang, `/topico/${id}/`),
        });
      }
    }
  }
  const niveis = niveisCol
    .map(({ id, data }) => ({ nivel: Number(id), duracao: data.duracao, titulo: data.nome, curto: data.curto, href: link(lang, `/nivel/${id}/`), fase: data.fase }));
  return { topicos, niveis };
}
