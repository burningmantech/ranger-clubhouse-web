import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import EmberObject from '@ember/object';

export default class LoginRoute extends ClubhouseRoute {
  authRequired = false;

  queryParams = {
    token: {refreshModel: true},
    welcome: {refreshModel: true}
  }

  beforeModel() {
    super.beforeModel(...arguments);
    this.session.prohibitAuthentication('me.homepage');
  }

  // Either render the login page, or attempt to login using a temporary login token.
  async model({token, welcome}) {
    if (!token) {
      this.session.tempLoginToken = null;
      return null; // Not preforming a password reset login or PNV account setup
    }

    this.session.tempLoginToken = token;
    this.session.isWelcome = welcome;

    /*
      Slight bit of magic here - If the token is valid, route/application.js sessionAuthenticated() is
      called and the route transition to the password change form will happen there. For an error,
      the login page will render.
     */

    try {
      await this.session.authenticate('authenticator:temptoken', token);
    } catch (response) {
      if (response.status === 401) {
        const data = response.responseJSON ? response.responseJSON : response.payload;
        return (data ? data.status : `Unknown error ${JSON.stringify(data)}`);
      } else {
        this.house.handleErrorResponse(response)
      }

    }
  }

  setupController(controller, model) {
    controller.set('tokenError', model);
    controller.set('authForm', EmberObject.create({
      identification: '',
      password: ''
    }));
    this.house.clearStorage();
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('token', null);
      controller.set('welcome', null);
    }
  }
}
