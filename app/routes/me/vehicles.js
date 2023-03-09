import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import { MOTORPOOL_POLICY_TAG, PERSONAL_VEHICLE_AGREEMENT_TAG } from 'clubhouse/models/document';

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
      vehicleConfig: this.ajax.request('vehicle/config').then(({config}) => config)
    });
  }

  setupController(controller, model) {
    const {agreements} = model;
    controller.set('vehicles', model.vehicles);
    controller.set('vehicleConfig', model.vehicleConfig);
    controller.set('year', this.year);
    controller.set('motorpoolPolicySigned', !!agreements.find((a) => a.tag === MOTORPOOL_POLICY_TAG && a.signed));
    controller.set('personalVehicleSigned', !!agreements.find((a) => a.tag === PERSONAL_VEHICLE_AGREEMENT_TAG && a.signed));
    controller.showAgreementTag = null;
  }
}
