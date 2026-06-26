import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsShiftCommandPhotoBoardRoute extends ClubhouseRoute {
  setupController(controller) {
    this.session.showingPhotoBoard = true;
    controller.setupTimer();
  }

  resetController(controller) {
    this.session.showingPhotoBoard = false;
    controller.serverTime = null;
    controller.groups = null;
    controller.currentGroupIndex = 0;
    controller.destroyTimer();
  }
}
