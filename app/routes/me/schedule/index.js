import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeScheduleIndexRoute extends ClubhouseRoute {
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
