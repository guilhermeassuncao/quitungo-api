/**
 * Reparo pontual (05/09/2026): a instância de produção, ainda com o schema
 * antigo, sincronizou o banco e recriou rascunhos e zerou as colunas novas
 * de Página. Este script:
 *   1. remove linhas de rascunho (published_at nulo) de páginas e categorias
 *   2. restaura Titulo e Descricao a partir do backup JSON, por documentId
 *   3. confere que capa, categoria e blocos continuam ligados
 * Idempotente. Rodar com o servidor de desenvolvimento PARADO.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const fs = require('fs');

const BACKUP = process.argv[2] || '/home/guilherme/Documentos/Github/quitungo-backups/quitungo-conteudo-2026-09-05.json';

(async () => {
  const backup = JSON.parse(fs.readFileSync(BACKUP, 'utf8'));
  const porDoc = new Map(backup.paginas_published.map((p) => [p.documentId, p]));
  console.log('backup: ' + porDoc.size + ' posts publicados');

  const app = await createStrapi(await compileStrapi()).load();
  try {
    const db = app.db;

    for (const uid of ['api::pagina.pagina', 'api::categoria.categoria', 'api::historia.historia']) {
      const drafts = await db.query(uid).findMany({ where: { publishedAt: null }, select: ['id'] });
      if (drafts.length) {
        await db.query(uid).deleteMany({ where: { publishedAt: null } });
        console.log(`${uid}: ${drafts.length} rascunhos removidos (ids ${drafts.map((d) => d.id).join(',')})`);
      } else console.log(`${uid}: sem rascunhos`);
    }

    const paginas = await db.query('api::pagina.pagina').findMany({ limit: 1000 });
    let ok = 0;
    for (const p of paginas) {
      const b = porDoc.get(p.documentId);
      if (!b) { console.log(`  #${p.id} ${p.documentId} NAO esta no backup`); continue; }
      await db.query('api::pagina.pagina').update({ where: { id: p.id }, data: { Titulo: b.Dados.Titulo, Descricao: b.Dados.Descricao } });
      ok++;
      console.log(`  #${p.id} -> "${b.Dados.Titulo.slice(0, 60)}"`);
    }
    console.log(`restaurados: ${ok} de ${paginas.length}`);

    const cheias = await db.query('api::pagina.pagina').findMany({ populate: ['Capa', 'Capa.Imagem', 'categorias', 'Conteudo'], limit: 1000 });
    for (const p of cheias) {
      const b = porDoc.get(p.documentId);
      console.log(`  #${p.id} titulo:${!!p.Titulo} capa:${!!p.Capa} capaImg:${!!p.Capa?.Imagem} cat:${p.categorias?.Nome || 'NENHUMA'} blocos:${p.Conteudo?.length}/${b ? b.Conteudo.length : '?'}`);
    }
  } finally {
    await app.destroy();
  }
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
