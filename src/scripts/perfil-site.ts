import { CARREIRA } from '../data/carreira-perfis';
import {
  classificar,
  estimar,
  lerPerfilSalvo,
  posicoes,
  total,
  type Estimativa,
  type Marca,
  type NivelEntrada,
  type Perfil,
  type TopicoEntrada,
} from '../lib/trilha';

/**
 * Quando a pessoa já usou a calculadora, ajusta o site inteiro ao perfil salvo:
 * prazos dos níveis, linha do tempo da home, quadros de carreira e etiquetas dos tópicos.
 * Sem perfil salvo, nada muda.
 */

const CURTO: Record<Marca, string> = { pular: 'pular', revisar: 'revisar', estudar: '' };
const LONGO: Record<Marca, string> = {
  pular: 'Pelo seu perfil, você pode pular este tópico.',
  revisar: 'Pelo seu perfil, basta uma revisão rápida.',
  estudar: '',
};
/** Fim do estudo e da carreira na linha do tempo de referência (meses). */
const FIM_ESTUDO_REF = 21;
const FIM_CARREIRA_REF = 24;

const meses = (n: number) => `${n} ${n === 1 ? 'mês' : 'meses'}`;
export const faixaTexto = (min: number, max: number) => (min === max ? meses(min) : `${min} a ${meses(max)}`);

function dadosBase(): { topicos: TopicoEntrada[]; niveis: NivelEntrada[] } | null {
  try {
    const bruto = document.querySelector('script[data-trilha-base]')?.textContent;
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function etiquetas(perfil: Perfil): void {
  const els = [...document.querySelectorAll<HTMLElement>('[data-etiqueta-topico]')];
  if (!els.length) return;
  const ids = [...new Set(els.map((e) => e.dataset.etiquetaTopico!))];
  const marcas = classificar(ids.map((id) => ({ id, nivel: 0, tempo: '', prerequisitos: [] })), perfil.blocos);
  for (const el of els) {
    const m = marcas[el.dataset.etiquetaTopico!] ?? 'estudar';
    el.hidden = m === 'estudar';
    if (m === 'estudar') continue;
    el.dataset.marca = m;
    const alvo = el.querySelector('[data-etiqueta-texto]') ?? el;
    alvo.textContent = el.hasAttribute('data-etiqueta-perfil') ? LONGO[m] : CURTO[m];
  }
}

function duracoes(est: Estimativa[]): void {
  for (const n of est) {
    document.querySelectorAll<HTMLElement>(`[data-perfil-duracao="${n.nivel}"]`).forEach((el) => {
      el.textContent = faixaTexto(n.min, n.max);
      el.title = 'Ajustado ao seu perfil na calculadora';
    });
  }
}

const coluna = (inicio: number, fim: number) => `${inicio + 2} / ${Math.max(fim, inicio + 1) + 2}`;

function linhaDoTempo(perfil: Perfil, est: Estimativa[]): void {
  const tl = document.querySelector<HTMLElement>('[data-perfil-tl]');
  if (!tl) return;
  const pos = posicoes(est);
  const fimEstudo = pos.length ? pos[pos.length - 1].fim : FIM_ESTUDO_REF;
  const fator = fimEstudo / FIM_ESTUDO_REF;
  const estudante = perfil.situacao === 'estudante' || perfil.situacao === 'fora';
  const M = Math.max(2, estudante ? Math.ceil(FIM_CARREIRA_REF * fator) : Math.ceil(fimEstudo));
  tl.style.setProperty('--tl-meses', String(M));

  const regua = tl.querySelector('.tl-reg');
  if (regua) {
    const passo = M > 36 ? 6 : M > 12 ? 3 : 1;
    const rotulo = regua.querySelector('span');
    regua.replaceChildren(...(rotulo ? [rotulo] : []));
    for (let m = 0; m < M; m++) {
      const s = document.createElement('span');
      s.textContent = m % passo === 0 ? String(m) : '';
      regua.append(s);
    }
  }
  for (const p of pos) {
    const barra = tl.querySelector<HTMLElement>(`.tl-barra[data-nivel="${p.nivel}"]`);
    if (barra) barra.style.gridColumn = coluna(Math.floor(p.inicio), Math.min(M, Math.ceil(p.fim)));
  }

  const fases = [...tl.querySelectorAll<HTMLElement>('.tl-fase[data-fase]')];
  const proprio = tl.querySelector<HTMLElement>('[data-perfil-tl-carreira]');
  if (estudante) {
    // Mesmas fases, na escala do novo prazo.
    const ref: Record<string, [number, number]> = { '1': [0, 4], '2': [4, 17], '3': [17, 24] };
    let fimAnt = 0;
    for (const f of fases) {
      const [i, fim] = ref[f.dataset.fase!] ?? [0, 1];
      const ini = Math.max(fimAnt, Math.round(i * fator));
      const fimN = f === fases[fases.length - 1] ? M : Math.max(ini + 1, Math.round(fim * fator));
      f.style.gridColumn = coluna(ini, fimN);
      fimAnt = fimN;
    }
  } else if (proprio) {
    fases.forEach((f) => (f.hidden = true));
    proprio.hidden = false;
    proprio.textContent = CARREIRA[perfil.situacao].titulo;
    proprio.style.gridColumn = coluna(0, M);
  }

  document.querySelectorAll<HTMLElement>('#tempo [data-perfil-generico]').forEach((el) => (el.hidden = true));
  const t = total(est);
  const titulo = document.querySelector('[data-perfil-tl-titulo]');
  if (titulo) titulo.textContent = `Sua trilha: ${faixaTexto(t.min, t.max)}, com ${perfil.horas} horas por semana.`;
}

function carreira(perfil: Perfil): void {
  if (perfil.situacao === 'estudante') return;
  const quadros = document.querySelectorAll<HTMLElement>(`[data-perfil-carreira="${perfil.situacao}"]`);
  if (!quadros.length) return;
  quadros.forEach((q) => (q.hidden = false));
  document.querySelectorAll<HTMLElement>('[data-perfil-generico], [data-nota-perfil]').forEach((el) => (el.hidden = true));
}

function iniciar(): void {
  let perfil: Perfil | null = null;
  try {
    perfil = lerPerfilSalvo(localStorage);
  } catch {
    return;
  }
  if (!perfil) return;
  etiquetas(perfil);
  const dados = dadosBase();
  if (dados) {
    const est = estimar(dados.topicos, dados.niveis, classificar(dados.topicos, perfil.blocos), perfil.horas);
    duracoes(est);
    linhaDoTempo(perfil, est);
  }
  carreira(perfil);
  document.querySelectorAll<HTMLElement>('[data-perfil-aviso]').forEach((el) => (el.hidden = false));
}

iniciar();
