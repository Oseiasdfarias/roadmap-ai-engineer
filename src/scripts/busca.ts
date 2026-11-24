type ResultadoPf = { url: string; meta: { title?: string }; excerpt: string };
type Pagefind = {
  debouncedSearch: (q: string, opcoes?: object, ms?: number) => Promise<{ results: Array<{ data: () => Promise<ResultadoPf> }> } | null>;
};

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled])';

/** Modal de busca: carrega o Pagefind só na primeira abertura. */
export function ligarBusca(): void {
  const dialogo = document.getElementById('busca') as HTMLDialogElement | null;
  if (!dialogo) return;
  const campo = dialogo.querySelector<HTMLInputElement>('input')!;
  const estado = dialogo.querySelector<HTMLElement>('[data-busca-estado]')!;
  const lista = dialogo.querySelector<HTMLElement>('[data-busca-lista]')!;
  const caminho = dialogo.dataset.pagefindJs!;
  let pagefind: Pagefind | undefined;
  let gatilho: HTMLElement | null = null;

  async function carregar(): Promise<Pagefind | undefined> {
    if (pagefind) return pagefind;
    try {
      pagefind = (await import(/* @vite-ignore */ caminho)) as Pagefind;
    } catch {
      estado.textContent = 'A busca fica disponível no site publicado (rode npm run build).';
    }
    return pagefind;
  }

  function abrir(origem: HTMLElement | null) {
    gatilho = origem;
    if (!dialogo!.open) dialogo!.showModal();
    campo.focus();
    campo.select();
    void carregar();
  }

  async function buscar() {
    const termo = campo.value.trim();
    lista.replaceChildren();
    if (!termo) {
      estado.textContent = 'Digite para buscar. Atalhos: / ou Ctrl+K.';
      return;
    }
    const pf = await carregar();
    if (!pf) return;
    const resposta = await pf.debouncedSearch(termo, {}, 150);
    if (resposta === null || campo.value.trim() !== termo) return; // chegou uma busca mais nova
    const dados = await Promise.all(resposta.results.slice(0, 8).map((r) => r.data()));
    estado.textContent = dados.length ? `${resposta.results.length} resultado(s)` : 'Nenhum resultado para essa busca.';
    for (const d of dados) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = d.url;
      const t = document.createElement('strong');
      t.textContent = d.meta.title ?? d.url;
      const ex = document.createElement('span');
      // O Pagefind devolve o trecho com <mark> e escapa o resto do HTML.
      ex.innerHTML = d.excerpt;
      a.append(t, ex);
      li.append(a);
      lista.append(li);
    }
  }

  document.addEventListener('click', (e) => {
    const botao = (e.target as Element).closest<HTMLElement>('[data-abrir-busca]');
    if (botao) abrir(botao);
    else if ((e.target as Element).closest('[data-busca-fechar]')) dialogo.close();
  });
  dialogo.addEventListener('click', (e) => {
    if (e.target === dialogo) dialogo.close();
  });
  dialogo.addEventListener('close', () => {
    gatilho?.focus();
    gatilho = null;
  });

  document.addEventListener('keydown', (e) => {
    const alvo = e.target as HTMLElement;
    const digitando = alvo.closest('input, textarea, select, [contenteditable="true"]') !== null;
    const atalho = (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !digitando) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k');
    if (atalho && !dialogo.open && !document.querySelector('dialog[open]')) {
      e.preventDefault();
      abrir(document.activeElement as HTMLElement | null);
    }
  });

  // Foco preso: o <dialog> modal já isola o resto da página; o Tab circula só entre os focáveis do modal.
  dialogo.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const itens = [...dialogo.querySelectorAll<HTMLElement>(FOCAVEIS)];
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  });

  campo.addEventListener('input', () => void buscar());
}
