import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { separarFrontmatter } from '../../scripts/lint-conteudo.mjs';
import { BLOCOS, PRESETS, type Bloco } from '../../src/data/blocos';
import {
  classificar,
  dependentes,
  estimar,
  limitarHoras,
  parseMeses,
  parseSemanas,
  perfilDaURL,
  perfilParaURL,
  total,
  type TopicoEntrada,
} from '../../src/lib/trilha';

const CONTEUDO = resolve(__dirname, '../../src/content');
function ler(colecao: string) {
  return readdirSync(resolve(CONTEUDO, colecao))
    .filter((n) => n.endsWith('.md'))
    .map((n) => ({ id: n.replace(/\.md$/, ''), d: separarFrontmatter(readFileSync(resolve(CONTEUDO, colecao, n), 'utf8')).dados! }));
}
const TOPICOS: TopicoEntrada[] = ler('topicos').map(({ id, d }) => ({
  id,
  nivel: d.nivel,
  tempo: d.tempo,
  prerequisitos: d.prerequisitos ?? [],
}));
const NIVEIS = ler('niveis').map(({ id, d }) => ({ nivel: Number(id), duracao: d.duracao }));

describe('parsers', () => {
  it('parseSemanas', () => {
    expect(parseSemanas('1 semana')).toBe(1);
    expect(parseSemanas('1 a 2 semanas')).toBe(1.5);
    expect(parseSemanas('6 a 10 semanas')).toBe(8);
    expect(parseSemanas('3 a 5 dias')).toBeCloseTo(4 / 7);
    expect(parseSemanas('1 a 2 semanas, depois uso contínuo')).toBe(1.5);
  });
  it('parseMeses', () => {
    expect(parseMeses('4 a 6 meses')).toBe(5);
  });
  it('limitarHoras', () => {
    expect(limitarHoras(0)).toBe(3);
    expect(limitarHoras(99)).toBe(40);
    expect(limitarHoras('abc')).toBe(12);
    expect(limitarHoras(undefined)).toBe(12);
    expect(limitarHoras(null)).toBe(12);
    expect(limitarHoras('')).toBe(12);
    expect(limitarHoras('20')).toBe(20);
    expect(limitarHoras(12.7)).toBe(13);
    expect(limitarHoras(Infinity)).toBe(12);
  });
});

describe('classificar', () => {
  it('sem blocos, tudo estudar', () => {
    const m = classificar(TOPICOS, []);
    expect(Object.values(m).every((v) => v === 'estudar')).toBe(true);
    expect(Object.keys(m)).toHaveLength(38);
  });
  it('mapeia pular e revisar', () => {
    expect(classificar(TOPICOS, ['python-basico'])['python-fundamentos']).toBe('pular');
    expect(classificar(TOPICOS, ['testes'])['testes-e-evals-no-projeto']).toBe('revisar');
  });
  it('ignora bloco desconhecido', () => {
    expect(classificar(TOPICOS, ['nao-existe'])).toEqual(classificar(TOPICOS, []));
  });
  it('bloco dominado continua pulado mesmo sendo base de outros', () => {
    const t: TopicoEntrada[] = [
      { id: 'a', nivel: 1, tempo: '1 semana', prerequisitos: [] },
      { id: 'b', nivel: 1, tempo: '1 semana', prerequisitos: ['a'] },
      { id: 'c', nivel: 1, tempo: '1 semana', prerequisitos: ['a', 'b'] },
    ];
    const def: Bloco[] = [{ id: 'x', rotulo: 'X', pular: ['a', 'b'], revisar: [] }];
    const m = classificar(t, ['x'], def);
    expect(m).toEqual({ a: 'pular', b: 'pular', c: 'estudar' });
    expect(dependentes(t, m)).toEqual({ a: ['c'], b: ['c'] });
  });
  it('todo mapeamento de bloco aponta para tópico real', () => {
    const ids = new Set(TOPICOS.map((t) => t.id));
    for (const b of BLOCOS) for (const id of [...b.pular, ...b.revisar]) expect(ids, `${b.id}: ${id}`).toContain(id);
    for (const lista of Object.values(PRESETS)) for (const id of lista) expect(BLOCOS.map((b) => b.id)).toContain(id);
  });
});

describe('estimar', () => {
  const soma = (e: ReturnType<typeof estimar>) => e.reduce((s, n) => s + n.meses, 0);
  it('calibração: 12,5 h e nada marcado dá 18,5 meses', () => {
    expect(soma(estimar(TOPICOS, NIVEIS, classificar(TOPICOS, []), 12.5))).toBeCloseTo(18.5, 1);
  });
  it('horas em dobro, meses pela metade', () => {
    const m = classificar(TOPICOS, []);
    expect(soma(estimar(TOPICOS, NIVEIS, m, 25))).toBeCloseTo(18.5 / 2, 1);
  });
  it('tudo marcado com 40 h: nenhum nível abaixo de 0,5 mês', () => {
    const m = classificar(TOPICOS, BLOCOS.map((b) => b.id));
    for (const n of estimar(TOPICOS, NIVEIS, m, 40)) expect(n.meses).toBeGreaterThanOrEqual(0.5);
  });
  it('faixa por nível e total', () => {
    const e = estimar(TOPICOS, NIVEIS, classificar(TOPICOS, []), 12);
    for (const n of e) {
      expect(n.min).toBe(Math.max(1, Math.floor(n.meses * 0.85)));
      expect(n.max).toBe(Math.max(n.min, Math.ceil(n.meses * 1.25)));
      expect(Number.isFinite(n.meses)).toBe(true);
    }
    const t = total(e);
    expect(t.min).toBe(Math.max(1, Math.floor(soma(e) * 0.85)));
    expect(t.max).toBe(Math.ceil(soma(e) * 1.25));
  });
  it('perfil dev encurta a trilha', () => {
    const base = soma(estimar(TOPICOS, NIVEIS, classificar(TOPICOS, []), 12));
    const dev = soma(estimar(TOPICOS, NIVEIS, classificar(TOPICOS, PRESETS.dev), 12));
    expect(dev).toBeLessThan(base);
  });
});

describe('URL', () => {
  it('valores inválidos caem no padrão', () => {
    expect(perfilDaURL(new URLSearchParams('s=xyz&h=-5&b=git,naoexiste'))).toEqual({
      situacao: 'estudante',
      horas: 3,
      blocos: ['git'],
    });
  });
  it('sem b usa o preset da situação', () => {
    expect(perfilDaURL(new URLSearchParams('s=dev')).blocos).toEqual(PRESETS.dev);
    expect(perfilDaURL(new URLSearchParams('')).horas).toBe(12);
  });
  it('b vazio significa nenhum bloco', () => {
    expect(perfilDaURL(new URLSearchParams('s=dev&b=')).blocos).toEqual([]);
  });
  it('ida e volta', () => {
    const p = { situacao: 'dados' as const, horas: 20, blocos: ['git', 'sql'] };
    expect(perfilDaURL(new URLSearchParams(perfilParaURL(p)))).toEqual(p);
  });
});
