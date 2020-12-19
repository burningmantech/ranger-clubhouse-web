import Route from '@ember/routing/route';

export default class MePasswordRoute extends Route {
  queryParams = {
    token: { refreshModel: true}
  };

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('password', {
      password_old: '',
      password: '',
      password_confirmation: ''
    });
  }
}
