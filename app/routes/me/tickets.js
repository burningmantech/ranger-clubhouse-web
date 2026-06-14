import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeTicketsRoute extends ClubhouseRoute {
  beforeModel() {
    const user = this.session.user;
    if (user.isAuditor || user.isPastProspective) {
      this.toast.error('Auditors and  past prospectives do not have access to this page.');
      this.router.transitionTo('me.homepage');
    } else {
      super.beforeModel(...arguments);
    }
  }

  async model() {
    // Record when the user hit the ticketing page, ignore any response.
    this.ajax.request(`person-event/${this.session.userId}/progress`, {method: 'POST', data: {milestone: 'ticket-visited'}});

    return {
      ticketingInfo: (await this.ajax.request('ticketing/info')).ticketing_info,
      ticketingPackage: (await this.ajax.request(`ticketing/${this.session.userId}/package`)).package,
    };
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('me'));
    controller.set('ticketingInfo', model.ticketingInfo);
    controller.set('ticketingPackage', model.ticketingPackage);
  }
}
