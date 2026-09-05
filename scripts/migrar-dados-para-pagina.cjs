/**
 * Copia Dados.Titulo e Dados.Descricao (componente antigo) para os campos
 * Titulo e Descricao diretamente na Página. Idempotente: só preenche o que
 * estiver vazio. Rodar UMA vez, antes de remover o componente Dados do schema.
 *
 *   node scripts/migrar-dados-para-pagina.cjs
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const paginas = await app.db.query('api::pagina.pagina').findMany({
      populate: ['Dados'],
      limit: 1000,
    });
    let copiados = 0, jaTinham = 0, semDados = 0;
    for (const p of paginas) {
      if (p.Titulo && p.Descricao) { jaTinham++; continue; }
      if (!p.Dados) { semDados++; console.log(`  #${p.id} sem Dados e sem Titulo, verificar manualmente`); continue; }
      await app.db.query('api::pagina.pagina').update({
        where: { id: p.id },
        data: {
          Titulo: p.Titulo || p.Dados.Titulo,
          Descricao: p.Descricao || p.Dados.Descricao,
        },
      });
      copiados++;
      console.log(`  #${p.id} -> "${p.Dados.Titulo}"`);
    }
    console.log(`total: ${paginas.length} | copiados: ${copiados} | já preenchidos: ${jaTinham} | sem dados: ${semDados}`);
    const faltando = await app.db.query('api::pagina.pagina').count({ where: { $or: [{ Titulo: null }, { Titulo: '' }] } });
    console.log(`páginas ainda sem Titulo: ${faltando}`);
  } finally {
    await app.destroy();
  }
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
