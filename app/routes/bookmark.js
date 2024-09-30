import ClubhouseRoute from "clubhouse/routes/clubhouse-route";

export default class BookmarkRoute extends ClubhouseRoute {
  authRequired = false;

  model({bookmark_id}) {
    return bookmark_id;
  }

  setupController(controller, bookmarkId) {
    controller.content = null;
    controller.bookmarkId = bookmarkId;
    controller.refreshTime = 0;
    controller.countdown = 0;
    controller.notFound = false;
    controller.setupTick();
    controller.loadDocument();
    this.session.showingBookmark = true;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.cancelTick();
      this.session.showingBookmark = false;
    }
  }
}
