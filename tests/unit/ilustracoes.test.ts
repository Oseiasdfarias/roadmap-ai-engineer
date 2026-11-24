import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const NOMES = [
  'capa', 'intro', 'nivel1', 'nivel2', 'nivel3', 'nivel4',
  'projetos', 'carreira', 'cursos', 'icone-1', 'icone-2', 'icone-3', 'icone-4',
];
const caminho = (n: string) => `src/assets/ilustracoes/${n}.svg`;

describe('ilustrações', () => {
  it('existem os 13 SVGs', () => {
    for (const n of NOMES) expect(existsSync(caminho(n)), n).toBe(true);
  });
  it('nenhuma cor hexadecimal fixa em fill/stroke', () => {
    for (const n of NOMES) {
      const svg = readFileSync(caminho(n), 'utf8');
      expect(svg, n).not.toMatch(/(?:fill|stroke)="#[0-9a-fA-F]{3,8}"/);
      expect(svg, n).not.toMatch(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?!-)/);
    }
  });
  it('todos têm viewBox e nenhum tem width/height fixos na raiz', () => {
    for (const n of NOMES) {
      const raiz = readFileSync(caminho(n), 'utf8').match(/<svg\b[^>]*>/)![0];
      expect(raiz, n).toMatch(/viewBox="/);
      expect(raiz, n).not.toMatch(/\s(width|height)=/);
    }
  });
});
