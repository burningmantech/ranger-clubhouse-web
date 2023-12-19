import RSVP from 'rsvp';
import {isEmpty} from '@ember/utils';
import {run, cancel} from '@ember/runloop';
import {waitFor} from '@ember/test-waiters';
import ENV from 'clubhouse/config/environment';
import Base from 'ember-simple-auth/authenticators/base';

/**
 * Retrieve an oauth2 token using a password reset temporary token.
 *
 * Based on  ember-simple-auth's oauth2 authenticator.
 */

export default class TempTokenAuthenticator extends Base {
  serverTokenEndpoint = ENV['api-server'] + '/auth/oauth2/temp-token';

  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      const now = new Date().getTime();
      if (!isEmpty(data['expires_at']) && data['expires_at'] < now) {
        reject();
      } else if (!this._validate(data)) {
        reject();
      } else {
        resolve(data);
      }
    });
  }

  authenticate(token) {
    return new RSVP.Promise((resolve, reject) => {
      this.makeRequest(this.serverTokenEndpoint, {
        token,
        build_timestamp: ENV.APP.buildTimestamp,
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      }).then(response => {
        run(() => {
          if (!this._validate(response)) {
            reject('access_token is missing in server response');
          }
          const expiresAt = this._absolutizeExpirationTime(response['expires_in']);
          if (!isEmpty(expiresAt)) {
            response = Object.assign(response, {
              'expires_at': expiresAt
            });
          }
          resolve(response);
        });
      }, response => {
        run(null, reject, response);
      });
    });
  }


  /**
   If token revocation is enabled, this will revoke the access token (and the
   refresh token if present). If token revocation succeeds, this method
   returns a resolving promise, otherwise it will return a rejecting promise,
   thus intercepting session invalidation.
   If token revocation is not enabled this method simply returns a resolving
   promise.
   @method invalidate
   @param {Object} data The current authenticated session data
   @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being invalidated. If invalidation fails, the promise will reject with the server response (in case token revocation is used); however, the authenticator reads that response already so if you need to read it again you need to clone the response object first
   @public
   */
  invalidate(data) {
    const serverTokenRevocationEndpoint = this.serverTokenRevocationEndpoint;

    function success(resolve) {
      cancel(this._refreshTokenTimeout);
      delete this._refreshTokenTimeout;
      resolve();
    }

    return new RSVP.Promise(resolve => {
      if (isEmpty(serverTokenRevocationEndpoint)) {
        success.apply(this, [resolve]);
      } else {
        const requests = [];
        ['access_token', 'refresh_token'].forEach(tokenType => {
          const token = data[tokenType];
          if (!isEmpty(token)) {
            requests.push(this.makeRequest(serverTokenRevocationEndpoint, {
              'token_type_hint': tokenType,
              token
            }));
          }
        });
        const succeed = () => {
          success.apply(this, [resolve]);
        };
        RSVP.all(requests).then(succeed, succeed);
      }
    });
  }


  /**
   Makes a request to the OAuth 2.0 server.
   @method makeRequest
   @param {String} url The request URL
   @param {Object} data The request data
   @param {Object} headers Additional headers to send in request
   @return {Promise} A promise that resolves with the response object
   @protected
   */
  makeRequest = waitFor(function (url, data, headers = {}) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    const body = Object.keys(data).map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`;
    }).join('&');
    const options = {
      body,
      headers,
      method: 'POST'
    };
    return new RSVP.Promise((resolve, reject) => {
      fetch(url, options).then(response => {
        response.text().then(text => {
          try {
            let json = JSON.parse(text);
            if (!response.ok) {
              response.responseJSON = json;
              reject(response);
            } else {
              resolve(json);
            }
          } catch (SyntaxError) {
            response.responseText = text;
            reject(response);
          }
        });
      }).catch(reject);
    });
  })

  _absolutizeExpirationTime(expiresIn) {
    if (!isEmpty(expiresIn)) {
      return new Date(new Date().getTime() + expiresIn * 1000).getTime();
    }
  }

  _validate(data) {
    return !isEmpty(data['access_token']);
  }
}
