import Route from '@ember/routing/route';

export default class MeAnnouncementsRoute extends Route {
  model() {
    return this.ajax.request('motd/bulletin', { data: { type: 'active', page_size: 100 }});
  }

  setupController(controller, model) {
    const motd = model.motd;
    motd.sort((a,b) => (a.has_read ? 1 : 0) - (b.has_read ? 1 : 0));
    controller.set('motds', motd);
    controller.set('motdMeta', model.meta);
  }
}
