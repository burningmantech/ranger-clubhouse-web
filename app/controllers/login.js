import Controller from '@ember/controller';
import LoginValidations from 'clubhouse/validations/login';
import ENV from 'clubhouse/config/environment';
import { action } from '@ember-decorators/object';

export default class LoginController extends Controller {
  loginValidations = LoginValidations;
  isSubmitting = false;

  apiLogin(credentials) {
    this.set('isSubmitting', true);
    return this.session.authenticate('authenticator:jwt', credentials)
          .catch((response) => {
            if (response.status == 401) {
              const data = response.json ? response.json : response.payload;
              this.toast.error(data.error);
            } else {
              this.house.handleErrorResponse(response)
            }
          }).finally(() => this.set('isSubmitting', false));
  }

  setCookie(name, value, days) {
    let expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  @action
  submit(model, isValid) {
    if (!isValid)
      return;

    this.toast.clear();
    let credentials = model.getProperties('identification', 'password');

    if (!ENV['dualClubhouse']) {
      // Not running in Dual Clubhouse mode ..
      return this.apiLogin(credentials);
    }

    //
    // Attempt to authorize with Classic Clubhouse before trying for
    // Clubhouse 2.0
    //

    return this.ajax.post(ENV['clubhouseClassicUrl']+'/?DMSc=security&DMSm=login&json=1',
      {
        headers: {
          // Avoid CORS pre-flight
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        data: { email: credentials.identification, password: credentials.password },
      }
    ).then((response) => {
      // So far, so good. set the clubhouse classic PHP session cookie,
      // and then try for Clubhouse 2.0 authentication.
      const session = response.session;
      this.setCookie(session.name, session.id);
      return this.apiLogin(credentials);
    })
    .catch((response) => {
        this.house.handleErrorResponse(response);
    }).finally(() => this.set('isSubmitting', false));
  }
}
