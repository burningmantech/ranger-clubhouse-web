import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import currentYear from 'clubhouse/utils/current-year';

export default class MentorConvertRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('mentor/eligible-alphas');
  }

  setupController(controller, model) {
    controller.set('prospectives', model.prospectives);
    controller.set('year', currentYear());
  }
}
