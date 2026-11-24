// Altura real do cabeçalho em --header-h (todas as páginas): usada pelo scroll-padding-top e pela abertura da home.
const barra = document.querySelector<HTMLElement>('header.bar');
if (barra) {
  const medir = () => document.documentElement.style.setProperty('--header-h', `${Math.round(barra.getBoundingClientRect().height)}px`);
  medir();
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(barra);
}
