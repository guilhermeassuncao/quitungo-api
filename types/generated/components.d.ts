import type { Schema, Struct } from '@strapi/strapi';

export interface PaginaBlocoDeTexto extends Struct.ComponentSchema {
  collectionName: 'components_pagina_bloco_de_textos';
  info: {
    description: '';
    displayName: 'Bloco de Texto';
  };
  attributes: {
    Texto: Schema.Attribute.Blocks;
  };
}

export interface PaginaTitulo extends Struct.ComponentSchema {
  collectionName: 'components_pagina_titulos';
  info: {
    displayName: 'T\u00EDtulo';
  };
  attributes: {
    Nome: Schema.Attribute.String & Schema.Attribute.Required;
    Tamanho: Schema.Attribute.Enumeration<['h1', 'h2', 'h3', 'h4']> &
      Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'pagina.bloco-de-texto': PaginaBlocoDeTexto;
      'pagina.titulo': PaginaTitulo;
    }
  }
}
