import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class MeVehiclesRoute extends ClubhouseRoute {
  beforeModel() {
    if (!this.session.user.may_request_stickers) {
      this.toast.error('Sorry, you are not approved to request vehicle stickers and other items.');
      this.router.transitionTo('me.homepage');
    } else {
      super.beforeModel(...arguments);
    }
  }

  model() {
    const year = this.house.currentYear();
    this.year = year;
    return RSVP.hash({
      vehicles: this.store.query('vehicle', { person_id: this.session.userId, event_year: year }),
      agreements: this.ajax.request(`agreements/${this.session.userId}`).then(({agreements}) => agreements),
    });
  }

  setupController(controller, model) {
    const {agreements} = model;
    controller.set('vehicles', model.vehicles);
    controller.set('year', this.year);
    controller.set('motorpoolPolicySigned', !!agreements.find((a) => a.tag === 'motorpool-policy' && a.signed));
    controller.set('personalVehicleSigned', !!agreements.find((a) => a.tag === 'personal-vehicle-agreement' && a.signed));
  }
}
