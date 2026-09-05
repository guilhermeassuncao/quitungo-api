import type { Core } from '@strapi/strapi';

/**
 * Dispara o build do site estático (GitHub Actions) sempre que um conteúdo
 * muda no Strapi. Sem isso, quem edita no painel não vê nada mudar no site
 * até alguém rodar o deploy à mão.
 *
 * Requer no ambiente:
 *   GITHUB_DEPLOY_TOKEN  token com permissão "Actions: write" no repo do site
 *   GITHUB_DEPLOY_REPO   ex.: guilhermeassuncao/quitungo-astro
 *
 * Várias edições em sequência geram um único build (espera 90 s de silêncio).
 */
const MODELOS_QUE_DISPARAM_DEPLOY = [
  'api::pagina.pagina',
  'api::historia.historia',
  'api::amigo.amigo',
  'api::categoria.categoria',
];

const ESPERA_MS = 90_000;

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const token = process.env.GITHUB_DEPLOY_TOKEN;
    const repo = process.env.GITHUB_DEPLOY_REPO;

    if (!token || !repo) {
      strapi.log.warn(
        '[deploy] GITHUB_DEPLOY_TOKEN ou GITHUB_DEPLOY_REPO não definidos. O site não será reconstruído automaticamente ao editar conteúdo.'
      );
      return;
    }

    let timer: NodeJS.Timeout | null = null;

    const dispararDeploy = async (motivo: string) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'strapi-content-updated',
            client_payload: { motivo, em: new Date().toISOString() },
          }),
        });
        if (res.status === 204) {
          strapi.log.info(`[deploy] build do site disparado (${motivo})`);
        } else {
          strapi.log.error(`[deploy] GitHub respondeu ${res.status}: ${await res.text()}`);
        }
      } catch (e) {
        strapi.log.error(`[deploy] falha ao chamar o GitHub: ${(e as Error).message}`);
      }
    };

    const agendar = (motivo: string) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void dispararDeploy(motivo);
      }, ESPERA_MS);
    };

    strapi.db.lifecycles.subscribe({
      models: MODELOS_QUE_DISPARAM_DEPLOY,
      afterCreate(event) { agendar(`${event.model.uid} criado`); },
      afterUpdate(event) { agendar(`${event.model.uid} alterado`); },
      afterDelete(event) { agendar(`${event.model.uid} removido`); },
      afterDeleteMany(event) { agendar(`${event.model.uid} removidos`); },
    });

    strapi.log.info(`[deploy] rebuild automático ativo para ${repo}`);
  },
};
