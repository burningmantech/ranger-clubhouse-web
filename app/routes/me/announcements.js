import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeAnnouncementsRoute extends ClubhouseRoute {
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
