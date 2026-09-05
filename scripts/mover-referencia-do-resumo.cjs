/**
 * Antes de remover o campo Descricao (Resumo): extrai o trecho
 * "(Publicado ...)" que a autora colocava no fim do resumo e grava em
 * Referencia, quando Referencia estiver vazia. Idempotente.
 * Rodar com o servidor de desenvolvimento PARADO.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const q = app.db.query('api::pagina.pagina');
    const paginas = await q.findMany({ limit: 1000 });
    for (const p of paginas) {
      const m = (p.Descricao || '').match(/\(\s*(Publicad[oa][^)]*)\)\s*\.?\s*$/i);
      if (!m) { console.log(`  #${p.id} sem referência no resumo`); continue; }
      if (p.Referencia) { console.log(`  #${p.id} já tem Referencia, mantido`); continue; }
      const ref = m[1].trim().replace(/\s+/g, ' ');
      await q.update({ where: { id: p.id }, data: { Referencia: ref } });
      console.log(`  #${p.id} -> Referencia: "${ref.slice(0, 90)}"`);
    }
  } finally {
    await app.destroy();
  }
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
