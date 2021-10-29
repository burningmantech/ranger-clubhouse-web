import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class MeHomepageRoute extends ClubhouseRoute {
  model() {
    const user = this.session.user;

    const hash = {
      bullentins: this.ajax.request('motd/bulletin', { data: { type: 'unread', page_size: 100 }}),
      milestones: this.ajax.request(`person/${user.id}/milestones`).then((result) => result.milestones),
      years: this.ajax.request(`person/${user.id}/years`)
    };

    // Auditors and past prospectives do no have photos
    if (!user.isPastProspective && !user.isAuditor) {
      hash.photo = this.ajax.request(`person/${user.id}/photo`).then(({photo}) => photo)
      hash.agreements = this.ajax.request(`agreements/${user.id}`).then(({agreements}) => agreements)
    }

    return RSVP.hash(hash);
  }

  setupController(controller, model) {
    const bullentins = model.bullentins;
    controller.set('person', this.modelFor('me'));
    controller.set('photo', model.photo);
    controller.set('motds', bullentins.motd);
    controller.set('motdsMeta', bullentins.meta.total);
    controller.set('milestones', model.milestones);
    controller.set('years', model.years);
    controller.set('showUploadDialog', false);
  }
}
