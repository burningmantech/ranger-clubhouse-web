import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeScheduleRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  beforeModel() {
    const user = this.session.user;
    if (user.isPastProspective || user.isBonked) {
      this.toast.error('You are not permitted to sign up for trainings or shifts at this time.');
      this.router.transitionTo('me.homepage');
    } else {
      super.beforeModel(...arguments);
    }
  }

  model({year}) {
    this.year = year;
  }

  setupController(controller) {
    controller.person = this.modelFor('me');
    controller.year = this.year || this.house.currentYear();
  }
}
