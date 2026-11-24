import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function htmlsDe(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return htmlsDe(caminho);
    return caminho.endsWith('.html') ? [caminho] : [];
  });
}

export function linksAbsolutos(arquivo: string): string[] {
  const html = readFileSync(arquivo, 'utf8');
  const achados = [...html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1]);
  return achados.filter((l) => !l.startsWith('//'));
}
