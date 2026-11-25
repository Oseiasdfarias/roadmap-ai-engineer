import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { separarFrontmatter } from '../../scripts/lint-conteudo.mjs';
import { PERIODOS } from '../../src/data/periodos';

const CONTEUDO = resolve(__dirname, '../../src/content');

function listar(colecao: string): string[] {
  const dir = resolve(CONTEUDO, colecao);
  return existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.md')).map((n) => n.replace(/\.md$/, '')) : [];
}
function dados(colecao: string, id: string) {
  return separarFrontmatter(readFileSync(resolve(CONTEUDO, colecao, `${id}.md`), 'utf8')).dados!;
}

const topicos = listar('topicos');
const dicas = listar('dicas');
const projetos = listar('projetos');
const niveis = listar('niveis').sort();
const fases = listar('fases').sort();

describe('inventário', () => {
  it('tem 53 tópicos, 17 dicas, 6 projetos, 5 níveis e 5 fases', () => {
    expect(topicos).toHaveLength(53);
    expect(dicas).toHaveLength(17);
    expect(projetos).toHaveLength(6);
    expect(niveis).toEqual(['1', '2', '3', '4', '5']);
    expect(fases).toEqual(['1', '2', '3', '4', '5']);
  });
});

describe('referências cruzadas', () => {
  it('todo slug dos níveis e fases existe', () => {
    for (const n of niveis) {
      const d = dados('niveis', n);
      for (const g of d.grupos) for (const s of g.topicos) expect(topicos, `nivel ${n}: ${s}`).toContain(s);
      for (const s of d.projetos) expect(projetos, `nivel ${n}: ${s}`).toContain(s);
      expect(fases).toContain(String(d.fase));
    }
    for (const f of fases) {
      const d = dados('fases', f);
      for (const s of d.dicas) expect(dicas, `fase ${f}: ${s}`).toContain(s);
      for (const n of d.niveis) expect(niveis).toContain(String(n));
    }
  });

  it('todo tópico pertence a exatamente um grupo de um nível, coerente com o frontmatter', () => {
    const dono = new Map<string, Array<{ nivel: number; grupo: string }>>();
    for (const n of niveis) {
      for (const g of dados('niveis', n).grupos) {
        for (const s of g.topicos) dono.set(s, [...(dono.get(s) ?? []), { nivel: Number(n), grupo: g.titulo }]);
      }
    }
    for (const t of topicos) {
      const donos = dono.get(t) ?? [];
      expect(donos, t).toHaveLength(1);
      const d = dados('topicos', t);
      expect(d.nivel, t).toBe(donos[0].nivel);
      expect(d.grupo, t).toBe(donos[0].grupo);
    }
  });

  it('toda dica pertence a exatamente uma fase, coerente com o frontmatter', () => {
    for (const d of dicas) {
      const donas = fases.filter((f) => dados('fases', f).dicas.includes(d));
      expect(donas, d).toHaveLength(1);
      expect(String(dados('dicas', d).fase), d).toBe(donas[0]);
    }
  });

  it('todo projeto pertence a um nível, coerente com o frontmatter', () => {
    for (const p of projetos) {
      const donos = niveis.filter((n) => dados('niveis', n).projetos.includes(p));
      expect(donos, p).toHaveLength(1);
      expect(String(dados('projetos', p).nivel), p).toBe(donos[0]);
    }
  });
});

describe('PERIODOS', () => {
  it('tem 6 itens e referencia níveis e fases existentes', () => {
    expect(PERIODOS).toHaveLength(6);
    for (const p of PERIODOS) {
      for (const n of [p.nivel]) if (n !== undefined) expect(niveis).toContain(String(n));
      for (const f of [p.fase, p.faseLink]) if (f !== undefined) expect(fases).toContain(String(f));
      expect(p.nivel !== undefined || p.notaEstudo).toBeTruthy();
      expect(p.fase !== undefined || p.notaCarreira).toBeTruthy();
    }
    expect(PERIODOS.map((p) => p.nome)).toEqual(['Começo', '1º ano', '1º e 2º ano', '2º ano', 'Com experiência', 'Maturidade']);
  });
});
