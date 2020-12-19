import Route from '@ember/routing/route';

export default class MeScheduleIndexRoute extends Route {
  setupController(controller) {
    controller.set('person', this.modelFor('me'));
    controller.setProperties(this.modelFor('me/schedule'));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
