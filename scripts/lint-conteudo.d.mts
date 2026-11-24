export const MODELOS: Record<string, { secoes: string[]; opcionais: string[]; palavras: [number, number] }>;
export const RESUMO: [number, number];
export function temEmoji(texto: string): boolean;
export function separarFrontmatter(texto: string): { dados: Record<string, any> | null; corpo: string };
export function coletarSlugs(raiz: string): Set<string>;
export function verificarTexto(
  texto: string,
  opcoes?: { tipo?: string | null; slugs?: Set<string>; rascunho?: boolean },
): string[];
export function tipoDoCaminho(caminho: string): string | null;
export function verificarArquivo(caminho: string, opcoes?: { rascunho?: boolean; slugs?: Set<string> }): string[];
export function verificarEmojiEmCodigo(raiz?: string): Array<[string, string[]]>;
export function verificarTudo(opcoes?: { rascunho?: boolean; raiz?: string }): Array<[string, string[]]>;
