import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeOverviewRoute extends Route.extend(MeRouteMixin) {
  model() {
    this.store.unloadAll('motd');
    return this.store.query('motd', {});
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    const person = this.modelFor('me');

    controller.set('photo', null);
    controller.set('motds', model);

    if (!person.isPastProspective && !person.isAuditor) {
      this.ajax.request(`person/${this.session.userId}/photo`)
        .then((result) => controller.set('photo', result.photo))
        .catch(() => {
          controller.set('photo', { status: 'error', message: 'There was a server error.' });
        })
    }
  }
}
