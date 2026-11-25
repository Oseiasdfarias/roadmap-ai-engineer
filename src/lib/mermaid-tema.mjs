// Fluxogramas: os blocos ```mermaid viram SVG no build (rehype-mermaid) e o CSS do site
// (src/styles/fluxo.css) repinta tudo com os tokens, inclusive no tema escuro.
// As cores abaixo são só a base que o Mermaid usa para medir e desenhar.
export const MERMAID = {
  theme: 'base',
  fontFamily: 'Inter, system-ui, sans-serif',
  themeVariables: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    primaryColor: '#FFFFFF',
    primaryBorderColor: '#DEDEDE',
    primaryTextColor: '#171717',
    lineColor: '#8A8A8A',
    secondaryColor: '#FAFAFA',
    tertiaryColor: '#FAFAFA',
    clusterBkg: '#FAFAFA',
    clusterBorder: '#EBEBEB',
    edgeLabelBackground: '#FFFFFF',
  },
  flowchart: { curve: 'basis', padding: 14, nodeSpacing: 32, rankSpacing: 56, htmlLabels: false, useMaxWidth: true },
  sequence: { useMaxWidth: true, mirrorActors: false, width: 120, actorMargin: 28, boxMargin: 8, messageFontSize: 14, actorFontSize: 14, noteFontSize: 13 },
};

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });

/** Botão de tela cheia; o comportamento está em src/scripts/fluxo.ts. */
function botaoTelaCheia(en) {
  const icone = (classe, d) =>
    el('svg', { className: ['fluxo-ico', classe], viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ariaHidden: 'true' },
      d.map((x) => el('path', { d: x })));
  return el('button', { type: 'button', className: ['fluxo-cheia'], dataFluxoCheia: '', ariaLabel: en ? 'View the diagram full screen' : 'Ver o diagrama em tela cheia', ariaPressed: 'false' }, [
    icone('abrir', ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7']),
    icone('fechar', ['M4 14h6v6', 'M20 10h-6V4', 'M14 10l7-7', 'M3 21l7-7']),
    el('span', { className: ['fluxo-cheia-rot'] }, [{ type: 'text', value: en ? 'Full screen' : 'Tela cheia' }]),
  ]);
}

/**
 * Envolve cada SVG do Mermaid numa <figure class="fluxo">, com a legenda tirada do accTitle.
 * Roda depois do rehype-mermaid.
 */
/** `versao` não é usada aqui: só serve para invalidar o cache de conteúdo do Astro. */
export function rehypeFluxo(_opcoes = {}) {
  let en = false;
  const ehMermaid = (n) => n?.type === 'element' && n.tagName === 'svg' && String(n.properties?.id ?? '').startsWith('mermaid-');
  const texto = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(texto).join(''));
  const percorrer = (pai) => {
    if (!pai.children) return;
    pai.children = pai.children.map((filho) => {
      if (!ehMermaid(filho)) {
        percorrer(filho);
        return filho;
      }
      const titulo = filho.children.find((c) => c.type === 'element' && c.tagName === 'title');
      const legenda = titulo ? texto(titulo).trim() : '';
      const chave = Object.keys(filho.properties).find((k) => k.toLowerCase().replace('-', '').includes('roledescription'));
      const tipo = String(chave ? filho.properties[chave] : '');
      const rotulo = tipo.startsWith('sequence') ? (en ? 'Sequence' : 'Sequência') : en ? 'Flow' : 'Fluxo';
      return {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['fluxo'] },
        children: [
          { type: 'element', tagName: 'div', properties: { className: ['fluxo-tela'] }, children: [filho] },
          {
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: [
              { type: 'element', tagName: 'span', properties: { className: ['fluxo-tipo'] }, children: [{ type: 'text', value: rotulo }] },
              { type: 'element', tagName: 'span', properties: { className: ['fluxo-legenda'] }, children: [{ type: 'text', value: legenda }] },
              botaoTelaCheia(en),
            ],
          },
        ],
      };
    });
  };
  return (arvore, arquivo) => {
    // O conteúdo em inglês fica em src/content/en/.
    en = String(arquivo?.path ?? arquivo?.history?.[0] ?? '').includes('/content/en/');
    percorrer(arvore);
  };
}
