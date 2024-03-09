import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {service} from '@ember/service';

export default class MeVehiclesRoute extends ClubhouseRoute {
  @service modal;

  async model() {
    const year = this.house.currentYear();
    this.year = year;
    const person = this.modelFor('me'), user = this.session.user;

    if (!user.motorpool_policy_enabled) {
      this.modal.info(
        'Motorpool Policy Agreement Not Available Yet',
        'Once the Motorpool Policy is available, and IF you are eligible to submit a MVR Request, or Personal Vehicle Request, the page will accessible.'
      );
      this.router.transitionTo('me.homepage');
      return;
    }

    if (!user.allowVehicleDashboardAccess) {
      this.modal.info(
        'Not Eligible',
        'Sorry, it appears at this time you are ineligible to submit either MVR request, nor a Personal Vehicle request.');
      this.router.transitionTo('me.homepage');
      return;
    }

    const info = (await this.ajax.request(`vehicle/info/${person.id}`)).info;

    let vehicles;
    if (info.pvr_eligible) {
      vehicles = await this.store.query('vehicle', {person_id: this.session.userId, event_year: year});
    } else {
      vehicles = null;
    }

    return {
      info,
      person,
      vehicles,
    };
  }

  setupController(controller, model) {
    controller.set('vehicles', model.vehicles);
    controller.set('vehicleInfo', model.info);
    controller.set('person', model.person);
    controller.set('year', this.year);
    controller.showAgreementTag = null;
  }
}
