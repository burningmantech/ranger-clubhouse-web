import Route from '@ember/routing/route';

export default class MeEmergencyContactRoute extends Route {
  beforeModel() {
    const user = this.session.user;
    if (user.isAuditor || user.isPastProspective || user.isProspectiveWaitlist) {
      this.toast.error('Auditors and past prospectives do not have access to this page.');
      this.transitionTo('me.homepage');
    }
  }

  setupController(controller) {
    controller.set('person', this.modelFor('me'));
  }
}
