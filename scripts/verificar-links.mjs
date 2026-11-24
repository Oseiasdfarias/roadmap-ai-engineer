#!/usr/bin/env node
// Verifica as URLs externas do conteúdo (referencias de tópicos, dicas e projetos).
// Aceita 2xx e 3xx; lista as falhas e sai com código 1 se houver alguma. Uso:
//   node scripts/verificar-links.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const PARALELO = 6;

const urls = new Map(); // url -> arquivos
for (const colecao of ['topicos', 'dicas', 'projetos']) {
  const dir = join(RAIZ, 'src/content', colecao);
  for (const nome of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const texto = readFileSync(join(dir, nome), 'utf8');
    const front = /^---\n([\s\S]*?)\n---/.exec(texto)?.[1] ?? '';
    const dados = parseYaml(front) ?? {};
    const achados = new Set((dados.referencias ?? []).map((r) => r.url));
    for (const m of texto.matchAll(/\]\((https?:\/\/(?:[^()\s]|\([^()\s]*\))+)\)/g)) achados.add(m[1]);
    for (const u of achados) urls.set(u, [...(urls.get(u) ?? []), `${colecao}/${nome}`]);
  }
}

async function checar(u) {
  const tentar = async (metodo) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20_000);
    try {
      return await fetch(u, { method: metodo, redirect: 'manual', signal: ctl.signal, headers: { 'User-Agent': UA, Accept: 'text/html,*/*' } });
    } finally {
      clearTimeout(t);
    }
  };
  try {
    let r = await tentar('HEAD');
    if (r.status >= 400) r = await tentar('GET'); // alguns servidores recusam HEAD
    await r.body?.cancel();
    return r.status >= 200 && r.status < 400 ? null : `HTTP ${r.status}`;
  } catch (e) {
    return e.name === 'AbortError' ? 'tempo esgotado' : String(e.cause?.code ?? e.message);
  }
}

const fila = [...urls.keys()];
const falhas = [];
await Promise.all(
  Array.from({ length: PARALELO }, async () => {
    while (fila.length) {
      const u = fila.shift();
      const erro = await checar(u);
      if (erro) falhas.push({ u, erro });
    }
  }),
);

console.log(`${urls.size} links verificados, ${falhas.length} com falha.`);
for (const { u, erro } of falhas) console.log(`  ${erro}  ${u}\n    em ${urls.get(u).join(', ')}`);
process.exit(falhas.length ? 1 : 0);
