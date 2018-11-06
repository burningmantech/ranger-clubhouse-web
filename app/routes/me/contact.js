import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeContactRoute extends Route.extend(MeRouteMixin) {
  beforeModel() {
    if (!this.session.user.isRanger) {
      this.toast.danger('Sorry, you are not an active Ranger and may not send contact messages.');
      this.transitionTo('me.overview');
    }
  }
}
