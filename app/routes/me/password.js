import Route from '@ember/routing/route';

export default class MePasswordRoute extends Route {
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
