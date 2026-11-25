import { SITUACOES } from '../data/blocos';
import { CARREIRA } from '../data/carreira-perfis';
import {
  classificar,
  estimar,
  lerPerfilSalvo,
  perfilParaURL,
  posicoes,
  total,
  type Estimativa,
  type Marca,
  type NivelEntrada,
  type Perfil,
  type TopicoEntrada,
} from '../lib/trilha';

/**
 * Ajusta o site inteiro ao perfil salvo pela calculadora ou pela escolha da home:
 * prazos, linha do tempo, chamadas, carreira e etiquetas dos tópicos.
 * Sem perfil, devolve cada trecho ao texto original. Reaplica no evento `perfil:mudou`.
 */

type NivelBase = NivelEntrada & { curto: string; fase: number };
type Dados = { topicos: TopicoEntrada[]; niveis: NivelBase[] };

const CURTO: Record<Marca, string> = { pular: 'pular', revisar: 'revisar', estudar: '' };
const LONGO: Record<Marca, string> = {
  pular: 'Pelo seu perfil, você pode pular este tópico.',
  revisar: 'Pelo seu perfil, basta uma revisão rápida.',
  estudar: '',
};
/** Fim do estudo e da carreira na linha do tempo de referência (meses). */
const FIM_ESTUDO_REF = 21;
const FIM_CARREIRA_REF = 24;
const FASES_REF: Record<string, [number, number]> = { '1': [0, 4], '2': [4, 17], '3': [17, 24] };

const meses = (n: number) => `${n} ${n === 1 ? 'mês' : 'meses'}`;
const faixaTexto = (min: number, max: number) => (min === max ? meses(min) : `${min} a ${meses(max)}`);
const todos = <T extends HTMLElement = HTMLElement>(sel: string) => [...document.querySelectorAll<T>(sel)];

/** Troca o texto guardando o original; `null` restaura. */
function texto(el: HTMLElement, v: string | null): void {
  if (el.dataset.orig === undefined) el.dataset.orig = el.textContent ?? '';
  el.textContent = v ?? el.dataset.orig;
}
/** Troca um atributo guardando o original; `null` restaura. */
function atributo(el: HTMLElement, nome: string, v: string | null): void {
  const chave = `orig${nome.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())}`;
  if (el.dataset[chave] === undefined) el.dataset[chave] = el.getAttribute(nome) ?? '';
  const valor = v ?? el.dataset[chave]!;
  if (valor === '') el.removeAttribute(nome);
  else el.setAttribute(nome, valor);
}

function dadosBase(): Dados | null {
  try {
    const bruto = document.querySelector('script[data-trilha-base]')?.textContent;
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function lerPerfil(): Perfil | null {
  try {
    return lerPerfilSalvo(localStorage);
  } catch {
    return null;
  }
}

/** Fase de carreira em que a pessoa está: a do perfil (dev, dados) ou a do nível de partida. */
export function faseAtual(perfil: Perfil, niveis: NivelBase[]): number {
  return CARREIRA[perfil.situacao].fase ?? niveis.find((n) => n.nivel === perfil.nivel)?.fase ?? 1;
}

function etiquetas(perfil: Perfil | null, dados: Dados | null): void {
  const els = todos('[data-etiqueta-topico]');
  if (!els.length) return;
  const nivelDe = new Map((dados?.topicos ?? []).map((t) => [t.id, t.nivel]));
  const ids = [...new Set(els.map((e) => e.dataset.etiquetaTopico!))];
  const marcas = perfil
    ? classificar(
        ids.map((id) => ({ id, nivel: nivelDe.get(id) ?? 0, tempo: '', prerequisitos: [] })),
        perfil.blocos,
        undefined,
        perfil.nivel,
      )
    : {};
  for (const el of els) {
    const m: Marca = marcas[el.dataset.etiquetaTopico!] ?? 'estudar';
    el.hidden = m === 'estudar';
    if (m === 'estudar') continue;
    el.dataset.marca = m;
    const alvo = el.querySelector<HTMLElement>('[data-etiqueta-texto]') ?? el;
    alvo.textContent = el.hasAttribute('data-etiqueta-perfil') ? LONGO[m] : CURTO[m];
  }
}

function duracoes(perfil: Perfil | null, est: Estimativa[]): void {
  for (const el of todos('[data-perfil-duracao]')) {
    const n = est.find((e) => String(e.nivel) === el.dataset.perfilDuracao);
    if (!perfil || !n) texto(el, null);
    else texto(el, n.meses === 0 ? 'já domina' : faixaTexto(n.min, n.max));
    atributo(el, 'title', perfil ? 'Ajustado ao seu perfil' : null);
  }
}

const coluna = (inicio: number, fim: number) => `${inicio + 2} / ${Math.max(fim, inicio + 1) + 2}`;

function linhaDoTempo(perfil: Perfil | null, est: Estimativa[]): void {
  const tl = document.querySelector<HTMLElement>('[data-perfil-tl]');
  if (!tl) return;
  const regua = tl.querySelector<HTMLElement>('.tl-reg');
  if (regua && regua.dataset.origHtml === undefined) regua.dataset.origHtml = regua.innerHTML;
  const barras = [...tl.querySelectorAll<HTMLElement>('.tl-barra[data-nivel]')];
  const fases = [...tl.querySelectorAll<HTMLElement>('.tl-fase[data-fase]')];
  const proprio = tl.querySelector<HTMLElement>('[data-perfil-tl-carreira]');
  const titulo = document.querySelector<HTMLElement>('[data-perfil-tl-titulo]');
  const genericos = todos('#tempo [data-perfil-generico]');

  if (!perfil) {
    tl.style.removeProperty('--tl-meses');
    if (regua) regua.innerHTML = regua.dataset.origHtml!;
    [...barras, ...fases].forEach((b) => {
      atributo(b, 'style', null);
      b.hidden = false;
    });
    if (proprio) proprio.hidden = true;
    if (titulo) texto(titulo, null);
    genericos.forEach((g) => (g.hidden = false));
    return;
  }

  const pos = posicoes(est);
  const fimEstudo = Math.max(1, ...pos.map((p) => p.fim));
  const fator = fimEstudo / FIM_ESTUDO_REF;
  const comFases = CARREIRA[perfil.situacao].fase === null;
  const M = Math.max(2, comFases ? Math.ceil(FIM_CARREIRA_REF * fator) : Math.ceil(fimEstudo));
  tl.style.setProperty('--tl-meses', String(M));

  if (regua) {
    const passo = M > 36 ? 6 : M > 12 ? 3 : 1;
    regua.innerHTML = regua.dataset.origHtml!;
    const rotulo = regua.querySelector('span');
    regua.replaceChildren(...(rotulo ? [rotulo] : []));
    for (let m = 0; m < M; m++) {
      const s = document.createElement('span');
      s.textContent = m % passo === 0 ? String(m) : '';
      regua.append(s);
    }
  }
  for (const b of barras) {
    const p = pos.find((x) => String(x.nivel) === b.dataset.nivel);
    const e = est.find((x) => String(x.nivel) === b.dataset.nivel);
    b.hidden = !p || !e || e.meses === 0;
    if (p && !b.hidden) b.style.gridColumn = coluna(Math.floor(p.inicio), Math.min(M, Math.ceil(p.fim)));
  }
  if (comFases) {
    if (proprio) proprio.hidden = true;
    let fimAnt = 0;
    fases.forEach((f, i) => {
      f.hidden = false;
      const [ini0, fim0] = FASES_REF[f.dataset.fase!] ?? [0, 1];
      const ini = Math.min(M - 1, Math.max(fimAnt, Math.round(ini0 * fator)));
      const fim = i === fases.length - 1 ? M : Math.max(ini + 1, Math.round(fim0 * fator));
      f.style.gridColumn = coluna(ini, fim);
      fimAnt = fim;
    });
  } else if (proprio) {
    fases.forEach((f) => (f.hidden = true));
    proprio.hidden = false;
    proprio.textContent = CARREIRA[perfil.situacao].titulo;
    proprio.style.gridColumn = coluna(0, M);
  }
  genericos.forEach((g) => (g.hidden = true));
  const t = total(est);
  if (titulo) texto(titulo, `Sua trilha: ${faixaTexto(t.min, t.max)}, com ${perfil.horas} horas por semana.`);
}

function carreira(perfil: Perfil | null, dados: Dados | null): void {
  const quadro = perfil && perfil.situacao !== 'estudante' ? perfil.situacao : null;
  const quadros = todos('[data-perfil-carreira]');
  quadros.forEach((q) => (q.hidden = q.dataset.perfilCarreira !== quadro));
  const temQuadro = quadro !== null && quadros.some((q) => q.dataset.perfilCarreira === quadro);
  todos('[data-perfil-generico]:not(#tempo [data-perfil-generico]), [data-nota-perfil]').forEach(
    (el) => (el.hidden = temQuadro),
  );
  // "Você está aqui" na lista de fases da home.
  const fase = perfil && dados ? faseAtual(perfil, dados.niveis) : null;
  todos('[data-fase-item]').forEach((li) => {
    const aqui = fase !== null && li.dataset.faseItem === String(fase);
    li.classList.toggle('aqui', aqui);
    const tag = li.querySelector<HTMLElement>('[data-perfil-aqui]');
    if (tag) tag.hidden = !aqui;
  });
  // Rótulo de carreira nos cards de nível: o caminho do perfil para quem não passa por estágio.
  const semFases = perfil && CARREIRA[perfil.situacao].fase !== null;
  todos('[data-perfil-fase-rot]').forEach((el) => texto(el, semFases ? CARREIRA[perfil!.situacao].curto : null));
}

function home(perfil: Perfil | null, est: Estimativa[], dados: Dados | null): void {
  const nivel = perfil?.nivel ?? 1;
  const curto = dados?.niveis.find((n) => n.nivel === nivel)?.curto ?? '';
  const base = document.querySelector<HTMLElement>('[data-base-url]')?.dataset.baseUrl ?? '/';
  for (const el of todos<HTMLAnchorElement>('[data-perfil-cta]')) {
    atributo(el, 'href', perfil ? `${base}nivel/${nivel}/` : null);
    texto(el, perfil ? (el.dataset.perfilCta === 'curto' ? `Abrir o nível ${nivel}` : `Continuar pelo nível ${nivel}`) : null);
  }
  const ctaTitulo = document.querySelector<HTMLElement>('[data-perfil-cta-titulo]');
  if (ctaTitulo) texto(ctaTitulo, perfil ? `Continue pelo nível ${nivel}, ${curto.toLowerCase()}.` : null);
  const ctaTexto = document.querySelector<HTMLElement>('[data-perfil-cta-texto]');
  if (ctaTexto) {
    const t = total(est);
    texto(ctaTexto, perfil ? `Sua trilha leva de ${faixaTexto(t.min, t.max)} com ${perfil.horas} horas por semana. O progresso fica salvo no seu navegador.` : null);
  }
  // Estações da abertura: meses da pessoa no lugar dos anos.
  const pos = posicoes(est);
  const fimEstudo = Math.max(0, ...pos.map((p) => p.fim));
  for (const el of todos('[data-periodo-nome]')) {
    if (!perfil) {
      texto(el, null);
      continue;
    }
    const nv = Number(el.dataset.periodoNome);
    const p = pos.find((x) => x.nivel === nv);
    const e = est.find((x) => x.nivel === nv);
    if (nv && e && e.meses === 0) texto(el, 'Já domina');
    else if (nv && p) texto(el, `Mês ${Math.floor(p.inicio)}`);
    else texto(el, `Mês ${Math.ceil(fimEstudo)}+`);
  }
  // Cards de nível anteriores ao de partida.
  todos('[data-perfil-ja]').forEach((el) => (el.hidden = !perfil || Number(el.dataset.perfilJa) >= nivel));
  // Resumo da escolha.
  const resumo = document.querySelector<HTMLElement>('[data-perfil-resumo]');
  if (resumo && perfil && dados) {
    const marcas = classificar(dados.topicos, perfil.blocos, undefined, perfil.nivel);
    const conta = { pular: 0, revisar: 0, estudar: 0 };
    for (const m of Object.values(marcas)) conta[m]++;
    const t = total(est);
    const set = (k: string, v: string) => {
      const el = resumo.querySelector(`[data-resumo="${k}"]`);
      if (el) el.textContent = v;
    };
    set('situacao', SITUACOES.find((s) => s.id === perfil.situacao)?.rotulo ?? '');
    set('nivel', `começa no nível ${nivel} · ${curto}`);
    set('horas', `${perfil.horas} h por semana`);
    set('total', faixaTexto(t.min, t.max));
    set('topicos', `${conta.estudar} tópicos para estudar, ${conta.revisar} para revisar e ${conta.pular} para pular`);
    set('carreira', CARREIRA[perfil.situacao].titulo);
    const refinar = resumo.querySelector<HTMLAnchorElement>('[data-resumo-refinar]');
    if (refinar) refinar.href = `${base}calculadora/?${perfilParaURL(perfil)}`;
  }
}

export function aplicar(): void {
  const perfil = lerPerfil();
  const dados = dadosBase();
  const est =
    perfil && dados
      ? estimar(dados.topicos, dados.niveis, classificar(dados.topicos, perfil.blocos, undefined, perfil.nivel), perfil.horas, perfil.nivel)
      : [];
  etiquetas(perfil, dados);
  duracoes(perfil, est);
  linhaDoTempo(perfil, est);
  carreira(perfil, dados);
  home(perfil, est, dados);
  todos('[data-perfil-aviso]').forEach((el) => (el.hidden = !perfil));
  todos('[data-sem-perfil]').forEach((el) => (el.hidden = !!perfil));
  document.documentElement.toggleAttribute('data-com-perfil', !!perfil);
}

aplicar();
document.addEventListener('perfil:mudou', aplicar);
window.addEventListener('storage', (e) => {
  if (e.key === 'rm-perfil-v1' || e.key === null) aplicar();
});
