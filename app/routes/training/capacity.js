import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import _ from 'lodash';

export default class TrainingCapacityRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const training = this.modelFor('training');
    this.year = requestYear(params);
    return this.ajax.request(`training/${training.id}/capacity`, {data: {year: this.year}});
  }

  setupController(controller, {slots, unique_trainers}) {
    controller.set('year', this.year);
    controller.slots = slots;
    controller.uniqueTrainers = unique_trainers;
    controller.training = this.modelFor('training');
    controller.totalSeats = _.sumBy(slots, 'max');
    controller.totalSignups = _.sumBy(slots, 'signed_up');
    controller.totalMax = _.sumBy(slots, 'max');
    controller.totalPNVs = _.sumBy(slots, 'pnv_count');
    controller.totalVets = _.sumBy(slots, 'veteran_count');
    controller.totalAuditors = _.sumBy(slots, 'auditor_count');
    controller.totalPassed = _.sumBy(slots, 'passed');
    controller.totalNotPassed = _.sumBy(slots, 'not_passed');
  }

  // Don't allow the year parameter to bleed over to other routes.
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
