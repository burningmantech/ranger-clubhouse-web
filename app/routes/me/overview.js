import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';

export default class MeOverviewRoute extends Route.extend(MeRouteMixin) {
  model() {
    this.store.unloadAll('motd');
    return RSVP.hash({
      motd: this.store.query('motd', {}),
      milestones: this.ajax.request(`person/${this.session.userId}/milestones`).then((result) => result.milestones)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    const person = this.modelFor('me');

    controller.set('photo', null);
    controller.set('motds', model.motd);
    controller.set('milestones', model.milestones);

    if (!person.isPastProspective && !person.isAuditor) {
      this.ajax.request(`person/${this.session.userId}/photo`)
        .then((result) => controller.set('photo', result.photo))
        .catch(() => {
          controller.set('photo', { status: 'error', message: 'There was a server error.' });
        })
    }
  }
}
