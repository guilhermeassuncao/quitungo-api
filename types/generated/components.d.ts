import type { Schema, Struct } from '@strapi/strapi';

export interface PaginaAudio extends Struct.ComponentSchema {
  collectionName: 'components_pagina_audios';
  info: {
    description: '';
    displayName: '\u00C1udio';
  };
  attributes: {
    Audio: Schema.Attribute.Media<'audios'> & Schema.Attribute.Required;
    Autor: Schema.Attribute.String;
  };
}

export interface PaginaDocumento extends Struct.ComponentSchema {
  collectionName: 'components_pagina_documentos';
  info: {
    displayName: 'Documento';
  };
  attributes: {
    Documento: Schema.Attribute.Media<'files'> & Schema.Attribute.Required;
    Nome: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PaginaGaleria extends Struct.ComponentSchema {
  collectionName: 'components_pagina_galerias';
  info: {
    description: '';
    displayName: 'Galeria';
  };
  attributes: {
    Galeria: Schema.Attribute.Component<'pagina.imagem', true> &
      Schema.Attribute.Required;
  };
}

export interface PaginaImagem extends Struct.ComponentSchema {
  collectionName: 'components_pagina_imagems';
  info: {
    description: '';
    displayName: 'Imagem';
  };
  attributes: {
    Autor: Schema.Attribute.String;
    Imagem: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface PaginaMidiaComTexto extends Struct.ComponentSchema {
  collectionName: 'components_pagina_midia_com_textos';
  info: {
    displayName: 'M\u00EDdia com Texto';
  };
  attributes: {
    Imagem: Schema.Attribute.Component<'pagina.imagem', false> &
      Schema.Attribute.Required;
    Texto: Schema.Attribute.RichText &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'Custom';
        }
      >;
  };
}

export interface PaginaTexto extends Struct.ComponentSchema {
  collectionName: 'components_pagina_textos';
  info: {
    description: '';
    displayName: 'Texto';
  };
  attributes: {
    Texto: Schema.Attribute.RichText &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'Custom';
        }
      >;
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

export interface PaginaVideo extends Struct.ComponentSchema {
  collectionName: 'components_pagina_videos';
  info: {
    description: '';
    displayName: 'V\u00EDdeo';
  };
  attributes: {
    Autor: Schema.Attribute.String;
    Video: Schema.Attribute.Media<'videos'> & Schema.Attribute.Required;
  };
}

export interface PaginaYoutube extends Struct.ComponentSchema {
  collectionName: 'components_pagina_youtubes';
  info: {
    displayName: 'Youtube';
  };
  attributes: {
    Url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'pagina.audio': PaginaAudio;
      'pagina.documento': PaginaDocumento;
      'pagina.galeria': PaginaGaleria;
      'pagina.imagem': PaginaImagem;
      'pagina.midia-com-texto': PaginaMidiaComTexto;
      'pagina.texto': PaginaTexto;
      'pagina.titulo': PaginaTitulo;
      'pagina.video': PaginaVideo;
      'pagina.youtube': PaginaYoutube;
    }
  }
}
