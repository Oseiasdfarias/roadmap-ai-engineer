/** Painel lateral: <dialog> modal (foco preso e Esc pelo navegador) com o conteúdo clonado de um <template>. */
export function ligarPainel(aoAbrir: () => void): void {
  const dialogo = document.getElementById('painel') as HTMLDialogElement | null;
  const corpo = dialogo?.querySelector<HTMLElement>('[data-painel-corpo]');
  if (!dialogo || !corpo) return;
  let gatilho: HTMLElement | null = null;

  function abrir(chave: string, origem: HTMLElement) {
    const modelo = [...document.querySelectorAll<HTMLTemplateElement>('template[data-painel-conteudo]')].find(
      (t) => t.dataset.painelConteudo === chave,
    );
    if (!modelo || !dialogo || !corpo) return;
    gatilho = origem;
    corpo.replaceChildren(modelo.content.cloneNode(true));
    aoAbrir();
    if (!dialogo.open) dialogo.showModal();
    dialogo.scrollTop = 0;
    corpo.querySelector<HTMLElement>('.mark, a.btn')?.focus();
  }

  document.addEventListener('click', (e) => {
    const alvo = e.target as Element;
    const botao = alvo.closest<HTMLElement>('[data-painel]');
    if (botao?.dataset.painel) {
      abrir(botao.dataset.painel, botao);
      return;
    }
    if (alvo.closest('[data-painel-fechar]')) dialogo.close();
  });

  // Clique no fundo escurecido (o alvo é o próprio <dialog>, pois o conteúdo fica num filho).
  dialogo.addEventListener('click', (e) => {
    if (e.target === dialogo) dialogo.close();
  });

  dialogo.addEventListener('close', () => {
    gatilho?.focus();
    gatilho = null;
  });
}
