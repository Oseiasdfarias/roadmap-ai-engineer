import type { APIRoute, GetStaticPaths } from 'astro';
import { dadosOg, renderizarOg } from '../../lib/og';

export const getStaticPaths = (async () => {
  const todos = await dadosOg();
  return todos.map((d) => ({ params: { rota: d.rota }, props: { dados: d } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderizarOg(props.dados);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
