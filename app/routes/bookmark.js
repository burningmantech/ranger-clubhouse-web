import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {getOwner} from '@ember/application';

export default class BookmarkRoute extends ClubhouseRoute {
  authRequired = false;

  model({bookmark_id}) {
    return bookmark_id;
  }

  async setupController(controller, bookmarkId) {
    controller.content = null;
    controller.bookmarkId = bookmarkId;
    controller.refreshTime = 0;
    controller.countdown = 0;
    controller.notFound = false;
    controller.setupTick();
    await controller.loadDocument();
    this.session.showingBookmark = true;

    this.session.user = null;
    // Some hackery to get ember-simple-auth to not respond to login / logout events in other windows.
    // Kill the authentication, and remove the local storage listener.
    const applicationInstance = getOwner(this);
    const session = applicationInstance.lookup('session:main');
    session.setProperties({
      isAuthenticated: false,
      authenticator: null,
      'content.authenticated': {}
    });
    const store = applicationInstance.lookup('session-store:local-storage');
    window.removeEventListener('storage', store._handleStorageEvent);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.cancelTick();
      this.session.showingBookmark = false;
    }
  }
}
