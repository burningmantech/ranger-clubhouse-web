import Route from '@ember/routing/route';

export default class MeScheduleIndexRoute extends Route {
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('person', this.modelFor('me'));
    controller.setProperties(this.modelFor('me/schedule'));
  }
}
