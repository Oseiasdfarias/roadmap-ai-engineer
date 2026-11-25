// Tela cheia dos fluxogramas. Usa a Fullscreen API; onde ela não existe para elementos
// (Safari no iPhone), a figura vira uma camada fixa sobre a página. Esc fecha nos dois casos.

import { t } from '../i18n/cliente';

const ROTULO_ABRIR = t('Ver o diagrama em tela cheia', 'View the diagram full screen');
const ROTULO_SAIR = t('Sair da tela cheia', 'Exit full screen');

function marcar(fig: HTMLElement, aberta: boolean): void {
  const botao = fig.querySelector<HTMLButtonElement>('[data-fluxo-cheia]');
  if (!botao) return;
  botao.setAttribute('aria-pressed', String(aberta));
  botao.setAttribute('aria-label', aberta ? ROTULO_SAIR : ROTULO_ABRIR);
  const rot = botao.querySelector('.fluxo-cheia-rot');
  if (rot) rot.textContent = aberta ? t('Sair', 'Exit') : t('Tela cheia', 'Full screen');
}

function camada(fig: HTMLElement, aberta: boolean): void {
  fig.classList.toggle('fluxo-aberta', aberta);
  document.documentElement.classList.toggle('fluxo-travado', aberta);
  marcar(fig, aberta);
}

function abrir(fig: HTMLElement): void {
  if (document.fullscreenEnabled && fig.requestFullscreen) {
    fig.requestFullscreen().catch(() => camada(fig, true));
  } else {
    camada(fig, true);
  }
}

document.addEventListener('click', (e) => {
  const botao = (e.target as Element | null)?.closest<HTMLButtonElement>('[data-fluxo-cheia]');
  const fig = botao?.closest<HTMLElement>('figure.fluxo');
  if (!botao || !fig) return;
  if (document.fullscreenElement === fig) void document.exitFullscreen();
  else if (fig.classList.contains('fluxo-aberta')) camada(fig, false);
  else abrir(fig);
});

document.addEventListener('fullscreenchange', () => {
  document.querySelectorAll<HTMLElement>('figure.fluxo').forEach((f) => marcar(f, document.fullscreenElement === f));
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll<HTMLElement>('figure.fluxo-aberta').forEach((f) => {
    camada(f, false);
    f.querySelector<HTMLButtonElement>('[data-fluxo-cheia]')?.focus();
  });
});
