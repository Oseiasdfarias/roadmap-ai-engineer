import { PRESETS, type Situacao } from '../data/blocos';
import { marcarVarios } from '../lib/progresso';
import {
  classificar,
  dependentes,
  estimar,
  limitarHoras,
  perfilDaURL,
  perfilParaURL,
  total,
  type Marca,
  type Perfil,
} from '../lib/trilha';
import type { DadosTrilha } from '../lib/dados-trilha';

export const CHAVE_PERFIL = 'rm-perfil-v1';
const ROTULO: Record<Marca, string> = { pular: 'Pular', revisar: 'Revisar', estudar: 'Estudar' };

function armazem(): Pick<Storage, 'getItem' | 'setItem'> {
  try {
    const s = localStorage;
    s.getItem(CHAVE_PERFIL);
    return s;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
}

const meses = (n: number) => `${n} ${n === 1 ? 'mês' : 'meses'}`;
const faixaTexto = (min: number, max: number) => (min === max ? meses(min) : `${min} a ${meses(max)}`);

function iniciar(): void {
  const form = document.querySelector<HTMLFormElement>('[data-calc-form]');
  const bruto = document.getElementById('dados-trilha')?.textContent;
  if (!form || !bruto) return;
  const dados = JSON.parse(bruto) as DadosTrilha & { rotulos: Record<string, string> };
  const st = armazem();
  document.querySelector<HTMLElement>('[data-calc-nojs]')?.setAttribute('hidden', '');

  const radios = [...form.querySelectorAll<HTMLInputElement>('[data-calc-situacao]')];
  const horasEl = form.querySelector<HTMLInputElement>('[data-calc-horas]')!;
  const blocosEl = [...form.querySelectorAll<HTMLInputElement>('[data-calc-bloco]')];

  // A URL vence; sem query, o perfil salvo; sem nada, o padrão.
  const q = new URLSearchParams(location.search);
  let salvo: string | null = null;
  try {
    salvo = st.getItem(CHAVE_PERFIL);
  } catch {
    salvo = null;
  }
  const inicial: Perfil = perfilDaURL(q.toString() ? q : new URLSearchParams(salvo ?? ''));

  function aplicar(p: Perfil): void {
    radios.forEach((r) => (r.checked = r.value === p.situacao));
    horasEl.value = String(p.horas);
    blocosEl.forEach((b) => (b.checked = p.blocos.includes(b.value)));
  }

  function ler(): Perfil {
    const situacao = (radios.find((r) => r.checked)?.value ?? 'estudante') as Situacao;
    return { situacao, horas: limitarHoras(horasEl.value), blocos: blocosEl.filter((b) => b.checked).map((b) => b.value) };
  }

  let marcasAtuais: Record<string, Marca> = {};

  function desenhar(): void {
    const p = ler();
    const marcas = classificar(dados.topicos, p.blocos);
    marcasAtuais = marcas;
    const est = estimar(dados.topicos, dados.niveis, marcas, p.horas);
    const t = total(est);
    document.querySelector('[data-calc-total]')!.textContent = faixaTexto(t.min, t.max);

    const conta = { pular: 0, revisar: 0, estudar: 0 };
    for (const m of Object.values(marcas)) conta[m]++;
    document.querySelector('[data-calc-resumo]')!.textContent =
      `${conta.estudar} tópicos para estudar, ${conta.revisar} para revisar e ${conta.pular} para pular, com ${p.horas} horas por semana. Os projetos de cada nível continuam na conta.`;

    // Níveis em sequência, com sobreposição de até 1 mês, como na linha do tempo da home.
    const soma = est.reduce((s, n) => s + n.meses, 0);
    let inicio = 0;
    let fimAnterior = 0;
    const escala = Math.max(soma, 1);
    for (const n of est) {
      inicio = Math.max(0, fimAnterior - Math.min(1, n.meses / 2));
      const barra = document.querySelector<HTMLElement>(`[data-calc-barra="${n.nivel}"]`);
      if (barra) {
        barra.style.left = `${(100 * inicio) / escala}%`;
        barra.style.width = `${Math.max(2, (100 * n.meses) / escala)}%`;
      }
      fimAnterior = inicio + n.meses;
      const txt = faixaTexto(n.min, n.max);
      const m = document.querySelector(`[data-calc-meses="${n.nivel}"]`);
      if (m) m.textContent = txt;
      const m2 = document.querySelector(`[data-calc-meses-texto="${n.nivel}"]`);
      if (m2) m2.textContent = txt;
    }

    const deps = dependentes(dados.topicos, marcas);
    document.querySelectorAll<HTMLElement>('[data-calc-item]').forEach((li) => {
      const id = li.dataset.calcItem!;
      const marca = marcas[id] ?? 'estudar';
      li.dataset.marca = marca;
      li.querySelector(`[data-calc-marca]`)!.textContent = ROTULO[marca];
      const aviso = li.querySelector<HTMLElement>('[data-calc-aviso]')!;
      const d = deps[id] ?? [];
      aviso.hidden = d.length === 0;
      if (d.length) {
        aviso.querySelector('span')!.textContent =
          `É base de ${d.length === 1 ? dados.rotulos[d[0]] : `${d.length} tópicos que você vai estudar`}. Pule só se usa no dia a dia.`;
      }
    });

    document.querySelectorAll<HTMLElement>('[data-calc-carreira]').forEach((el) => {
      el.hidden = el.dataset.calcCarreira !== p.situacao;
    });

    const qs = perfilParaURL(p);
    try {
      st.setItem(CHAVE_PERFIL, qs);
    } catch {
      /* sem armazenamento: vale só nesta página */
    }
    history.replaceState(null, '', `${location.pathname}?${qs}${location.hash}`);
  }

  aplicar(inicial);
  desenhar();

  radios.forEach((r) =>
    r.addEventListener('change', () => {
      if (!r.checked) return;
      const preset = PRESETS[r.value as Situacao];
      blocosEl.forEach((b) => (b.checked = preset.includes(b.value)));
      desenhar();
    }),
  );
  blocosEl.forEach((b) => b.addEventListener('change', desenhar));
  horasEl.addEventListener('input', desenhar);
  horasEl.addEventListener('change', () => {
    horasEl.value = String(limitarHoras(horasEl.value));
    desenhar();
  });

  const feedback = document.querySelector<HTMLElement>('[data-calc-feedback]')!;
  document.querySelector('[data-calc-marcar-concluidos]')?.addEventListener('click', () => {
    const ids = Object.entries(marcasAtuais)
      .filter(([, m]) => m === 'pular')
      .map(([id]) => `topico:${id}`);
    marcarVarios(st, ids);
    feedback.textContent = ids.length ? `${ids.length} tópicos marcados como concluídos.` : 'Nenhum tópico para pular ainda.';
  });
  document.querySelector('[data-calc-link]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      feedback.textContent = 'Link copiado.';
    } catch {
      feedback.textContent = 'Não deu para copiar. Copie o endereço da barra do navegador.';
    }
  });
}

iniciar();
