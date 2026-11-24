import { describe, expect, it } from 'vitest';
import { url } from '../../src/lib/url';

describe('url', () => {
  it('raiz', () => expect(url('/')).toBe('/roadmap-ai-engineer/'));
  it('rota sem barra inicial ganha barra final', () =>
    expect(url('nivel/1')).toBe('/roadmap-ai-engineer/nivel/1/'));
  it('mantém âncora', () =>
    expect(url('/topico/rag/#como-funciona')).toBe('/roadmap-ai-engineer/topico/rag/#como-funciona'));
  it('arquivo com extensão não ganha barra', () =>
    expect(url('/og/topico/rag.png')).toBe('/roadmap-ai-engineer/og/topico/rag.png'));
  it('externo fica intacto', () => expect(url('https://x.com/a')).toBe('https://x.com/a'));
  it('mantém query', () => expect(url('/busca?q=a')).toBe('/roadmap-ai-engineer/busca/?q=a'));
});
