import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export type DadosOg = { rota: string; titulo: string; rotulo: string; numero?: string };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Uma entrada por página que tem prévia social, nos dois idiomas. A rota é a mesma passada como `rotaOg` ao layout (no inglês, com o prefixo en/). */
export async function dadosOg(): Promise<DadosOg[]> {
  return [...(await dadosOgIdioma('pt')), ...(await dadosOgIdioma('en'))];
}

async function dadosOgIdioma(lang: 'pt' | 'en'): Promise<DadosOg[]> {
  const sufixo = lang === 'en' ? 'En' : '';
  const [niveis, fases, topicos, dicas, projetos] = await Promise.all([
    getCollection(`niveis${sufixo}` as 'niveis'),
    getCollection(`fases${sufixo}` as 'fases'),
    getCollection(`topicos${sufixo}` as 'topicos'),
    getCollection(`dicas${sufixo}` as 'dicas'),
    getCollection(`projetos${sufixo}` as 'projetos'),
  ]);
  const en = lang === 'en';
  const pre = en ? 'en/' : '';
  const T = en
    ? { slogan: 'Study and career, side by side', sobreT: 'About the roadmap', sobreR: 'What it is, how to use it and who makes it', nivel: 'Level', de: 'of', carreira: 'Career', fase: 'Phase', topico: 'Topic', projeto: 'Project' }
    : { slogan: 'Estudo e carreira, lado a lado', sobreT: 'Sobre o roadmap', sobreR: 'O que é, como usar e quem faz', nivel: 'Nível', de: 'de', carreira: 'Carreira', fase: 'Fase', topico: 'Tópico', projeto: 'Projeto' };
  return [
    { rota: `${pre}index`, titulo: 'Roadmap AI Engineer', rotulo: T.slogan },
    { rota: `${pre}sobre`, titulo: T.sobreT, rotulo: T.sobreR },
    ...niveis.map((n) => ({ rota: `${pre}nivel/${n.id}`, titulo: cap(n.data.nome), rotulo: `${T.nivel} ${n.data.id} ${T.de} ${niveis.length}`, numero: String(n.data.id) })),
    ...fases.map((f) => ({ rota: `${pre}fase/${f.id}`, titulo: cap(f.data.nome), rotulo: `${T.carreira} · ${T.fase} ${f.data.id}`, numero: String(f.data.id) })),
    ...topicos.map((t) => ({ rota: `${pre}topico/${t.id}`, titulo: t.data.titulo, rotulo: `${T.topico} · ${T.nivel} ${t.data.nivel}`, numero: String(t.data.nivel) })),
    ...dicas.map((d) => ({ rota: `${pre}carreira/${d.id}`, titulo: d.data.titulo, rotulo: `${T.carreira} · ${T.fase} ${d.data.fase}`, numero: String(d.data.fase) })),
    ...projetos.map((p) => ({ rota: `${pre}projeto/${p.id}`, titulo: p.data.titulo, rotulo: `${T.projeto} · ${T.nivel} ${p.data.nivel}`, numero: String(p.data.nivel) })),
  ];
}

const fonte = (pacote: string, arquivo: string) =>
  readFileSync(join(process.cwd(), 'node_modules', '@fontsource', pacote, 'files', arquivo));

let fontes: Array<{ name: string; data: Buffer; weight: 400 | 600 | 800; style: 'normal' }> | undefined;
function carregarFontes() {
  fontes ??= [
    { name: 'Inter', data: fonte('inter', 'inter-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Inter', data: fonte('inter', 'inter-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Manrope', data: fonte('manrope', 'manrope-latin-800-normal.woff'), weight: 800, style: 'normal' },
  ];
  return fontes;
}

// Tema claro do site.
const COR = { bg: '#F6F7F9', card: '#FFFFFF', texto: '#16202B', suave: '#667385', linha: '#E2E7EE', acc: '#3F6E9E', accSuave: '#EAF1F8' };

type No = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): No => ({
  type,
  props: { style, children, ...extra },
});

export async function renderizarOg(d: DadosOg): Promise<Buffer> {
  const tamanho = d.titulo.length > 60 ? 54 : d.titulo.length > 34 ? 66 : 80;
  const arvore = h(
    'div',
    { boxSizing: 'border-box', width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: COR.bg, padding: 72, fontFamily: 'Inter' },
    [
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
        h('div', { display: 'flex', fontFamily: 'Manrope', fontWeight: 800, fontSize: 34, color: COR.texto }, [
          h('span', { display: 'flex' }, 'Roadmap '),
          h('span', { display: 'flex', color: COR.acc }, 'AI Engineer'),
        ]),
        d.numero
          ? h('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, borderRadius: 48, background: COR.accSuave, border: `3px solid ${COR.acc}`, color: COR.acc, fontFamily: 'Manrope', fontWeight: 800, fontSize: 52 }, d.numero)
          : h('div', { display: 'flex' }, ''),
      ]),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { display: 'flex', fontSize: 30, fontWeight: 600, color: COR.acc, marginBottom: 20 }, d.rotulo),
        h('div', { display: 'flex', fontFamily: 'Manrope', fontWeight: 800, fontSize: tamanho, lineHeight: 1.08, letterSpacing: -2, color: COR.texto }, d.titulo),
      ]),
      h('div', { display: 'flex', fontSize: 26, color: COR.suave, borderTop: `2px solid ${COR.linha}`, paddingTop: 24 }, 'oseiasdfarias.github.io/roadmap-ai-engineer'),
    ],
  );
  const svg = await satori(arvore as never, { width: 1200, height: 630, fonts: carregarFontes() });
  return Buffer.from(new Resvg(svg).render().asPng());
}
