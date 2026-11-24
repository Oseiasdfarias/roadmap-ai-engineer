import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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

const topicos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/topicos' }),
  schema: z.object({
    ...base,
    nivel: z.number().int().min(1).max(4),
    prerequisitos: z.array(reference('topicos')).optional(),
    relacionados: z.array(reference('topicos')).optional(),
  }),
});

const dicas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/dicas' }),
  schema: z.object({
    ...base,
    fase: z.number().int().min(1).max(5),
    prerequisitos: z.array(reference('dicas')).optional(),
    relacionados: z.array(reference('dicas')).optional(),
  }),
});

const projetos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projetos' }),
  schema: z.object({
    titulo: z.string().min(1),
    codigo: z.string().regex(/^(P[1-4]|PF)$/),
    nivel: z.number().int().min(1).max(4),
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
  loader: glob({ pattern: '*.md', base: './src/content/niveis' }),
  schema: z.object({
    id: z.number().int().min(1).max(4),
    nome: z.string(),
    curto: z.string(),
    duracao: z.string(),
    objetivo: z.string(),
    resultado: z.string(),
    prerequisitos: z.string(),
    grupos: z.array(z.object({ titulo: z.string(), topicos: z.array(reference('topicos')) })),
    projetos: z.array(reference('projetos')).default([]),
    criterios: z.array(z.string()),
    fase: z.number().int().min(1).max(5),
  }),
});

const fases = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/fases' }),
  schema: z.object({
    id: z.number().int().min(1).max(5),
    nome: z.string(),
    quando: z.string(),
    objetivo: z.string(),
    dicas: z.array(reference('dicas')),
    niveis: z.array(z.number().int().min(1).max(4)).default([]),
    criterios: z.array(z.string()),
  }),
});

export const collections = { topicos, dicas, projetos, niveis, fases };
