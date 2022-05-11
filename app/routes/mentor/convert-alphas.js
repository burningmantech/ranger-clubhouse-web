import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import Selectable from 'clubhouse/utils/selectable';

export default class MentorConvertRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('mentor/verdicts');
  }

  setupController(controller, model) {
    const {alphas} = model;
    controller.set('alphas', alphas);
    controller.set('passAll', false);
    controller.set('bonkAll', false);
    controller.set('passed', alphas.filter((a) => a.mentor_status === 'pass').map((a) => new Selectable(a)));
    controller.set('bonked', alphas.filter((a) => (a.mentor_status === 'bonk' || a.mentor_status === 'self-bonk')).map((a) => new Selectable(a)));
    controller.set('isSubmitting', false);
  }
}
