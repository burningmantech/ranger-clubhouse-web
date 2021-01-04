import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class MeTicketsRoute extends Route {
  beforeModel() {
    const user = this.session.user;
    if (user.isAuditor || user.isPastProspective || user.isProspectiveWaitlist) {
      this.toast.error('Auditors, past prospectives, and prospective waitlisted do not have access to this page.');
      this.transitionTo('me.homepage');
    }
  }

  model() {
    return RSVP.hash({
      ticketingInfo: this.ajax.request('ticketing/info')
                .then((results) => results.ticketing_info ),
      ticketPackage: this.ajax.request(`ticketing/${this.session.userId}/package`)
                .then((results) => results.package)
    });
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.set('person', this.modelFor('me'));
  }
}
