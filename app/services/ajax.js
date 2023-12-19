import FetchService from 'ember-ajax-fetch/services/fetch';
import {service} from '@ember/service';
import ENV from 'clubhouse/config/environment';

/*
 * Extend the Ajax service to add the JWT to the header for all requests.
 */

export default class extends FetchService {
  @service session;

  host = ENV['api-server'];
  contentType = 'application/json; charset=utf-8';

  get headers() {
    let headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.bearerToken}`;
    }
    return headers;
  }

  request(url, opts = {}) {
    const data = opts?.data;

    if (data && !(data instanceof FormData)) {
      // Sanitize the parameters
      const newData = {};
      Object.keys(data).forEach((param) => {
        const value = data[param];
        if (value !== null && value !== undefined) {
          newData[param] = value;
        }
      });
      opts.data = newData;
    }

    return super.request(url, opts);
  }
}
