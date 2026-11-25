import { CHAVE_PROGRESSO, ler, type Estado } from '../lib/progresso';
import { CHAVE_PERFIL, lerPerfilSalvo } from '../lib/trilha';

/** Nível de partida do perfil salvo (1 sem perfil). */
function nivelDoPerfil(): number {
  try {
    return lerPerfilSalvo(localStorage)?.nivel ?? 1;
  } catch {
    return 1;
  }
}

function estadoAtual(): Estado {
  try {
    return ler(localStorage);
  } catch {
    return {};
  }
}

const lista = (el: HTMLElement | undefined, atributo: string) =>
  (el?.getAttribute(atributo) ?? '').split(',').filter(Boolean);

/** Nível "atual": o primeiro cujo conjunto de tópicos ainda não está 100% marcado (o último, se todos estiverem). */
function nivelAtual(estado: Estado): string {
  const paineis = [...document.querySelectorAll<HTMLElement>('[data-nivel-painel]')];
  const inicio = nivelDoPerfil();
  const achado = paineis.find((p) => {
    if (Number(p.dataset.nivelPainel) < inicio) return false;
    const ids = lista(p, 'data-nivel-ids');
    return ids.some((i) => !estado[i]);
  });
  return (achado ?? paineis[paineis.length - 1])?.dataset.nivelPainel ?? '1';
}

function atualizar(): void {
  const estado = estadoAtual();

  let atual = nivelAtual(estado);
  // Não esconde o painel onde o foco está (o usuário acabou de marcar um tópico): a troca vale no próximo carregamento.
  const visivel = [...document.querySelectorAll<HTMLElement>('[data-nivel-painel]')].find((p) => !p.hidden);
  if (visivel && visivel.contains(document.activeElement) && visivel.dataset.nivelPainel !== atual) atual = visivel.dataset.nivelPainel!;
  document.querySelectorAll<HTMLElement>('[data-nivel-painel]').forEach((p) => {
    p.hidden = p.dataset.nivelPainel !== atual;
  });
  document.querySelectorAll<HTMLElement>('[data-nivel-card]').forEach((c) => {
    c.hidden = c.dataset.nivelCard === atual;
  });

  // Estações: a mais avançada com algum progresso fica cheia e a linha acompanha até ela.
  const estacoes = [...document.querySelectorAll<HTMLElement>('[data-estacao]')];
  let ultima = 0;
  const partidaEst = nivelDoPerfil();
  estacoes.forEach((e, i) => {
    if (lista(e, 'data-ids').some((id) => estado[id])) ultima = i;
    // O nível de partida do perfil conta como alcançado.
    const nv = Number(e.querySelector<HTMLElement>('[data-periodo-nome]')?.dataset.periodoNome ?? 0);
    if (nv && nv <= partidaEst && i > ultima) ultima = i;
  });
  estacoes.forEach((e, i) => {
    e.classList.toggle('atual', i <= ultima);
    e.classList.toggle('proxima', i === ultima + 1);
  });
  // Rota da abertura: nível cheio quando completo; o traço de acento vai até o primeiro nível incompleto.
  const nos = [...document.querySelectorAll<HTMLElement>('[data-rota-nivel]')];
  let primeiroIncompleto = -1;
  const partida = nivelDoPerfil();
  nos.forEach((no, i) => {
    const ids = lista(no, 'data-ids');
    // Níveis antes do de partida contam como completos.
    const completo = i + 1 < partida || (ids.length > 0 && ids.every((id) => estado[id]));
    no.classList.toggle('completo', completo);
    if (!completo && primeiroIncompleto < 0) primeiroIncompleto = i;
  });
  nos.forEach((no, i) => no.classList.toggle('atual', i === primeiroIncompleto));
  const rota = document.querySelector<HTMLElement>('[data-rota]');
  // Pontos: Python, um por nível e o agente; o passo entre eles é 1/(níveis + 1).
  const passos = nos.length + 1;
  if (rota) rota.style.setProperty('--rp', String((primeiroIncompleto < 0 ? passos : primeiroIncompleto + 1) / passos));
  const trilha = document.querySelector<HTMLElement>('.estacoes');
  if (trilha && estacoes.length > 1) trilha.style.setProperty('--p', String(ultima / (estacoes.length - 1)));
}

atualizar();
document.addEventListener('progresso:atualizado', atualizar);
document.addEventListener('perfil:mudou', atualizar);
window.addEventListener('storage', (e) => {
  if (e.key === CHAVE_PROGRESSO || e.key === CHAVE_PERFIL || e.key === null) atualizar();
});

// Entrada suave das seções ao rolar; desligada com prefers-reduced-motion.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const alvos = document.querySelectorAll<HTMLElement>('.rv');
  const io = new IntersectionObserver(
    (entradas) => {
      for (const en of entradas) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('rv-ok');
        io.unobserve(en.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  document.documentElement.classList.add('rv-on');
  alvos.forEach((a) => io.observe(a));
}
