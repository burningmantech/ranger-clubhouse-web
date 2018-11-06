import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'clubhouse/config/environment';

import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  host: ENV['api-server'],
  session: service(),
  headers: computed('session.isAuthenticated', {
    get() {
      let headers = {};
      if (this.session.isAuthenticated) {
        let token = this.get('session.data.authenticated.token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return headers;
    }
  })
});
