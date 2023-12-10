import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import LoginValidations from 'clubhouse/validations/login';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import ENV from 'clubhouse/config/environment';

export default class LoginController extends ClubhouseController {
  queryParams = [ 'token', 'welcome'];

  loginValidations = LoginValidations;

  @tracked isSubmitting = false;
  @tracked loginError = null;
  @tracked tokenError = null;

  /*

    TODO if Okta is to be used:
    1. Set the redirect_uri from either config/environment.js OR dynamically construct
       from thewindow.location path.
    2. Use the /api/config values to populate baseUrl, clientId, issuer fields.

    import OktaSignIn from '@okta/okta-signin-widget';

    @action
    setupSSO() {
      const config = {
        baseUrl: '<FILL ME>',
        clientId: '<FILL ME>',
        redirectUri: '<FILL ME>',
        logo: '<FILL ME>',
        authParams: {
          issuer: '<FILL ME>',
          responseType: 'code',
          state: false,
          display: 'page'
        }
      };

      this.ssoWidget = new OktaSignIn(config).renderEl(
          { el: '#okta-sso-widget' },
          function (res) {
            console.log('OKTA response', res);
          }
      );
    }

    @action
    destroySSO() {
      if (this.ssoWidget) {
        this.ssoWidget.destroy();
        this.ssoWidget = null;
      }
    }
  */

  get isTryingToOAuthAuthenticate() {
    return (this.session.attemptedTransition?.targetName === 'me.oauth2-grant');
  }

  @action
  submit(model, isValid) {
    if (!isValid)
      return;

    this.loginError = null;
    this.tokenError = null;
    const credentials = {
      identification: model.identification,
      password: model.password
    };

    // For analytics
    credentials.screen_size = {
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };

    credentials.build_timestamp = ENV.APP.buildTimestamp;

    this.isSubmitting = true;

    this.session.authenticate('authenticator:jwt', credentials)
      .catch((response) => {
        if (response.status === 401) {
          const data = response.json ? response.json : response.payload;
          this.loginError = (data ? data.status : `Unknown error ${JSON.stringify(data)}`);
          model.password = '';
        } else {
          this.house.handleErrorResponse(response)
        }
      }).finally(() => {
        this.isSubmitting = false;
        this.house.scrollToTop();
      });
  }
}
