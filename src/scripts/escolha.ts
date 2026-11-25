import { PRESETS, type Situacao } from '../data/blocos';
import { CHAVE_PERFIL, lerPerfilSalvo, limitarHoras, perfilParaURL, type Perfil } from '../lib/trilha';

/** Escolha rápida da home: grava o perfil a cada mudança e avisa o resto da página. */
function iniciar(): void {
  const form = document.querySelector<HTMLFormElement>('[data-escolha-form]');
  if (!form) return;
  const sits = [...form.querySelectorAll<HTMLInputElement>('[data-escolha-situacao]')];
  const niveis = [...form.querySelectorAll<HTMLInputElement>('[data-escolha-nivel]')];
  const horas = form.querySelector<HTMLInputElement>('[data-escolha-horas]')!;
  const alterar = document.querySelector<HTMLButtonElement>('[data-escolha-alterar]');

  const ler = (): Perfil | null => {
    try {
      return lerPerfilSalvo(localStorage);
    } catch {
      return null;
    }
  };

  function preencher(p: Perfil | null): void {
    sits.forEach((r) => (r.checked = !!p && r.value === p.situacao));
    niveis.forEach((r) => (r.checked = r.value === String(p?.nivel ?? 1)));
    horas.value = String(p?.horas ?? 12);
    // Com perfil, o formulário fica recolhido atrás do botão "Alterar".
    mostrarForm(!p);
  }

  function mostrarForm(aberto: boolean): void {
    form!.hidden = !aberto;
    if (!alterar) return;
    alterar.setAttribute('aria-expanded', String(aberto));
    const rot = alterar.querySelector('[data-rotulo]');
    if (rot) rot.textContent = aberto ? 'Concluir' : 'Alterar';
  }

  function salvar(): void {
    const sit = sits.find((r) => r.checked)?.value as Situacao | undefined;
    const antes = ler();
    const situacao: Situacao = sit ?? antes?.situacao ?? 'estudante';
    const blocos = antes && antes.situacao === situacao ? antes.blocos : [...PRESETS[situacao]];
    const nivel = Number(niveis.find((r) => r.checked)?.value ?? 1);
    const p: Perfil = { situacao, horas: limitarHoras(horas.value), blocos, nivel };
    if (!sit) sits.forEach((r) => (r.checked = r.value === situacao));
    try {
      localStorage.setItem(CHAVE_PERFIL, perfilParaURL(p));
    } catch {
      /* sem armazenamento: não há como lembrar */
    }
    document.dispatchEvent(new CustomEvent('perfil:mudou'));
    mostrarForm(true);
  }

  preencher(ler());
  sits.forEach((r) => r.addEventListener('change', salvar));
  niveis.forEach((r) => r.addEventListener('change', salvar));
  horas.addEventListener('change', () => {
    horas.value = String(limitarHoras(horas.value));
    salvar();
  });
  alterar?.addEventListener('click', () => mostrarForm(!!form.hidden));
  document.querySelector('[data-escolha-padrao]')?.addEventListener('click', () => {
    try {
      localStorage.removeItem(CHAVE_PERFIL);
    } catch {
      /* nada a apagar */
    }
    preencher(null);
    document.dispatchEvent(new CustomEvent('perfil:mudou'));
    document.getElementById('escolha')?.scrollIntoView({ block: 'start' });
  });
}

iniciar();
