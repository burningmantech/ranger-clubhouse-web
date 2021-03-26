import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import Login from 'clubhouse/models/login';
import ENV from 'clubhouse/config/environment';

export default class LoginRoute extends ClubhouseRoute {
  authRequired = false;

  queryParams = {
    token: { refreshModel: true },
    welcome: { refreshModel: true}
  }

  beforeModel() {
    super.beforeModel(...arguments);
    this.session.prohibitAuthentication('me.homepage');
  }

  // Either render the login page, or attempt to login using a temporary login token.
  model({token, welcome}) {
    if (!token) {
      this.session.tempLoginToken = null;
      return null; // Not preforming a password reset login or PNV account setup
    }

    this.session.tempLoginToken = token;
    this.session.isWelcome = welcome;

    // For analytics
    const credentials = {
      temp_token: token,
      build_timestamp: ENV.APP.buildTimestamp,
      screen_size: {
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      },
    };

    /*
      Slight bit of magic here - If the token is valid, route/application.js sessionAuthenticated() is
      called and the route transition to the password change form will happen there. For an error,
      the login page will render.
     */
    return this.session.authenticate('authenticator:jwt', credentials)
       .catch((response) => {
        this.session.tempLoginToken = null;
        if (response.status == 401) {
          const data = response.json ? response.json : response.payload;
          return (data ? data.status : `Unknown error ${JSON.stringify(data)}`);
        } else {
          this.house.handleErrorResponse(response)
        }
      });
  }

   setupController(controller, model) {
    controller.set('tokenError', model);
    controller.set('authForm', new Login);
    this.house.clearStorage();
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('token', null);
      controller.set('welcome', null);
    }
  }
}
