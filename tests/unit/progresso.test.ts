import { describe, expect, it } from 'vitest';
import { alternar, contar, ler } from '../../src/lib/progresso';

function falso(inicial?: string) {
  const dados = new Map<string, string>();
  if (inicial !== undefined) dados.set('rm-progresso-v1', inicial);
  return {
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
    dados,
  };
}

describe('progresso', () => {
  it('estado vazio conta zero', () => {
    expect(contar(ler(falso()), ['a', 'b', 'c'])).toEqual({ feitos: 0, total: 3, pct: 0 });
  });

  it('alternar grava e devolve true; de novo remove e devolve false', () => {
    const s = falso();
    expect(alternar(s, 'topico:rag')).toBe(true);
    expect(s.dados.get('rm-progresso-v1')).toBe('{"topico:rag":true}');
    expect(alternar(s, 'topico:rag')).toBe(false);
    expect(s.dados.get('rm-progresso-v1')).toBe('{}');
  });

  it('JSON corrompido vira estado vazio', () => {
    expect(ler(falso('{quebrado'))).toEqual({});
    expect(ler(falso('[1,2]'))).toEqual({});
    expect(ler(falso('null'))).toEqual({});
  });

  it('conta só os ids pedidos e arredonda a porcentagem', () => {
    const estado = { a: true, z: true } as const;
    expect(contar({ ...estado }, ['a', 'b', 'c'])).toEqual({ feitos: 1, total: 3, pct: 33 });
  });

  it('lista vazia não divide por zero', () => {
    expect(contar({}, [])).toEqual({ feitos: 0, total: 0, pct: 0 });
  });
});
