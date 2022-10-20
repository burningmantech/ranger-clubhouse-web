import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeContactRoute extends ClubhouseRoute {
  queryParams = {
    // No refresh model needed - provided so external documents can
    // link to the contact page and have the callsign prefilled.
    callsign: { }
  };

  beforeModel() {
    super.beforeModel(...arguments);

    const {user} = this.session;

    if (!user.isActive && !user.isInactive) {
      this.toast.error('Sorry, you are not an active Ranger and may not send contact messages.');
      this.router.transitionTo('me.homepage');
    }
  }

  model({ callsign }) {
    this.callsign = callsign;
  }

  setupController(controller) {
    controller.set('searchForm.callsign', this.callsign);
    controller.set('noMatch', null);
    controller.set('isSearchingParam', false);
    if (this.callsign) {
      controller._performSearch(controller.searchForm, true);
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('callsign', null);
      controller.set('foundCallsigns', []);
    }
  }
}
