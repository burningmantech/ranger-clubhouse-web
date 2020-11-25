import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeEmergencyContactRoute extends Route.extend(MeRouteMixin) {
  beforeModel() {
    const user = this.session.user;
    if (user.isAuditor || user.isPastProspective || user.isProspectiveWaitlist) {
      this.toast.error('Auditors, past prospectives, and prospective waitlisted do not have access to this page.');
      this.transitionTo('me.homepage');
    }
  }
}
