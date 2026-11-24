import { alternar, contar, ler, type Estado } from '../lib/progresso';

let estado: Estado = {};

function armazem(): Pick<Storage, 'getItem' | 'setItem'> {
  try {
    return localStorage;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
}

function idsTodos(): string[] {
  try {
    const el = document.querySelector('script[data-progresso-todos]');
    const lista: unknown = JSON.parse(el?.textContent ?? '[]');
    return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function preencher(el: Element, feitos: number, total: number, pct: number, formato: 'barra' | 'global' | 'de') {
  const barra = el.querySelector<HTMLElement>('[data-progresso-barra]');
  if (barra) barra.style.width = `${pct}%`;
  const texto = el.querySelector('[data-progresso-texto]') ?? el;
  texto.textContent =
    formato === 'global' ? `${feitos} / ${total}` : formato === 'de' ? `${feitos} de ${total}` : `${feitos} / ${total}`;
  el.querySelector('[role="progressbar"]')?.setAttribute('aria-valuenow', String(pct));
}

export function atualizar(): void {
  document.querySelectorAll<HTMLElement>('[data-progresso-id]').forEach((el) => {
    const feito = !!estado[el.dataset.progressoId ?? ''];
    el.classList.toggle('feito', feito);
    if (el.hasAttribute('data-alternar')) el.setAttribute('aria-pressed', String(feito));
  });
  document.querySelectorAll<HTMLElement>('[data-progresso-conta]').forEach((el) => {
    const ids = (el.dataset.progressoConta ?? '').split(',').filter(Boolean);
    const { feitos, total, pct } = contar(estado, ids);
    preencher(el, feitos, total, pct, el.dataset.progressoFormato === 'de' ? 'de' : 'barra');
  });
  const global = document.querySelector('[data-progresso-global]');
  if (global) {
    const { feitos, total, pct } = contar(estado, idsTodos());
    preencher(global, feitos, total, pct, 'global');
  }
  document.dispatchEvent(new CustomEvent('progresso:atualizado'));
}

estado = ler(armazem());
document.addEventListener('click', (e) => {
  const botao = (e.target as Element).closest<HTMLElement>('[data-alternar]');
  if (!botao?.dataset.alternar) return;
  const id = botao.dataset.alternar;
  if (alternar(armazem(), id, estado)) estado[id] = true;
  else delete estado[id];
  atualizar();
});
window.addEventListener('storage', () => {
  estado = ler(armazem());
  atualizar();
});
atualizar();
