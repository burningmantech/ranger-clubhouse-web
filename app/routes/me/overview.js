import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';

export default class MeOverviewRoute extends Route.extend(MeRouteMixin) {
  model() {
    const person = this.modelFor('me');

    const hash = {
      bullentins: this.ajax.request('motd/bulletin', { data: { type: 'unread', page_size: 100 }}),
      milestones: this.ajax.request(`person/${person.id}/milestones`).then((result) => result.milestones)
    };

    // Auditors and past prospectives do no have photos
    if (!person.isPastProspective && !person.isAuditor) {
      hash.photo = this.ajax.request(`person/${person.id}/photo`).then((result) => result.photo)
    }

    return RSVP.hash(hash);
  }

  setupController(controller, model) {
    const bullentins = model.bullentins;
    super.setupController(...arguments);
    controller.set('photo', model.photo);
    controller.set('motds', bullentins.motd);
    controller.set('motdsMeta', bullentins.meta.total);
    controller.set('milestones', model.milestones);
    controller.set('showUploadDialog', false);
  }
}
