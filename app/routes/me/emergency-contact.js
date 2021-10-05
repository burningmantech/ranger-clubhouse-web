import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeEmergencyContactRoute extends ClubhouseRoute {
  beforeModel() {
    const {user} = this.session;
    if (user.isAuditor || user.isPastProspective || user.isProspectiveWaitlist) {
      this.toast.error('Auditors and past prospectives do not have access to this page.');
      this.router.transitionTo('me.homepage');
    } else {
      super.beforeModel(...arguments);
    }
  }

  setupController(controller) {
    controller.set('person', this.modelFor('me'));
  }
}
