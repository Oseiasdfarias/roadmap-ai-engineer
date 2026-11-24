export const CHAVE_TEMA = 'rm-tema';
export type Tema = 'light' | 'dark';

function marcarBotoes(tema: Tema): void {
  document
    .querySelectorAll<HTMLButtonElement>('[data-alternar-tema]')
    .forEach((b) => b.setAttribute('aria-pressed', String(tema === 'dark')));
}

export function alternarTema(): Tema {
  const atual = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const novo: Tema = atual === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = novo;
  try {
    localStorage.setItem(CHAVE_TEMA, novo);
  } catch {
    /* armazenamento indisponível */
  }
  marcarBotoes(novo);
  return novo;
}

export function ligarBotaoTema(): void {
  marcarBotoes(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  document
    .querySelectorAll<HTMLButtonElement>('[data-alternar-tema]')
    .forEach((b) => b.addEventListener('click', alternarTema));
}
