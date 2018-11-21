import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class PersonIndexRoute extends Route {
  model() {
    const model = this.modelFor('person');
    const personId = model.person.id;

    return RSVP.hash({
      yearInfo: model.yearInfo,
      personPositions: this.ajax.request(`person/${personId}/positions`).then((results) => results.positions),
      positions: this.ajax.request('position').then((results) => results.position),
      personRoles: this.ajax.request(`person/${personId}/roles`).then((results) => results.roles),
      roles: this.ajax.request('role').then((results) => results.role),
    });
  }

  setupController(controller, model) {
    const parent = this.modelFor('person');
    super.setupController(...arguments);
    controller.setProperties(parent);
    controller.setProperties(model);

    // Retrieving the photo may cause a delay, hence its here and not in model()
    controller.set('photo', null);
    this.ajax.request(`person/${parent.person.id}/photo`)
          .then((result) => controller.set('photo', result.photo))
          .catch(() => {
            controller.set('photo', { status: 'error', message: 'There was a server error.'});
          });
  }
}
