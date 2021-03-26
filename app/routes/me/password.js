import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MePasswordRoute extends ClubhouseRoute {
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('password', {
      password_old: '',
      password: '',
      password_confirmation: ''
    });
    controller.set('isPasswordReset', !!this.session.tempLoginToken);
  }
}
