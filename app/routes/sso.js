import Route from '@ember/routing/route';

/*
 * SSO login route
 *
 * The idea is pretty simple: the SSO server will redirect to this route with
 * a code query parameter. Said code is sent down to the backend for verification
 * and if successful, a Clubhouse JWT token is returned and the user is logged in.
 *
 */

export default class SsoRoute extends Route {
  queryParams = {
    code: { refreshModel: true }
  };

  model({ code }) {
    // For analytics
    const credentials = {
      sso_code: code,
      screen_size: {
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      }
    }

    return this.session.authenticate('authenticator:jwt', credentials)
      .catch((response) => {
        if (response.status == 401) {
          const data = response.json ? response.json : response.payload;
          return { status: (data ? data.status : `Unknown error ${JSON.stringify(data)}`) };
        } else {
          this.house.handleErrorResponse(response)
        }
      });
  }

  setupController(controller, model) {
    controller.set('loginError', model ? model.status : 'pending');
  }
}
