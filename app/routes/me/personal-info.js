import Route from '@ember/routing/route';

export default class MePersonInfoRoute extends Route {
  setupController(controller) {
    controller.set('person', this.modelFor('me'));
    controller.set('isSaved', false);
  }
}
