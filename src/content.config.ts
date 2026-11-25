import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// O mesmo schema vale para o português (src/content/<colecao>) e o inglês (src/content/en/<colecao>).
// Os campos de dados (tipo de referência, idioma, slugs) não se traduzem; só os textos.

const referencia = z.object({
  titulo: z.string().min(1),
  url: z.string().regex(/^https:\/\/\S+$/, 'a URL precisa ser https'),
  tipo: z.enum(['Vídeo', 'Curso', 'Docs', 'Artigo', 'Repositório', 'Vagas', 'Livro']),
  idioma: z.enum(['pt', 'en']),
  gratuito: z.boolean(),
});

const base = {
  titulo: z.string().min(1),
  grupo: z.string().min(1),
  ordem: z.number().int().positive(),
  resumo: z.string().min(140).max(240),
  tempo: z.string().optional(),
  ferramentas: z.array(z.string()).optional(),
  referencias: z.array(referencia).default([]),
  revisado: z.coerce.date(),
  rascunho: z.boolean().default(false),
};

type Refs = { topicos: () => ReturnType<typeof reference>; dicas: () => ReturnType<typeof reference>; projetos: () => ReturnType<typeof reference> };

function criar(pasta: string, refs: Refs) {
  const ref = (nome: keyof Refs) => refs[nome]();

  const topicos = defineCollection({
    loader: glob({ pattern: '*.md', base: `${pasta}/topicos` }),
    schema: z.object({
      ...base,
      nivel: z.number().int().min(1).max(5),
      prerequisitos: z.array(ref('topicos')).optional(),
      relacionados: z.array(ref('topicos')).optional(),
    }),
  });

  const dicas = defineCollection({
    loader: glob({ pattern: '*.md', base: `${pasta}/dicas` }),
    schema: z.object({
      ...base,
      fase: z.number().int().min(1).max(5),
      prerequisitos: z.array(ref('dicas')).optional(),
      relacionados: z.array(ref('dicas')).optional(),
    }),
  });

  const projetos = defineCollection({
    loader: glob({ pattern: '*.md', base: `${pasta}/projetos` }),
    schema: z.object({
      titulo: z.string().min(1),
      codigo: z.string().regex(/^(P[1-5]|PF)$/),
      nivel: z.number().int().min(1).max(5),
      resumo: z.string().min(140).max(240),
      camadas: z.array(z.object({ versao: z.string(), nome: z.string(), entrega: z.string() })).optional(),
      stack: z.array(z.string()),
      criterios: z.array(z.string()),
      referencias: z.array(referencia).default([]),
      revisado: z.coerce.date(),
      rascunho: z.boolean().default(false),
    }),
  });

  const niveis = defineCollection({
    loader: glob({ pattern: '*.md', base: `${pasta}/niveis` }),
    schema: z.object({
      id: z.number().int().min(1).max(5),
      nome: z.string(),
      curto: z.string(),
      duracao: z.string(),
      objetivo: z.string(),
      resultado: z.string(),
      prerequisitos: z.string(),
      grupos: z.array(z.object({ titulo: z.string(), topicos: z.array(ref('topicos')) })),
      projetos: z.array(ref('projetos')).default([]),
      criterios: z.array(z.string()),
      fase: z.number().int().min(1).max(5),
    }),
  });

  const fases = defineCollection({
    loader: glob({ pattern: '*.md', base: `${pasta}/fases` }),
    schema: z.object({
      id: z.number().int().min(1).max(5),
      nome: z.string(),
      quando: z.string(),
      objetivo: z.string(),
      dicas: z.array(ref('dicas')),
      niveis: z.array(z.number().int().min(1).max(5)).default([]),
      criterios: z.array(z.string()),
    }),
  });

  return { topicos, dicas, projetos, niveis, fases };
}

const pt = criar('./src/content', { topicos: () => reference('topicos'), dicas: () => reference('dicas'), projetos: () => reference('projetos') });
const en = criar('./src/content/en', { topicos: () => reference('topicosEn'), dicas: () => reference('dicasEn'), projetos: () => reference('projetosEn') });

export const collections = {
  ...pt,
  topicosEn: en.topicos,
  dicasEn: en.dicas,
  projetosEn: en.projetos,
  niveisEn: en.niveis,
  fasesEn: en.fases,
};
