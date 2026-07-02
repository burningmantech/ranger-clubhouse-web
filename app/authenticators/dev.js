import RSVP from 'rsvp';
import {isEmpty} from '@ember/utils';
import {waitFor} from '@ember/test-waiters';
import ENV from 'clubhouse/config/environment';
import Base from 'ember-simple-auth/authenticators/base';

/**
 * Development-only authenticator: exchanges a bare callsign for a real session
 * token, no password required. Mirrors oauth2.js/temptoken.js's request/response
 * handling. The actual security boundary is server-side (the API only registers
 * /auth/dev-login when running locally) - this environment check is just to keep
 * the authenticator from doing anything if it's ever wired up outside dev.
 */

export default class DevAuthenticator extends Base {
  serverTokenEndpoint = ENV['api-server'] + '/auth/dev-login';

  restore(data) {
    return this._validate(data) ? RSVP.resolve(data) : RSVP.reject();
  }

  authenticate(callsign) {
    if (ENV.environment !== 'development') {
      return RSVP.reject('dev authenticator is development-only');
    }

    return new RSVP.Promise((resolve, reject) => {
      this.makeRequest(this.serverTokenEndpoint, {callsign}).then(response => {
        if (!this._validate(response)) {
          reject('access_token is missing in server response');
          return;
        }
        resolve(response);
      }, reject);
    });
  }

  invalidate() {
    return RSVP.resolve(); // no token revocation endpoint for dev-login
  }

  makeRequest = waitFor(function (url, data, headers = {}) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const body = Object.keys(data).map(key =>
      `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
    ).join('&');

    return new RSVP.Promise((resolve, reject) => {
      fetch(url, {body, headers, method: 'POST'}).then(response => {
        response.text().then(text => {
          try {
            const json = JSON.parse(text);
            response.ok ? resolve(json) : reject(Object.assign(response, {responseJSON: json}));
          } catch {
            reject(Object.assign(response, {responseText: text}));
          }
        });
      }).catch(reject);
    });
  })

  _validate(data) {
    return !isEmpty(data['access_token']);
  }
}
