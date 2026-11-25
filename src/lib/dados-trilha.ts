import { getCollection } from 'astro:content';
import type { NivelEntrada, TopicoEntrada } from './trilha';
import { topicosDoNivel } from './conteudo';
import { url } from './url';

export type DadosTrilha = {
  topicos: (TopicoEntrada & { titulo: string; href: string })[];
  niveis: (NivelEntrada & { titulo: string; curto: string; href: string })[];
};

/** Tópicos e níveis que a calculadora e as etiquetas de perfil usam no navegador. */
export async function dadosTrilha(): Promise<DadosTrilha> {
  const niveisCol = (await getCollection('niveis')).sort((a, b) => Number(a.id) - Number(b.id));
  const topicos: DadosTrilha['topicos'] = [];
  for (const n of niveisCol) {
    for (const g of await topicosDoNivel(Number(n.id))) {
      for (const { id, data } of g.itens) {
        topicos.push({
          id,
          titulo: data.titulo,
          nivel: data.nivel,
          tempo: data.tempo ?? '1 semana',
          prerequisitos: (data.prerequisitos ?? []).map((p) => p.id),
          href: url(`/topico/${id}/`),
        });
      }
    }
  }
  const niveis = niveisCol
    .map(({ id, data }) => ({ nivel: Number(id), duracao: data.duracao, titulo: data.nome, curto: data.curto, href: url(`/nivel/${id}/`) }));
  return { topicos, niveis };
}
