import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class MeVehiclesRoute extends Route {
  beforeModel() {
    if (!this.session.user.may_request_stickers) {
      this.toast.error('Sorry, you are not approved to request vehicle stickers and other tiems.');
      this.transitionTo('me.overview');
    }
  }

  model() {
    const year = this.house.currentYear();
    this.year = year;
    return RSVP.hash({
      vehicles: this.store.query('vehicle', { person_id: this.session.userId, event_year: year }),
      personEvent: this.store.findRecord('person-event', `${this.session.userId}-${year}`, { reload: true })
    });
  }

  setupController(controller, model) {
    controller.set('vehicles', model.vehicles);
    controller.set('personEvent', model.personEvent);
    controller.set('year', this.year);
    controller.set('documentLoaded', false);
  }
}
