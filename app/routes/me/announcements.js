import Route from '@ember/routing/route';

export default class MeAnnouncementsRoute extends Route {
  model() {
    return this.ajax.request('motd/bulletin', { data: { type: 'active', page_size: 100 }});
  }

  setupController(controller, model) {
    controller.set('motds', model.motd);
    controller.set('motdMeta', model.meta);
  }
}
