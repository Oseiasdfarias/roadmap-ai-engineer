import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verificarArquivo, verificarTexto, temEmoji } from '../../scripts/lint-conteudo.mjs';

const FIX = resolve(__dirname, '../fixtures/conteudo');
const f = (rel: string) => resolve(FIX, rel);

describe('lint-conteudo: tópicos', () => {
  it('aceita um tópico completo', () => {
    expect(verificarArquivo(f('topicos/valido.md'))).toEqual([]);
  });

  it('falha citando a seção que falta', () => {
    const erros = verificarArquivo(f('topicos/sem-erros-comuns.md'));
    expect(erros.join('\n')).toContain('## Erros comuns');
  });

  it('falha com menos de 400 palavras', () => {
    const erros = verificarArquivo(f('topicos/curto.md'));
    expect(erros.join('\n')).toMatch(/palavras/);
  });

  it('falha com resumo fora de 140 a 240 caracteres', () => {
    const erros = verificarArquivo(f('topicos/resumo-curto.md'));
    expect(erros.join('\n')).toMatch(/resumo/);
  });

  it('falha com emoji no corpo', () => {
    const texto = readFileSync(f('topicos/valido.md'), 'utf8') + `\nFoguete ${String.fromCodePoint(0x1f680)}\n`;
    const erros = verificarTexto(texto, { tipo: 'topicos', slugs: new Set(['outro']) });
    expect(erros.join('\n')).toMatch(/emoji/);
  });

  it('falha com relacionados inexistente', () => {
    const erros = verificarArquivo(f('topicos/relacionado-inexistente.md'));
    expect(erros.join('\n')).toContain('nao-existe');
  });

  it('rascunho falha no modo estrito e passa com rascunho', () => {
    expect(verificarArquivo(f('topicos/rascunho.md')).join('\n')).toMatch(/rascunho/);
    expect(verificarArquivo(f('topicos/rascunho.md'), { rascunho: true })).toEqual([]);
  });
});

describe('lint-conteudo: dicas e projetos', () => {
  it('dica de 6 seções e faixa de palavras passa', () => {
    expect(verificarArquivo(f('dicas/valida.md'))).toEqual([]);
  });
  it('dica curta demais falha', () => {
    expect(verificarArquivo(f('dicas/curta.md')).join('\n')).toMatch(/palavras/);
  });
  it('projeto com 6 ou 7 seções passa (Versões em camadas é opcional)', () => {
    expect(verificarArquivo(f('projetos/valido.md'))).toEqual([]);
    expect(verificarArquivo(f('projetos/com-camadas.md'))).toEqual([]);
  });
});

describe('temEmoji', () => {
  it('detecta pictogramas e U+FE0F, ignora símbolos de texto', () => {
    expect(temEmoji(String.fromCodePoint(0x1f680))).toBe(true);
    expect(temEmoji('x️')).toBe(true);
    expect(temEmoji('© 2026 → ok')).toBe(false);
  });
});
