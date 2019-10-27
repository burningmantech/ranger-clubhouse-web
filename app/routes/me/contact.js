import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeContactRoute extends Route.extend(MeRouteMixin) {
  queryParams = {
    // No refresh model needed - provided so external documents can
    // link to the contact page and have the callsign prefilled.
    callsign: { }
  };

  beforeModel() {
    if (!this.session.user.isRanger) {
      this.toast.error('Sorry, you are not an active Ranger and may not send contact messages.');
      this.transitionTo('me.overview');
    }
  }

  model({ callsign }) {
    this.set('callsign', callsign);
  }

  setupController(controller) {
    controller.set('searchForm.callsign', this.callsign);
    controller.set('noMatch', null);
    if (this.callsign) {
      controller._performSearch(controller.searchForm);
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('callsign', null);
      controller.set('foundCallsigns', []);
    }
  }
}
