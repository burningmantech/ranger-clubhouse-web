import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class PersonIndexRoute extends Route {
  model() {
    const model = this.modelFor('person');
    const personId = model.person.id;

    return RSVP.hash({
      person: model.person,
      yearInfo: model.yearInfo,
      personPositions: this.ajax.request(`person/${model.person.id}/positions`).then((results) => results.positions),
      positions: this.ajax.request('position').then((results) => results.position),
      personRoles: this.ajax.request(`person/${personId}/roles`).then((results) => results.roles),
      roles: this.ajax.request('role').then((results) => results.role),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('person', model.person);
    controller.set('yearInfo', model.yearInfo);
    controller.set('positions', model.positions);
    controller.set('personPositions', model.personPositions);
    controller.set('personRoles', model.personRoles);
    controller.set('roles', model.roles);

    // Retrieving the photo may cause a delay, hence its here and not in model()
    controller.set('photo', null);
    this.ajax.request(`person/${model.person.id}/photo`)
          .then((result) => controller.set('photo', result.photo))
          .catch(() => {
            controller.set('photo', { status: 'error', message: 'There was a server error.'});
          });
  }
}
