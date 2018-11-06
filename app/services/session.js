import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import RSVP from 'rsvp';

export default SessionService.extend({
  store: service(),

  loadUser() {
    return new RSVP.Promise((resolve, reject) => {
      if (!this.isAuthenticated) {
        resolve();
        return;
      }
      const personId = this.get('session.authenticated.person_id');
      return this.store.find('person', personId).then((user) => {
        this.set('user', user);
        resolve();
      }, reject);
    });
  }
});
