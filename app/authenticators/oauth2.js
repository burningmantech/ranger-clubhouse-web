import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'clubhouse/config/environment';

export default class OAuth2Authenticator extends OAuth2PasswordGrant {
  serverTokenEndpoint = ENV['api-server'] + '/auth/oauth2/token';

  makeRequest(serverTokenEndpoint, data, headers) {
    return super.makeRequest(serverTokenEndpoint, {
      ...data,
      build_timestamp: ENV.APP.buildTimestamp,
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    }, headers);
  }
}
