import { classificar, perfilDaURL, type Marca } from '../lib/trilha';

const CHAVE_PERFIL = 'rm-perfil-v1';
const CURTO: Record<Marca, string> = { pular: 'pular', revisar: 'revisar', estudar: '' };
const LONGO: Record<Marca, string> = {
  pular: 'Pelo seu perfil, você pode pular este tópico.',
  revisar: 'Pelo seu perfil, basta uma revisão rápida.',
  estudar: '',
};

/** Mostra pular/revisar nos tópicos quando a pessoa já usou a calculadora. */
function iniciar(): void {
  const els = [...document.querySelectorAll<HTMLElement>('[data-etiqueta-topico]')];
  if (!els.length) return;
  let salvo: string | null = null;
  try {
    salvo = localStorage.getItem(CHAVE_PERFIL);
  } catch {
    return;
  }
  if (!salvo) return;
  const perfil = perfilDaURL(new URLSearchParams(salvo));
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

iniciar();
