import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Login from 'clubhouse/models/login';
import ENV from 'clubhouse/config/environment';

export default class ResetPasswordRoute extends Route.extend(UnauthenticatedRouteMixin) {
  routeIfAlreadyAuthenticated = 'me.homepage';

  queryParams = {
    token: { refreshModel: true}
  };

  model({token}) {
    if (!token) {
      this.session.resetPasswordToken = null;
      return null; // Not preforming a password reset login.
    }

    this.session.resetPasswordToken = token;
    // For analytics
    const credentials = {
      reset_token: token,
      build_timestamp: ENV.APP.buildTimestamp,
      screen_size: {
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      },
    };

    /*
      Slight bit of magic here - If the token is valid, route/application.js sessionAuthenticated() is
      called and the route transition to the password change form will happen there. For an error,
      the reset password page will render.
     */
    return this.session.authenticate('authenticator:jwt', credentials)
      .catch((response) => {
        this.session.resetPasswordToken = null;
        if (response.status == 401) {
          const data = response.json ? response.json : response.payload;
          return (data ? data.status : `Unknown error ${JSON.stringify(data)}`);
        } else {
          this.house.handleErrorResponse(response)
        }
      });
  }

  setupController(controller, model) {
    controller.set('resetTokenError', model);
    controller.set('auth', new Login);
  }
}
