import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class PersonIndexRoute extends ClubhouseRoute {
  model() {
    const person = this.modelFor('person');
    const personId = person.id;

    return RSVP.hash({
      eventInfo: person.eventInfo,
      personPositions: this.ajax.request(`person/${personId}/positions`).then((results) => results.positions),
      positions: this.ajax.request('position').then((results) => results.position),
      personRoles: this.ajax.request(`person/${personId}/roles`).then((results) => results.roles),
      roles: this.ajax.request('role').then((results) => results.role),
      photo: this.ajax.request(`person/${person.id}/photo`).then((result) => result.photo)
    });
  }

  setupController(controller, model) {
    const person = this.modelFor('person');
    super.setupController(...arguments);
    controller.set('person', person);
    controller.setProperties(model);
    controller.set('showUploadDialog', false);
    controller.set('showEditNote', false);
    controller.set('showConfirmNoteOrMessage', false);
  }
}
