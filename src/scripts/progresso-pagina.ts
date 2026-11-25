/** Página de progresso: aponta o próximo tópico a estudar (em ordem, sem os que o perfil manda pular). */
function proximo(): void {
  const caixa = document.querySelector<HTMLElement>('[data-mapa-proximo]');
  const link = caixa?.querySelector<HTMLAnchorElement>('a');
  if (!caixa || !link) return;
  const alvo = [...document.querySelectorAll<HTMLAnchorElement>('.mapa-q[data-tipo="topico"]')].find(
    (q) => !q.classList.contains('feito') && q.dataset.marca !== 'pular',
  );
  caixa.hidden = !alvo;
  if (alvo) {
    link.setAttribute('href', alvo.getAttribute('href') ?? '');
    link.textContent = alvo.dataset.titulo ?? '';
  }
}

// Roda depois dos outros scripts (progresso e perfil já aplicados).
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', proximo);
else setTimeout(proximo, 0);
document.addEventListener('progresso:atualizado', proximo);
document.addEventListener('perfil:mudou', () => queueMicrotask(proximo));
