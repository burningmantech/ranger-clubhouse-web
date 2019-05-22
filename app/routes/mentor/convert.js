import Route from '@ember/routing/route';

export default class MentorConvertRoute extends Route {
  model() {
    return this.ajax.request('mentor/verdicts');
  }

  setupController(controller, model) {
    controller.set('alphas', model.alphas);
    controller.set('passAll', false);
    controller.set('bonkAll', false);
  }
}
