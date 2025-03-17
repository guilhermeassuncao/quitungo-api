import type { StrapiApp } from '@strapi/strapi/admin';
import {
    Bold,
    Italic,
    Essentials,
    List,
    Paragraph,
    Table,
    BlockQuote
} from 'ckeditor5';
import {
    setPluginConfig,
} from '@_sh/strapi-plugin-ckeditor';


const myCustomPreset = {
    name: 'Custom',
    description: 'Custom',
    editorConfig: {
        licenseKey: 'GPL',
        plugins: [
            Bold,
            Italic,
            Essentials,
            List,
            Paragraph,
            Table,
            BlockQuote,
        ],
        toolbar: [
            'bold',
            'italic',
            'bulletedList',
            'insertTable',
            'blockquote',
            'undo',
            'redo',
        ],
    },
};

const myConfig = {
    presets: [myCustomPreset],
};

export default {
    config: {
        locales: ['pt-BR'],
    },
    bootstrap(app: StrapiApp) {
        console.log(app);
    },
    register() {
        setPluginConfig(myConfig);
    }
};
