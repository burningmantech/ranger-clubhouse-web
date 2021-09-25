import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MePersonInfoRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.set('person', this.modelFor('me'));
    controller.set('isSaved', false);
    controller.set('showUpdateMailingListsDialog', false);
  }
}
