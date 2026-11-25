import { faixaTexto, t as tr } from '../i18n/cliente';
import { PRESETS, type Situacao } from '../data/blocos';
import { marcarVarios } from '../lib/progresso';
import {
  CHAVE_PERFIL,
  classificar,
  dependentes,
  estimar,
  limitarHoras,
  perfilDaURL,
  perfilParaURL,
  posicoes,
  total,
  type Marca,
  type Perfil,
} from '../lib/trilha';
import type { DadosTrilha } from '../lib/dados-trilha';

const ROTULO: Record<Marca, string> = tr({ pular: 'Pular', revisar: 'Revisar', estudar: 'Estudar' }, { pular: 'Skip', revisar: 'Review', estudar: 'Study' });

function armazem(): Pick<Storage, 'getItem' | 'setItem'> {
  try {
    const s = localStorage;
    s.getItem(CHAVE_PERFIL);
    return s;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
}


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
  const niveisEl = [...form.querySelectorAll<HTMLInputElement>('[data-calc-nivel]')];

  // A URL vence; sem query, o perfil salvo; sem nada, o padrão.
  const q = new URLSearchParams(location.search);
  let salvo: string | null = null;
  try {
    salvo = st.getItem(CHAVE_PERFIL);
  } catch {
    salvo = null;
  }
  const inicial: Perfil = perfilDaURL(q.has('s') || q.has('h') || q.has('b') ? q : new URLSearchParams(salvo ?? ''));

  function aplicar(p: Perfil): void {
    radios.forEach((r) => (r.checked = r.value === p.situacao));
    horasEl.value = String(p.horas);
    blocosEl.forEach((b) => (b.checked = p.blocos.includes(b.value)));
    niveisEl.forEach((r) => (r.checked = r.value === String(p.nivel)));
  }

  function ler(): Perfil {
    const situacao = (radios.find((r) => r.checked)?.value ?? 'estudante') as Situacao;
    return {
      situacao,
      horas: limitarHoras(horasEl.value),
      blocos: blocosEl.filter((b) => b.checked).map((b) => b.value),
      nivel: Number(niveisEl.find((r) => r.checked)?.value ?? 1),
    };
  }

  let marcasAtuais: Record<string, Marca> = {};

  function desenhar(salvar = true): void {
    const p = ler();
    const marcas = classificar(dados.topicos, p.blocos, undefined, p.nivel);
    marcasAtuais = marcas;
    const est = estimar(dados.topicos, dados.niveis, marcas, p.horas, p.nivel);
    const t = total(est);
    document.querySelector('[data-calc-total]')!.textContent = faixaTexto(t.min, t.max);

    const conta = { pular: 0, revisar: 0, estudar: 0 };
    for (const m of Object.values(marcas)) conta[m]++;
    document.querySelector('[data-calc-resumo]')!.textContent =
      tr(
        `${conta.estudar} tópicos para estudar, ${conta.revisar} para revisar e ${conta.pular} para pular, com ${p.horas} horas por semana. Os projetos de cada nível continuam na conta.`,
        `${conta.estudar} topics to study, ${conta.revisar} to review and ${conta.pular} to skip, at ${p.horas} hours per week. Each level's projects still count.`,
      );

    // Níveis em sequência, com sobreposição de até 1 mês, como na linha do tempo da home.
    const pos = posicoes(est);
    const escala = Math.max(1, ...pos.map((x) => x.fim));
    for (const n of est) {
      const x = pos.find((q) => q.nivel === n.nivel)!;
      const barra = document.querySelector<HTMLElement>(`[data-calc-barra="${n.nivel}"]`);
      if (barra) {
        barra.hidden = n.meses === 0;
        barra.style.left = `${(100 * x.inicio) / escala}%`;
        barra.style.width = `${Math.max(2, (100 * n.meses) / escala)}%`;
      }
      const txt = n.meses === 0 ? tr('já domina', 'already mastered') : faixaTexto(n.min, n.max);
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
          tr(
            `É base de ${d.length === 1 ? dados.rotulos[d[0]] : `${d.length} tópicos que você vai estudar`}. Pule só se usa no dia a dia.`,
            `It is the base for ${d.length === 1 ? dados.rotulos[d[0]] : `${d.length} topics you will study`}. Skip it only if you use it every day.`,
          );
      }
    });

    document.querySelectorAll<HTMLElement>('[data-calc-carreira]').forEach((el) => {
      el.hidden = el.dataset.calcCarreira !== p.situacao;
    });

    const qs = perfilParaURL(p);
    // Só grava quando a pessoa mexe: abrir o link de outra pessoa não troca o perfil salvo.
    if (salvar) {
      try {
        st.setItem(CHAVE_PERFIL, qs);
      } catch {
        /* sem armazenamento: vale só nesta página */
      }
    }
    history.replaceState(null, '', `${location.pathname}?${qs}${location.hash}`);
  }

  aplicar(inicial);
  desenhar(false);

  radios.forEach((r) =>
    r.addEventListener('change', () => {
      if (!r.checked) return;
      const preset = PRESETS[r.value as Situacao];
      blocosEl.forEach((b) => (b.checked = preset.includes(b.value)));
      desenhar();
    }),
  );
  blocosEl.forEach((b) => b.addEventListener('change', () => desenhar()));
  niveisEl.forEach((r) => r.addEventListener('change', () => desenhar()));
  horasEl.addEventListener('input', () => desenhar());
  horasEl.addEventListener('change', () => {
    horasEl.value = String(limitarHoras(horasEl.value));
    desenhar();
  });

  const feedback = document.querySelector<HTMLElement>('[data-calc-feedback]')!;
  document.querySelector('[data-calc-padrao]')?.addEventListener('click', () => {
    try {
      localStorage.removeItem(CHAVE_PERFIL);
    } catch {
      /* sem armazenamento */
    }
    aplicar(perfilDaURL(new URLSearchParams('')));
    desenhar(false);
    history.replaceState(null, '', location.pathname);
    feedback.textContent = tr('Perfil apagado. O site voltou ao roteiro padrão.', 'Profile cleared. The site is back to the default path.');
  });
  document.querySelector('[data-calc-marcar-concluidos]')?.addEventListener('click', () => {
    const ids = Object.entries(marcasAtuais)
      .filter(([, m]) => m === 'pular')
      .map(([id]) => `topico:${id}`);
    marcarVarios(st, ids);
    document.dispatchEvent(new CustomEvent('progresso:recarregar'));
    feedback.textContent = ids.length
      ? tr(`${ids.length} ${ids.length === 1 ? 'tópico marcado' : 'tópicos marcados'} como concluído${ids.length === 1 ? '' : 's'}.`, `${ids.length} ${ids.length === 1 ? 'topic' : 'topics'} marked as done.`)
      : tr('Nenhum tópico para pular ainda.', 'No topics to skip yet.');
  });
  document.querySelector('[data-calc-link]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      feedback.textContent = tr('Link copiado.', 'Link copied.');
    } catch {
      feedback.textContent = tr('Não deu para copiar. Copie o endereço da barra do navegador.', 'Could not copy. Copy the address from the browser bar.');
    }
  });
}

iniciar();
