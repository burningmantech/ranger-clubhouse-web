import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import Selectable from 'clubhouse/utils/selectable';
import currentYear from 'clubhouse/utils/current-year';

export default class MentorConvertRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('mentor/eligible-alphas');
  }

  setupController(controller, model) {
    controller.set('prospectives', model.prospectives.map((p) => new Selectable(p)));
    controller.set('isSubmitting', false);
    controller.set('selectedAll', false);
    controller.set('year', currentYear());
  }
}
