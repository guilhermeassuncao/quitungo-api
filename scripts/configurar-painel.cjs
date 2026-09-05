/**
 * Configura o painel (Content Manager) em português, com rótulos claros,
 * textos de ajuda em cada campo, ordem dos campos e colunas da listagem.
 * Equivale a clicar em "Configurar a visualização" em cada tipo, mas
 * reproduzível. Idempotente: pode rodar quantas vezes quiser.
 *
 *   node scripts/configurar-painel.cjs
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');

// { campo: [rótulo, ajuda, placeholder?] }
const CAMPOS = {
  'api::pagina.pagina': {
    settings: { mainField: 'Titulo', defaultSortBy: 'updatedAt', defaultSortOrder: 'DESC', pageSize: 25 },
    list: ['Titulo', 'categorias', 'Autoria', 'updatedAt'],
    edit: [
      [['Titulo', 12]],
      [['Descricao', 12]],
      [['Autoria', 6], ['Ano', 6]],
      [['Referencia', 12]],
      [['categorias', 6]],
      [['Capa', 12]],
      [['Conteudo', 12]],
    ],
    fields: {
      Titulo: ['Título', 'Título completo da obra. Aparece no cartão da listagem e no topo da página do post.'],
      Descricao: ['Resumo', 'Uma ou duas frases, até 300 caracteres. Aparece no cartão da listagem e abaixo do título na página. O texto completo vai em Conteúdo, no bloco Texto.'],
      Autoria: ['Autoria', 'Quem escreveu ou produziu a obra. Ex.: Simone Raquel Batista Ferreira.'],
      Ano: ['Ano', 'Ano da publicação ou produção. Ex.: 2018.'],
      Referencia: ['Referência bibliográfica', 'Onde foi publicado. Ex.: Revista Geografares, n. 8, 2010. Aparece no fim da página do post.'],
      categorias: ['Categoria', 'Seção do site onde o post aparece. Obrigatória: sem categoria o post não aparece em lugar nenhum.'],
      Capa: ['Imagem de capa', 'Foto que ilustra o post no cartão da listagem. Envie a imagem E preencha o crédito.'],
      Conteudo: ['Conteúdo', 'Blocos que formam a página do post, na ordem em que aparecem. Título, resumo e autoria já aparecem automaticamente, não precisa repetir aqui.'],
    },
  },
  'api::historia.historia': {
    fields: {
      Conteudo: ['Conteúdo', 'Blocos da página Quem Somos, na ordem em que aparecem. O título da página já é automático.'],
    },
  },
  'api::amigo.amigo': {
    fields: {
      Conteudo: ['Conteúdo', 'Blocos da página Amigos e Parceiros, na ordem em que aparecem. O título da página já é automático.'],
    },
  },
  'api::categoria.categoria': {
    settings: { mainField: 'Nome' },
    list: ['Nome', 'Descricao', 'Rota'],
    fields: {
      Nome: ['Nome', 'Nome da seção como aparece no menu do site.'],
      Descricao: ['Descrição', 'Frase curta exibida abaixo do nome na página da seção.'],
      Rota: ['Endereço (URL)', 'Gerado automaticamente a partir do nome. Só mude se souber o que está fazendo, pois altera o link da seção.'],
    },
  },
};

const COMPONENTES = {
  'pagina.imagem': {
    Imagem: ['Imagem', 'Obrigatória. Formatos JPG ou PNG.'],
    Autor: ['Crédito da foto', 'Quem fotografou. Aparece como legenda.'],
  },
  'pagina.documento': {
    Documento: ['Arquivo (PDF)', 'Arquivo que o leitor vai baixar.'],
    Nome: ['Nome exibido', 'Opcional. Se ficar vazio, o site usa o título do post.'],
    Autor: ['Autor do documento', 'Opcional. Preencha só se for diferente da autoria do post.'],
  },
  'pagina.audio': {
    Audio: ['Áudio', 'Arquivo MP3.'],
    Autor: ['Crédito', 'Quem gravou ou produziu o áudio.'],
  },
  'pagina.video': {
    Video: ['Vídeo', 'Arquivo de vídeo enviado. Para vídeos do YouTube use o bloco YouTube, que não consome espaço.'],
  },
  'pagina.youtube': {
    Url: ['Link do vídeo', 'Cole o link do YouTube como estiver: youtube.com/watch?v=..., youtu.be/... ou shorts.', 'https://www.youtube.com/watch?v=...'],
  },
  'pagina.titulo': {
    Nome: ['Texto do título', 'Título de uma seção dentro do post. O título principal do post já aparece automaticamente.'],
    Tamanho: ['Nível', 'h2 para seção, h3 para subseção. Evite h1, que é o título do post.'],
  },
  'pagina.texto': {
    Texto: ['Texto', 'Texto corrido com formatação. Cole do Word sem medo, a formatação é limpa automaticamente.'],
  },
  'pagina.midia': {
    Imagem: ['Imagem', 'Fica ao lado do texto.'],
    Texto: ['Texto', 'Fica ao lado da imagem.'],
  },
  'pagina.galeria': {
    Galeria: ['Fotos', 'Clique em "Adicionar" para cada foto e preencha o crédito de cada uma.'],
  },
};

function aplicarCampos(conf, fields) {
  for (const [campo, [label, description, placeholder]] of Object.entries(fields)) {
    if (!conf.metadatas[campo]) continue;
    conf.metadatas[campo].edit = { ...conf.metadatas[campo].edit, label, description, ...(placeholder ? { placeholder } : {}) };
    if (conf.metadatas[campo].list) conf.metadatas[campo].list = { ...conf.metadatas[campo].list, label };
  }
}

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const svcCT = app.plugin('content-manager').service('content-types');
    const svcComp = app.plugin('content-manager').service('components');

    for (const [uid, def] of Object.entries(CAMPOS)) {
      const ct = app.contentType(uid);
      const conf = await svcCT.findConfiguration(ct);
      aplicarCampos(conf, def.fields);
      if (def.settings) conf.settings = { ...conf.settings, ...def.settings };
      if (def.list) conf.layouts.list = def.list;
      if (def.edit) conf.layouts.edit = def.edit.map((linha) => linha.map(([name, size]) => ({ name, size })));
      await svcCT.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
      console.log('ok', uid);
    }
    for (const [uid, fields] of Object.entries(COMPONENTES)) {
      const comp = app.components[uid];
      const conf = await svcComp.findConfiguration(comp);
      aplicarCampos(conf, fields);
      await svcComp.updateConfiguration(comp, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
      console.log('ok', uid);
    }
  } finally {
    await app.destroy();
  }
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
