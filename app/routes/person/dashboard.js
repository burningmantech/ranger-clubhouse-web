import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class PersonDashboardRoute extends ClubhouseRoute {

  model() {
    const personId = this.modelFor('person').id;
    return RSVP.hash({
      milestones: this.ajax.request(`person/${personId}/milestones`).then((results) => results.milestones),
      photo: this.ajax.request(`person/${personId}/photo`).then((results) => results.photo)
    });
  }

  setupController(controller, model) {
    controller.set('milestones', model.milestones);
    controller.set('photo', model.photo);
    controller.set('person', this.modelFor('person'));
  }
}
