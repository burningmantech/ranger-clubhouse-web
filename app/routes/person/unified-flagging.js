import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {INTAKE, REGIONAL_MANAGEMENT} from 'clubhouse/constants/roles';

export default class PersonUnifiedFlaggingRoute extends ClubhouseRoute {
  roleRequired = [ INTAKE, REGIONAL_MANAGEMENT ];

  model() {
    const year = this.house.currentYear();
    const personId = this.modelFor('person').id;

    this.year = year;
    return this.ajax.request(`intake/${personId}/history`, {data: {year}});
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('history', model.person);
    controller.set('year', this.year);
  }
}
