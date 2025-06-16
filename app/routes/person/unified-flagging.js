import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, INTAKE, REGIONAL_MANAGEMENT} from 'clubhouse/constants/roles';
import {forEach} from 'lodash';

export default class PersonUnifiedFlaggingRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, INTAKE, REGIONAL_MANAGEMENT];

  model() {
    const year = this.house.currentYear();
    const personId = this.modelFor('person').id;

    this.year = year;
    return this.ajax.request(`intake/${personId}/history`, {data: {year}});
  }

  setupController(controller, model) {
    controller.person = this.modelFor('person');
    controller.history = model.person;
    controller.year = this.year;
    controller.pnvHistory = [];
    let didPass = false;
    forEach(controller.history.pnv_history, (result, year) => {
      if (result.mentor_status === 'pass') {
        didPass = true;
      } else {
        result.passedPreviously = didPass;
      }
      controller.pnvHistory.push({year, ...result});
    })
  }
}
