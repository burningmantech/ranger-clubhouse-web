import AjaxService from 'ember-ajax/services/ajax';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import ENV from 'clubhouse/config/environment';

/*
 * Extend the Ajax service to add the JWT to the header for all requests.
 */

export default class extends AjaxService {
  @service session;

  host = ENV['api-server'];
  contentType = 'application/json; charset=utf-8';

  @computed('session.data.authenticated.token')
  get headers() {
    let headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.token}`;
    }
    return headers;
  }
}
