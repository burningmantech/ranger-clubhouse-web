import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';

export default class MeOverviewRoute extends Route.extend(MeRouteMixin) {
  model() {
    const person = this.modelFor('me');

    const hash = {
      motd: this.ajax.request('motd/bulletin').then((result) => result.motd),
      milestones: this.ajax.request(`person/${person.id}/milestones`).then((result) => result.milestones)
    };

    // Auditors and past prospectives do no have photos
    if (!person.isPastProspective && !person.isAuditor) {
      hash.photo = this.ajax.request(`person/${person.id}/photo`).then((result) => result.photo)
    }

    return RSVP.hash(hash);
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('photo', model.photo);
    controller.set('motds', model.motd);
    controller.set('milestones', model.milestones);
    controller.set('showUploadDialog', false);
  }
}
