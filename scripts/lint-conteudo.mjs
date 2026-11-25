#!/usr/bin/env node
// Verifica o conteúdo do roadmap: seções do modelo, faixa de palavras, resumo,
// slugs existentes e ausência de emoji. Uso:
//   node scripts/lint-conteudo.mjs [arquivos...] [--rascunho]
// Sem arquivos, verifica todo src/content e procura emoji em src/components e src/pages.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const RAIZ_PROJETO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const MODELOS = {
  topicos: {
    secoes: ['O que é', 'Por que importa para um AI Engineer', 'Como funciona', 'Na prática', 'Erros comuns', 'Como estudar', 'Como mostrar'],
    opcionais: [],
    palavras: [400, 800],
  },
  dicas: {
    secoes: ['O que é', 'Por que importa', 'Passo a passo', 'Exemplo', 'Erros comuns', 'Checklist'],
    opcionais: [],
    palavras: [350, 700],
  },
  projetos: {
    secoes: ['O problema', 'Arquitetura', 'Versões em camadas', 'Stack sugerida', 'Critérios de aceite', 'O que colocar no README', 'Como apresentar na entrevista'],
    opcionais: ['Versões em camadas'],
    palavras: [500, 900],
  },
};

/** Modelos da versão em inglês (src/content/en): mesmas seções, títulos em inglês.
 *  A faixa de palavras é um pouco menor, porque o inglês costuma usar menos palavras que o português. */
export const MODELOS_EN = {
  topicos: {
    secoes: ['What it is', 'Why it matters for an AI Engineer', 'How it works', 'In practice', 'Common mistakes', 'How to study', 'How to show it'],
    opcionais: [],
    palavras: [350, 800],
  },
  dicas: {
    secoes: ['What it is', 'Why it matters', 'Step by step', 'Example', 'Common mistakes', 'Checklist'],
    opcionais: [],
    palavras: [300, 700],
  },
  projetos: {
    secoes: ['The problem', 'Architecture', 'Layered versions', 'Suggested stack', 'Acceptance criteria', 'What to put in the README', 'How to present it in an interview'],
    opcionais: ['Layered versions'],
    palavras: [450, 900],
  },
};

export const RESUMO = [140, 240];
const COLECOES = ['topicos', 'dicas', 'projetos', 'niveis', 'fases'];

// Extended_Pictographic inclui ©, ® e ™, que são símbolos de texto e não emoji.
const EMOJI = /(?![©®™])\p{Extended_Pictographic}|️/u;
export function temEmoji(texto) {
  return EMOJI.test(texto);
}

export function separarFrontmatter(texto) {
  const m = texto.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { dados: null, corpo: texto };
  return { dados: parseYaml(m[1]) ?? {}, corpo: m[2] };
}

function contarPalavras(corpo) {
  // Fluxogramas (```mermaid) não contam como texto corrido.
  corpo = corpo.replace(/^```mermaid\n[\s\S]*?^```$/gm, '');
  return (corpo.match(/[\p{L}\p{N}][\p{L}\p{N}'_-]*/gu) ?? []).length;
}

function secoesH2(corpo) {
  const titulos = [];
  let emCodigo = false;
  for (const linha of corpo.split('\n')) {
    if (/^\s*```/.test(linha)) emCodigo = !emCodigo;
    const m = !emCodigo && linha.match(/^##\s+(.+?)\s*$/);
    if (m) titulos.push(m[1]);
  }
  return titulos;
}

/** Slugs existentes por coleção, lidos de <raiz>/<colecao>/*.md. */
export function coletarSlugs(raiz) {
  const slugs = new Set();
  for (const c of COLECOES) {
    const dir = join(raiz, c);
    if (!existsSync(dir)) continue;
    for (const nome of readdirSync(dir)) {
      if (extname(nome) === '.md') slugs.add(basename(nome, '.md'));
    }
  }
  return slugs;
}

function listaDeSlugs(valor) {
  return Array.isArray(valor) ? valor.map(String) : [];
}

/**
 * Verifica o texto de um arquivo de conteúdo. Devolve a lista de erros (vazia se estiver ok).
 * opcoes: { tipo, slugs: Set<string>, rascunho: boolean }
 */
export function verificarTexto(texto, { tipo, slugs = new Set(), rascunho = false, idioma = 'pt' } = {}) {
  const erros = [];
  if (temEmoji(texto)) erros.push('contém emoji (proibido em todo o conteúdo)');

  let dados;
  let corpo;
  try {
    ({ dados, corpo } = separarFrontmatter(texto));
  } catch (e) {
    return [...erros, `frontmatter inválido: ${e.message}`];
  }
  if (!dados) return [...erros, 'frontmatter ausente'];

  const modelo = (idioma === 'en' ? MODELOS_EN : MODELOS)[tipo];
  const ehRascunho = dados.rascunho === true;
  if (ehRascunho && !rascunho) erros.push('rascunho: true não é aceito no modo estrito');

  if (tipo === 'niveis' || tipo === 'fases') {
    const refs = [];
    for (const g of dados.grupos ?? []) refs.push(...listaDeSlugs(g.topicos));
    refs.push(...listaDeSlugs(dados.projetos), ...listaDeSlugs(dados.dicas));
    for (const s of refs) if (!slugs.has(s)) erros.push(`slug inexistente: "${s}"`);
    return erros;
  }
  if (!modelo) return [...erros, `tipo desconhecido: ${tipo}`];

  const n = typeof dados.resumo === 'string' ? [...dados.resumo].length : 0;
  if (n < RESUMO[0] || n > RESUMO[1]) {
    erros.push(`resumo com ${n} caracteres (esperado ${RESUMO[0]} a ${RESUMO[1]})`);
  }

  const titulos = secoesH2(corpo);
  const esperadas = modelo.secoes.filter((s) => !modelo.opcionais.includes(s) || titulos.includes(s));
  for (const s of esperadas) if (!titulos.includes(s)) erros.push(`falta a seção "## ${s}"`);
  const naOrdem = titulos.filter((t) => modelo.secoes.includes(t));
  if (esperadas.every((s) => titulos.includes(s)) && naOrdem.join('|') !== esperadas.join('|')) {
    erros.push(`seções fora da ordem do modelo (esperado: ${esperadas.join(' > ')})`);
  }
  for (const t of titulos) if (!modelo.secoes.includes(t)) erros.push(`seção fora do modelo: "## ${t}"`);

  if (!(ehRascunho && rascunho)) {
    const p = contarPalavras(corpo);
    if (p < modelo.palavras[0] || p > modelo.palavras[1]) {
      erros.push(`${p} palavras (esperado ${modelo.palavras[0]} a ${modelo.palavras[1]})`);
    }
  }

  for (const campo of ['prerequisitos', 'relacionados']) {
    for (const s of listaDeSlugs(dados[campo])) {
      if (!slugs.has(s)) erros.push(`${campo}: slug inexistente "${s}"`);
    }
  }
  for (const r of dados.referencias ?? []) {
    if (typeof r?.url !== 'string' || !r.url.startsWith('https://')) {
      erros.push(`referência sem https: ${r?.url}`);
    }
  }
  return erros;
}

export function tipoDoCaminho(caminho) {
  const pasta = basename(dirname(resolve(caminho)));
  return COLECOES.includes(pasta) ? pasta : null;
}

export function verificarArquivo(caminho, { rascunho = false, slugs } = {}) {
  const abs = resolve(caminho);
  const tipo = tipoDoCaminho(abs);
  if (!tipo) return [`pasta fora das coleções (${COLECOES.join(', ')})`];
  const universo = slugs ?? coletarSlugs(dirname(dirname(abs)));
  const idioma = abs.split(sep).join('/').includes('/content/en/') ? 'en' : 'pt';
  return verificarTexto(readFileSync(abs, 'utf8'), { tipo, slugs: universo, rascunho, idioma });
}

function listarArquivos(dir, exts) {
  if (!existsSync(dir)) return [];
  const saida = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) saida.push(...listarArquivos(p, exts));
    else if (exts.includes(extname(e.name))) saida.push(p);
  }
  return saida;
}

export function verificarEmojiEmCodigo(raiz = RAIZ_PROJETO) {
  const resultado = [];
  for (const dir of ['src/components', 'src/pages']) {
    for (const arq of listarArquivos(join(raiz, dir), ['.astro', '.ts', '.tsx', '.js', '.mjs', '.css', '.md', '.svg', '.json'])) {
      if (temEmoji(readFileSync(arq, 'utf8'))) resultado.push([arq, ['contém emoji (proibido em componentes e páginas)']]);
    }
  }
  return resultado;
}

export function verificarTudo({ rascunho = false, raiz = RAIZ_PROJETO } = {}) {
  const conteudo = join(raiz, 'src/content');
  const slugs = coletarSlugs(conteudo);
  const resultado = [];
  for (const c of COLECOES) {
    for (const arq of listarArquivos(join(conteudo, c), ['.md'])) {
      const erros = verificarArquivo(arq, { rascunho, slugs });
      if (erros.length) resultado.push([arq, erros]);
    }
  }
  // Versão em inglês: mesmas regras, e cada arquivo em português precisa ter o equivalente.
  const conteudoEn = join(conteudo, 'en');
  if (existsSync(conteudoEn)) {
    const slugsEn = coletarSlugs(conteudoEn);
    for (const c of COLECOES) {
      for (const arq of listarArquivos(join(conteudoEn, c), ['.md'])) {
        const erros = verificarArquivo(arq, { rascunho, slugs: slugsEn });
        if (erros.length) resultado.push([arq, erros]);
      }
      for (const arq of listarArquivos(join(conteudo, c), ['.md'])) {
        if (!existsSync(join(conteudoEn, c, basename(arq)))) resultado.push([arq, ['falta a versão em inglês em src/content/en']]);
      }
    }
  }
  return [...resultado, ...verificarEmojiEmCodigo(raiz)];
}

function main(argv) {
  const rascunho = argv.includes('--rascunho');
  const arquivos = argv.filter((a) => !a.startsWith('--'));
  let resultado;
  if (arquivos.length) {
    const slugs = coletarSlugs(join(RAIZ_PROJETO, 'src/content'));
    resultado = [];
    for (const a of arquivos) {
      const abs = resolve(a);
      if (!existsSync(abs) || !statSync(abs).isFile()) {
        resultado.push([abs, ['arquivo não encontrado']]);
        continue;
      }
      const universo = abs.startsWith(join(RAIZ_PROJETO, 'src/content') + sep) ? slugs : undefined;
      const erros = verificarArquivo(abs, { rascunho, slugs: universo });
      if (erros.length) resultado.push([abs, erros]);
    }
  } else {
    resultado = verificarTudo({ rascunho });
  }
  for (const [arq, erros] of resultado) {
    console.error(relative(process.cwd(), arq));
    for (const e of erros) console.error(`  - ${e}`);
  }
  if (resultado.length) {
    console.error(`\n${resultado.length} arquivo(s) com problemas.`);
    process.exit(1);
  }
  console.log('lint:conteudo ok');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
