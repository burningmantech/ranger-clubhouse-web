import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeTicketsRoute extends Route.extend(MeRouteMixin) {
  beforeModel() {
    const user = this.session.user;
    if (user.isAuditor || user.isPastProspective || user.isProspectiveWaitlist) {
      this.toast.error('Auditors, past prospectives, and prospective waitlisted do not have access to this page.');
      this.transitionTo('me.overview');
    }
  }

  model() {
    return RSVP.hash({
      ticketingInfo: this.ajax.request('ticketing/info')
                .then((results) => results.ticketing_info ),
      ticketPackage: this.ajax.request(`ticketing/${this.session.user.id}/package`)
                .then((results) => results.package)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
  }
}
