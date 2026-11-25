import { SITUACOES } from '../data/blocos';
import { CARREIRA, CARREIRA_EN } from '../data/carreira-perfis';
import { EN, faixaTexto, rota, t } from '../i18n/cliente';

/** t() com nome alternativo, para funções em que `t` é o total estimado. */
const tr = t;
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

const CURTO: Record<Marca, string> = t({ pular: 'pular', revisar: 'revisar', estudar: '' }, { pular: 'skip', revisar: 'review', estudar: '' });
const LONGO: Record<Marca, string> = t(
  { pular: 'Pelo seu perfil, você pode pular este tópico.', revisar: 'Pelo seu perfil, basta uma revisão rápida.', estudar: '' },
  { pular: 'Based on your profile, you can skip this topic.', revisar: 'Based on your profile, a quick review is enough.', estudar: '' },
);
/** Fim do estudo e da carreira na linha do tempo de referência (meses). */
const FIM_ESTUDO_REF = 27;
const FIM_CARREIRA_REF = 27;
const FASES_REF: Record<string, [number, number]> = { '1': [0, 4], '2': [4, 17], '3': [17, 27] };

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

/** Elementos que só recebem a marca como atributo (quadrados do mapa de progresso). */
function marcasEmAtributo(marcas: Record<string, Marca> | null): void {
  todos('[data-marca-topico]').forEach((el) => {
    const m = marcas?.[el.dataset.marcaTopico!];
    if (m && m !== 'estudar') el.dataset.marca = m;
    else delete el.dataset.marca;
  });
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
    else texto(el, n.meses === 0 ? t('já domina', 'already mastered') : faixaTexto(n.min, n.max));
    atributo(el, 'title', perfil ? t('Ajustado ao seu perfil', 'Adjusted to your profile') : null);
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
  if (titulo) texto(titulo, tr(`Sua trilha: ${faixaTexto(t.min, t.max)}, com ${perfil.horas} horas por semana.`, `Your path: ${faixaTexto(t.min, t.max)}, at ${perfil.horas} hours per week.`));
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
  const inicioFase = semFases ? CARREIRA[perfil!.situacao].fase! : 1;
  const titulo = document.querySelector<HTMLElement>('[data-perfil-carr-titulo]');
  if (titulo) texto(titulo, semFases ? t('Seu caminho até IA, a partir de onde você está.', 'Your path to AI, from where you are now.') : null);
  const nota = document.querySelector<HTMLElement>('[data-fases-nota]');
  const botao = document.querySelector<HTMLButtonElement>('[data-fases-todas]');
  const todasAbertas = botao?.getAttribute('aria-expanded') === 'true';
  if (nota) nota.hidden = !semFases;
  todos('[data-fase-item]').forEach((li) => (li.hidden = !!semFases && !todasAbertas && Number(li.dataset.faseItem) < inicioFase));
  // Subtítulos das estações: sem estágio nem júnior para quem já trabalha na área.
  const niveisPorId = new Map((dados?.niveis ?? []).map((n) => [String(n.nivel), n.curto]));
  todos('[data-periodo-sub]').forEach((el) => {
    const curto = niveisPorId.get(el.dataset.periodoSub!);
    texto(el, semFases && curto ? curto.charAt(0).toUpperCase() + curto.slice(1) : null);
  });
  todos('[data-perfil-fase-rot]').forEach((el) => texto(el, semFases ? CARREIRA[perfil!.situacao].curto : null));
}

function home(perfil: Perfil | null, est: Estimativa[], dados: Dados | null): void {
  const nivel = perfil?.nivel ?? 1;
  const curto = dados?.niveis.find((n) => n.nivel === nivel)?.curto ?? '';
  const base = document.querySelector<HTMLElement>('[data-base-url]')?.dataset.baseUrl ?? '/';
  for (const el of todos<HTMLAnchorElement>('[data-perfil-cta]')) {
    atributo(el, 'href', perfil ? rota(`/nivel/${nivel}/`) : null);
    texto(el, perfil ? (el.dataset.perfilCta === 'curto' ? t(`Abrir o nível ${nivel}`, `Open level ${nivel}`) : t(`Continuar pelo nível ${nivel}`, `Continue with level ${nivel}`)) : null);
  }
  const ctaTitulo = document.querySelector<HTMLElement>('[data-perfil-cta-titulo]');
  if (ctaTitulo) texto(ctaTitulo, perfil ? t(`Continue pelo nível ${nivel}, ${curto.toLowerCase()}.`, `Continue with level ${nivel}, ${curto.toLowerCase()}.`) : null);
  const ctaTexto = document.querySelector<HTMLElement>('[data-perfil-cta-texto]');
  if (ctaTexto) {
    const t = total(est);
    texto(ctaTexto, perfil ? tr(`Sua trilha leva de ${faixaTexto(t.min, t.max)} com ${perfil.horas} horas por semana. O progresso fica salvo no seu navegador.`, `Your path takes ${faixaTexto(t.min, t.max)} at ${perfil.horas} hours per week. Progress is saved in your browser.`) : null);
  }
  // Estações da abertura: meses da pessoa no lugar dos anos.
  const pos = posicoes(est);
  for (const el of todos('[data-periodo-nome]')) {
    if (!perfil) {
      texto(el, null);
      continue;
    }
    const nv = Number(el.dataset.periodoNome);
    const p = pos.find((x) => x.nivel === nv);
    const e = est.find((x) => x.nivel === nv);
    if (nv && e && e.meses === 0) texto(el, t('Já domina', 'Already mastered'));
    else if (nv && p) texto(el, t(`Mês ${Math.floor(p.inicio)}`, `Month ${Math.floor(p.inicio)}`));
    else texto(el, null);
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
    set('situacao', (EN ? SITUACOES.find((s) => s.id === perfil.situacao)?.rotuloEn : SITUACOES.find((s) => s.id === perfil.situacao)?.rotulo) ?? '');
    set('nivel', tr(`começa no nível ${nivel} · ${curto}`, `starts at level ${nivel} · ${curto}`));
    set('horas', tr(`${perfil.horas} h por semana`, `${perfil.horas} h per week`));
    set('total', faixaTexto(t.min, t.max));
    set('topicos', tr(`${conta.estudar} tópicos para estudar, ${conta.revisar} para revisar e ${conta.pular} para pular`, `${conta.estudar} topics to study, ${conta.revisar} to review and ${conta.pular} to skip`));
    set('carreira', (EN ? CARREIRA_EN : CARREIRA)[perfil.situacao].titulo);
    const refinar = resumo.querySelector<HTMLAnchorElement>('[data-resumo-refinar]');
    if (refinar) refinar.href = `${rota('/calculadora/')}?${perfilParaURL(perfil)}`;
  }
}

/** Painel de nível da home: esconde o que o perfil manda pular e mostra os próximos tópicos no lugar. */
function painelNiveis(marcas: Record<string, Marca> | null): void {
  const base = document.querySelector<HTMLElement>('[data-base-url]')?.dataset.baseUrl ?? '/';
  for (const painel of todos('[data-nivel-painel]')) {
    const max = Number(painel.querySelector<HTMLElement>('[data-painel-max]')?.dataset.painelMax ?? 5);
    let ocultos = 0;
    let total = 0;
    for (const grupo of painel.querySelectorAll<HTMLElement>('[data-painel-grupo]')) {
      const itens = [...grupo.querySelectorAll<HTMLElement>('[data-painel-topico]')];
      const restantes = itens.filter((li) => !marcas || marcas[li.dataset.painelTopico!] !== 'pular');
      ocultos += itens.length - restantes.length;
      total += itens.length;
      itens.forEach((li) => (li.hidden = !restantes.slice(0, max).includes(li)));
      grupo.hidden = restantes.length === 0;
      const mais = grupo.querySelector<HTMLElement>('[data-painel-mais]');
      if (mais) {
        mais.hidden = restantes.length <= max;
        const n = mais.querySelector('[data-painel-mais-n]');
        if (n) n.textContent = String(restantes.length - max);
      }
    }
    const nt = painel.querySelector<HTMLElement>('[data-painel-ntopicos]');
    if (nt) texto(nt, marcas && ocultos ? t(`${total - ocultos} de ${total} tópicos para você`, `${total - ocultos} of ${total} topics for you`) : null);
    const aviso = painel.querySelector<HTMLElement>('[data-painel-ocultos]');
    if (aviso) {
      aviso.hidden = ocultos === 0;
      if (ocultos) {
        aviso.replaceChildren(
          t(`${ocultos} ${ocultos === 1 ? 'tópico que você já domina está oculto' : 'tópicos que você já domina estão ocultos'}. `, `${ocultos} ${ocultos === 1 ? 'topic you already master is hidden' : 'topics you already master are hidden'}. `),
          Object.assign(document.createElement('a'), { href: rota(`/nivel/${painel.dataset.nivelPainel}/`), textContent: t('Ver o nível completo', 'See the full level') }),
        );
      }
    }
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
  const marcasTodas = perfil && dados ? classificar(dados.topicos, perfil.blocos, undefined, perfil.nivel) : null;
  painelNiveis(marcasTodas);
  marcasEmAtributo(marcasTodas);
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

document.querySelector<HTMLButtonElement>('[data-fases-todas]')?.addEventListener('click', (e) => {
  const b = e.currentTarget as HTMLButtonElement;
  const abrir = b.getAttribute('aria-expanded') !== 'true';
  b.setAttribute('aria-expanded', String(abrir));
  b.textContent = abrir ? t('Mostrar só o meu caminho', 'Show only my path') : t('Mostrar todas as fases', 'Show all phases');
  aplicar();
});
